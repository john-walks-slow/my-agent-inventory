# container-ops — 本机容器运维与系统管理手册

本机（红米 K30S Ultra / apollo，LineageOS 23.2 + Magisk + Termux + chroot-distro Ubuntu 24.04 nobile）的容器是**真 root + 真 chroot**（kernel uid 0），并与 Android 宿主**共享 PID 与 mount namespace**（容器内 PID 1 = `/system/bin/init second_stage`）。
rootfs 位于 `/data/data/com.termux/files/usr/var/lib/chroot-distro/containers/ubuntu/rootfs`。


## 1. 硬件与环境架构

- **设备**：红米 K30S Ultra（apollo），骁龙 865，8GB RAM，ARM64
- **ROM**：LineageOS 23.2（已 root + Magisk）；kernel `4.19.325-cip131-st15-perf`
- **容器形态**：真 root + 真 chroot（kernel uid 0），与 Android 宿主共享 PID + mount namespace；`/dev` 为宿主 Android `/dev`（tmpfs，rbind 全树，含 binderfs/cgroup）。
- **无 systemd**：全部服务均由 supervisord（`/etc/supervisor/conf.d/services.conf`）托管。
- **启动链（Magisk 接管）**：
  ```
  Android boot
    └─ init (PID 1)
         └─ magisk service.d /data/adb/service.d/00-container.sh   [宿主侧，root]
              ├─ 等 $ROOTFS/dev 就绪（实测 ~13s，90s 超时）
              ├─ rm -f rootfs 里的 stub /dev/null urandom random（防遮蔽）
              ├─ busybox mount --rbind /dev  $ROOTFS/dev      （递归，含 binderfs/cgroup）
              ├─ fresh newinstance devpts（gid=5,mode=620,ptmxmode=0666）← canonical
              ├─ tmpfs /dev/shm（size=256M,mode=1777）        ← canonical（宿主无 shm）
              ├─ fresh proc + bind 宿主 /sys（失败回退 fresh sysfs）← canonical
              ├─ bind /apex /odm /product /system /system_ext /vendor
              │   + linkerconfig 文件 + property_contexts    ← canonical system_bindings
              ├─ bind /storage → /storage；/storage/emulated/0 → /sdcard、/mnt/sdcard
              ├─ 全部挂载点 --make-rprivate（断传播）
              └─ sleep 10 → chroot $ROOTFS /opt/start-services.sh
                   └─ supervisord（托管全部服务）
  ```
- **其他宿主 service.d 钩子**：`04-flclash-vpn.sh`（VPN 自启）、`05-termux-ptmx.sh`（Termux ptmx 修复）、`06-zram-8g.sh`（swap 8G）。
- **单一权威原则**：挂载唯一由宿主 `00-container.sh` 每次 boot 幂等完成；容器侧 `/opt/start-services.sh` **零设备/mount 自愈**，只做只读断言（/proc /sys /devpts 缺失即 FATAL）。**不要往容器侧脚本加回任何自愈或双保险**。
- **boot 诊断日志**：宿主 `/data/container-boot.log`。


## 2. 挂载现状速查

```bash
# 在容器内看内核挂载表
mount | grep -E ' /dev | /dev/pts | /proc | /sys | /dev/shm | /storage | /system '

# 期待状态（canonical）：
#   /dev      → tmpfs（宿主 Android /dev，mode=755，含 binderfs/cgroup 子挂载）
#   /dev/pts  → devpts newinstance, gid=5, mode=620, ptmxmode=0666（容器独立 pty 池）
#   /dev/shm  → tmpfs size=256M, mode=1777
#   /proc     → proc（fresh，从不 bind）
#   /sys      → sysfs（bind 宿主，非 fresh）
#   /system /apex /vendor /storage /sdcard → 宿主 Android 目录 bind
```


## 3. devfs 故障排查（/dev /proc /sys 规范）

### 3.1 铁律
**绝对不要往 rootfs 的 `/dev` `/proc` `/sys` 里 mknod 或重定向创建文件。**
1. `/dev` 是宿主 Android /dev 的 rbind，写文件会直接写进宿主 `/dev`，影响整机；
2. rootfs 实体在 `/data/data` 下，mknod 的节点会被 SELinux 打上 `app_data_file` 标签导致 EACCES；
3. 重定向创建的普通文件会遮蔽真设备节点；
4. 唯一例外为 `/dev/shm`（POSIX 信号量需要，见 3.3）。

### 3.2 症状 → 根因速查

| 症状 | 根因 | 处置 |
|---|---|---|
| 写 `/dev/null` 失败 / EACCES | 野节点/遮蔽文件/mount 缺失 | 见 3.4 |
| zsh 进程替换打不开 `/proc/self/fd/N` | 旧机制残留/野节点遮蔽 | 见 3.4 |
| git/apt 报 urandom / null 错 | 设备节点异常或 bind-mount 缺失 | 见 3.4 |
| multiprocessing / sem_open 报**无文件名** ENOENT | `/dev/shm` 缺失（每 boot 必丢） | 见 3.3 |
| `os.ttyname(0)` 报 `[Errno 25] Inappropriate ioctl` | devpts 未 fresh newinstance | 见 3.5 |
| subprocess spawn 报 `'python'` ENOENT | 裸 python 缺失 | 见 3.6 |
| `EMFILE: too many open files, watch …`（vite/chokidar/nodemon 起不来） | inotify **instance** 上限（默认 128）被常驻进程吃光，与 `ulimit -n` 无关 | 见 4.5 |

### 3.3 /dev/shm 每 boot 重建
- **根因**：Android 宿主 `/dev` 为每次 boot 重建的 tmpfs 且无 POSIX shm，rbind 进来的 `/dev` 天然没有 `/dev/shm`。
- **症状**：`multiprocessing.Lock()` → POSIX 命名信号量 `sem_open` 抛出 `FileNotFoundError: [Errno 2] No such file or directory`（无文件名）。
- **处置**：宿主 `00-container.sh` 负责挂载 tmpfs 256M 1777；若运行中临时缺失，手动执行 `mkdir -p /dev/shm && chmod 1777 /dev/shm` 即可即时恢复。

### 3.4 修复步骤
需要交互式进入容器时，在 `chroot $ROOTFS /bin/bash` 前确认挂载在位。若挂载丢失：
1. 首选在宿主执行 `sh /data/adb/service.d/00-container.sh` 补挂；
2. 若需手动挂载：`mount -t proc proc /proc`、`mount --bind /sys /sys`、`mkdir -p /dev/shm && chmod 1777 /dev/shm`；
3. **严禁** mknod，若发现遮蔽文件直接 `rm` 删除；
4. 确认挂载正常后重跑 `/opt/start-services.sh`。

### 3.5 devpts 必须 fresh newinstance
- Android 宿主 devpts 设备号与 guest glibc 不匹配会导致 `ttyname()` 报 `Inappropriate ioctl`，且会耗尽宿主 pty 池。
- 宿主 `00-container.sh` 已挂载 `devpts newinstance`（`gid=5,mode=620,ptmxmode=0666`），容器内 `/dev/ptmx` 软链接至 `pts/ptmx`。

### 3.6 裸 python wrapper
某些自动化工具 spawn 裸 `python`。本机已在 `/usr/local/bin/python` 建立 exec wrapper 指向 `/opt/camoufox/venv/bin/python`，**勿改为 symlink**（venv 依赖 argv[0] 判别 sys.prefix）。

### 3.7 有意不 bind /data
容器 docker data-root 在 `/data/docker`，bind 宿主 `/data` 会遮蔽容器内文件导致服务崩溃。此处为有意偏差，切勿手动补 bind。


## 4. 内存护栏

- **问题**：容器继承 init 的 `oom_score_adj=-1000` 且无 cgroup 上限，内存耗尽会导致整机冻结。
- **现状机制**：
  1. 容器侧 `/opt/start-services.sh`：启动时将 supervisord 进程树设置 `oom_score_adj=300`、`renice 10`，并移入 cgroup v2 `dsh-container`（`memory.max=6.5G` / `swap.max=6G`，超限时内核自动击杀组内最占内存进程，由 supervisord 拉起自愈）。
  2. 宿主侧 `/data/adb/service.d/06-zram-8g.sh`：boot 时将 zram 扩至 8G。
- **检查命令**：`cat /proc/1~/sys/fs/cgroup/dsh-container/memory.events`、`ps -o ni= -p $(pgrep -x supervisord)`。


## 4.5 inotify 上限（文件监视类服务起不来时先看这里）

- **症状**：`vite` / `chokidar` / `nodemon` 之类启动即死，报
  `Error: EMFILE: too many open files, watch '<path>'`。**这个报错会误导**——它长得像 fd 上限问题，
  但 `ulimit -n` 是 32768，根本不是。真正卡住的是 `/proc/sys/fs/inotify/max_user_instances`（默认 128）。
- **根因**：容器里常驻进程已把 128 个 inotify instance 吃光（实测 ~147 个 inotify fd：mi_thermald、
  mihomo、system_server 残留、pcmanfm/LXDE 桌面、若干 node 服务）。注意 **instance 数 ≠ watch 数**，
  一个 instance 可以挂成千上万个 watch；卡的是 instance 个数。
- **实测**：一个 vite dev server 只用 **1** 个 instance、339 个 watch——所以抬 instance 上限就够了，
  watch 上限（默认 8192）从来不是瓶颈。
- **现状机制**：容器侧 `/opt/start-services.sh` 的 `apply_inotify_tuning()`，在 supervisord 启动**之前**
  写入 `max_user_instances=1024` / `max_user_watches=524288`（幂等，失败各自降级为 WARN）。
- **兼属关系**：`/proc/sys/fs/inotify/*` 是**内核全局可调参数，不是挂载**——所以不受「挂载只有宿主
  `00-container.sh` 一个权威」的约束，容器侧可以也应该自己写（与同一函数里的 swappiness/page-cluster
  同类先例）。mount 表归宿主脚本，内核 tunable 归容器脚本。
- **查现状**：`cat /proc/sys/fs/inotify/max_user_instances /proc/sys/fs/inotify/max_user_watches`
- **数占用**（找谁把 instance 吃光了）：
  ```bash
  for p in /proc/[0-9]*; do c=$(ls -l "$p/fd" 2>/dev/null | grep -c inotify); \
    [ "$c" -gt 0 ] && echo "$(cat $p/comm 2>/dev/null) x$c"; done | sort -t x -k2 -rn
  ```
- **临时救急**（不改脚本、立即生效，重启前有效）：`echo 1024 > /proc/sys/fs/inotify/max_user_instances`
- **另注**：`/etc/sysctl.d/` 那套对本容器**无效**（无 systemd、非独立 mount namespace，`sysctl -p` 也只
  是同样的直接写入）——boot 后会被 Android 宿主重置，所以必须落在 `start-services.sh` 里每次 boot 重设。


## 5. 宿主视角（/proc/1/root）与 PC 操控

- **容器内查看宿主**：`/proc/1/root` 即宿主根目录视角（只读速查，对 root 可读）。
  - Termux prefix：`/proc/1~/data/data/com.termux/files/usr`
  - rootfs 本体：`/proc/1~/data/data/com.termux/files/usr/var/lib/chroot-distro/containers/ubuntu/rootfs`
  - Magisk service.d：`/proc/1~/data/adb/service.d/`
  - boot 日志：`/proc/1~/data/container-boot.log`
  - *注：若 /proc 带 hidepid，改用任意 root 守护进程根视角（如 netd：`/proc/1092/root`）。*
- **PC adb 操控容器**：
  ```bash
  ROOTFS=/data/data/com.termux/files/usr/var/lib/chroot-distro/containers/ubuntu/rootfs
  adb -s 40cf172a root
  adb -s 40cf172a shell "chroot $ROOTFS /usr/bin/env PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin HOME=/root <cmd>"
  ```
  *注：adb 具有 10 分钟超时限制，长耗时任务使用 `nohup ... &` 后台运行。*


## 6. 服务清单（supervisord）

配置位于 `/etc/supervisor/conf.d/services.conf`，日志在 `/var/log/<svc>.log`。

| 服务 | 端口 | 进程名 | 凭据 | 公网域名 | 说明 |
|---|---|---|---|---|---|
| sshd | 22 | sshd | root / <vnc-password> | (内网) | SSH 守护进程 |
| ttyd | 7681 | ttyd | JohnnRen / <vnc-password> | term.<your-domain> | Web 终端 |
| cloudflared | 隧道 | cloudflared | 隧道 <tunnel-id> | — | CF 隧道（落点 NRT 东京，quic） |
| cliproxyapi (cpa) | 9999 | cli-proxy-api | api-key `sk-<vnc-password>`，管理 key `<vnc-password>` | models.<your-domain> | AI 接口网关 |
| wsgidav | 18480 | wsgidav(python3) | JohnnRen / <vnc-password> | webdav.<your-domain> | WebDAV 存储 |
| AList | 5244 | alist | admin / <vnc-password> | pan.<your-domain> | 聚合网盘 |
| codeg | 3080 | codeg-server | token `<vnc-password>` | codeg.<your-domain> | Agent 多工作区服务 |
| clash 面板 | 9090(/ui) | mihomo external-ui | secret 见 `/opt/mihomo/config.yaml` | yacd.<your-domain>/ui/ | metacubexd 面板 |
| VNC + noVNC | 5901 / 6080 | Xtigervnc / websockify | <vnc-password> | vnc.<your-domain> | LXDE 图形桌面与 Web VNC |
| degoog | 4444 | bun(node) | settings pw `<vnc-password>` | search.<your-domain> | 聚合搜索主服务（agent 走 degoog-cli skill） |
| camoufox MCP | — | (stdin MCP, headed) | 无 | (本地) | Firefox 反检测浏览器 MCP |
| dsh | 4175 | dsh | cpa key `sk-<vnc-password>` | dsh.<your-domain> | DeepSeek Harness Web GUI |
| mnemon-embed-proxy | 8765 | python3 | 无（本地） | (本地垫片) | 本地 Embedding 代理 |

- **快捷命令**（`~/.shell-env`）：`sv status`、`sv restart <svc>`、`sv update`、`svlog <svc>`。
- **Cloudflared 配置**：`/etc/cloudflared/config.yml`，凭据 `~/.cloudflared/<tunnel-id>-*.json`。


## 7. 网络与代理（Mihomo / Clash）

- **服务形态**：supervisord 托管 `mihomo`（`/opt/mihomo/mihomo -d /opt/mihomo -f /opt/mihomo/config.yaml`）。
- **端口**：Mixed-port `127.0.0.1:7890`，Controller `127.0.0.1:9090`（已设置 secret）。
- **无 TUN 模式**：容器网络直连 wlan0，无 TUN 设备，出口 IP 为手机真实外网 IP。应用通过 `HTTP_PROXY / HTTPS_PROXY=http://127.0.0.1:7890` 走代理。
- **Clash 控制面板**：mihomo `external-ui: /opt/mihomo/ui` 在 9090 端口 `/ui` 托管 metacubexd，经 cloudflared `yacd.<your-domain>` 公网发布。访问 `https://yacd.<your-domain>/ui/` 输入 secret 即可使用。
- **直连铁律**：`rules` 顶部必须包含 `- DOMAIN-SUFFIX,<your-domain>,DIRECT`。自家公网服务必须直连，严禁经代理节点回打 CF 隧道，否则会导致 API 带鉴权的写请求（PUT/DELETE）被 reset。
- **订阅更新直连**：`dns.respect-rules: true` 会使 provider 订阅流量走自身规则，必须在 rules 顶部配置订阅服务器 IP/域名的 DIRECT 规则，防止拉取订阅时 EOF 失败。


## 8. degoog 部署

- **主服务**：Bun native 运行（`/opt/degoog`，二进制 `~/.bun/bin/bun`），端口 4444，API `GET/POST /api/search`。
- **agent 接口**：`degoog-cli` skill（`/usr/local/bin/degoog-cli`，bash+curl+jq+trafilatura），search/scrape/engines 三子命令，curl 直连主服务。
- **degoog-mcp 已退役（2026-09-17）**：Go sidecar（4443，`/opt/degoog-mcp/degoog-mcp`）已停用并从 supervisord 移除（services.conf 中保留注释块可恢复），dsh 的 MCP 注册已从 cordis.patch.yml 移除。
- **已装引擎与默认配置**：官方扩展仓库位于 `/opt/degoog/data/store/degoog-org-official-extensions`。默认引擎配置在 `data/default-engines.json`（`duckduckgo`、`brave`、`google-cse`）。
- **引擎安装维护脚本**：`/opt/setup-degoog-engines.sh`（自动执行登录、仓库注册、refresh、安装及设置默认引擎）。


## 9. 浏览器自动化（camoufox MCP 与 patchright）

- **首选：camoufox-js MCP**（Firefox 反检测）：
  - 配置文件：`~/.config/camoufox-mcp/settings.json`；
  - 默认 **headed 模式**（运行在 VNC `DISPLAY=:1`，noVNC 可见可协同交互）；
  - 代理配置：`proxy.server=http://127.0.0.1:7890`，`proxy.geoip=true`；
  - 共享持久鉴权：`contextPaths=[~/.browser-auth/shared.json]`；
  - 维护脚本：`/opt/setup-camoufox-mcp-fixes.sh`（维护 camoufox-js 0.12.0 pin 与 geoip TZ 补丁，npm 重装后必须重跑）。
- **备用：patchright CLI**：
  - 需要 Chromium 时使用 `/usr/local/bin/patchright-browser --profile <dir>`（venv `/opt/patchright-venv`）；每会话独立 `--profile` 天然隔离。patchright MCP 已废弃禁用。


## 10. 关键路径汇总

| 项 | 路径 |
|---|---|
| 统一启动脚本 | `/opt/start-services.sh`（幂等，含内存护栏） |
| 服务配置 / 日志 | `/etc/supervisor/conf.d/services.conf` / `/var/log/<svc>.log` |
| cpa | 配置 `/opt/cliproxyapi/config.yaml`，日志 `/var/log/cliproxyapi.log` |
| AList 数据 | `/opt/alist/data/` |
| codeg | 二进制 `/opt/codeg/codeg-server-linux-arm64/codeg-server`，数据 `~/.local/share/codeg` |
| WebDAV 根 | `/var/webdav` |
| Clash (mihomo) / 面板 | 配置 `/opt/mihomo/config.yaml`，面板 UI `/opt/mihomo/ui` |
| degoog 主服务 | `/opt/degoog`（agent 入口：degoog-cli skill；MCP sidecar 已退役） |
| 运行时与工具链 | Bun `~/.bun/bin/bun`，Go `/usr/local/go` |
| camoufox MCP | 配置 `~/.config/camoufox-mcp/settings.json`，缓存 `~/.cache/camoufox/`，鉴权 `~/.browser-auth/shared.json` |
| patchright CLI | `/usr/local/bin/patchright-browser`，venv `/opt/patchright-venv` |


## 11. 操作约定与常见运维

- **全局操作约定**：
  - 禁止使用 `git stash`/`git checkout`/`git restore`/`git reset --hard` 等破坏性命令（除非用户显式同意）；
  - 涉及登录、验证码、2FA 等人工交互时，提示用户前往 `https://vnc.<your-domain>/vnc.html`（密码 `<vnc-password>`）完成，做完后继续执行；
  - 聚焦核心真实场景测试，不写无意义测试代码。
- **常见运维命令**：
  - 重启服务：`sv restart <svc>`；更新配置热重载：`sv update`；查看日志：`svlog <svc>`；
  - cpa 安装插件：管理面板 `https://models.<your-domain>/management.html`（key `<vnc-password>`）或通过 API 安装；
  - AList 挂载存储：`https://pan.<your-domain>` 管理后台进行配置；
  - 修改 Cloudflared 路由：编辑 `/etc/cloudflared/config.yml` ingress，执行 `cloudflared tunnel route dns <id> <sub>.<your-domain>`，重启 cloudflared。


## 12. 精选已知坑

1. **直接 chroot 前确认挂载**：若挂载缺失，在宿主执行 `sh /data/adb/service.d/00-container.sh` 恢复，严禁使用 mknod 伪造节点。
2. **su 路径差异**：本设备 Magisk su 为 `/data/adb/magisk/magisk`（不在 `/sbin/su`），提权统一使用 `magisk su -c '<cmd>'`。
3. **容器内跑 Android 命令必须先 `chroot /proc/1/root`**：chroot 容器里**不能直接 exec** `/system/bin/*`（`/system/bin/sh`、`cmd`、`toybox`、magisk 全部 exec 即 `ENOENT`）。原因是 Android 二进制是 bionic ELF（解释器 `/system/bin/linker64`），在 Ubuntu chroot 里解释器/库解析不到 → execve 返回 ENOENT，**不是文件缺失也不是 noexec**（ls/stat 都正常，ldd 报 `invalid ELF header`）。正确姿势：
   ```bash
   chroot /proc/1/root /system/bin/cmd wifi status          # 跑 Android 命令
   chroot /proc/1/root /data/adb/magisk/magisk su -c "id"   # Android root 环境（context=u:r:magisk:s0）
   chroot /proc/1/root /system/bin/getprop ro.product.model
   ```
   `/proc/1/root` 即宿主 init 根视角（`/proc/1~/data/adb/magisk/magisk` 能 ls 但无法 exec，必须 chroot 进入宿主根才能跑）。注意：bind-mount `/proc/1~/data/adb` 到容器也**看不到 magisk/ 子目录**（Magisk magic mount 在 init namespace 内隐藏），要用 `/proc/1/root` chroot 而不是 bind。
4. **adb 10 分钟超时**：长时间命令须用 `nohup ... &` 脱钩执行。
5. **严禁往 rootfs `/dev` `/proc` `/sys` 写普通文件或 mknod**：会导致 SELinux 标签中毒、遮蔽设备节点或污染宿主环境。
6. **Termux ptmx 闪退**：已由宿主 `/data/adb/service.d/05-termux-ptmx.sh` 开机自动 remount 并注入 sepolicy 规则。
7. **camoufox MCP 维护**：npm 重装后必须重跑 `/opt/setup-camoufox-mcp-fixes.sh` 恢复版本 pin 与时区补丁。
8. **mihomo provider 订阅拉取 EOF**：`dns.respect-rules: true` 导致订阅流量走代理被拒，必须在 rules 顶部添加直连规则。
