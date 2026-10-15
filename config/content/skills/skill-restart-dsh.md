# restart-dsh（安全重启 DSH）

## 何时用

- 修改了 `~/.dsh/profiles/web/cordis.patch.yml` 后需要重启生效
- 修改了 dsh 插件配置、MCP 服务器配置等需要重启的场景
- **不能**直接 `supervisorctl restart dsh`——agent 运行在 dsh 进程内，直接重启会杀掉自己连同 bash 命令，命令永远不会返回结果

## 红线：重启前必须获得用户书面同意（2026-09-10 用户指示 / 2026-09-15 重申）

**每一次重启线上 dsh（4175）的操作，执行前必须单独向用户说明并取得明确书面同意；用户未同意时一律严禁重启！**

- **严禁擅自/连续执行**：不得因为前序步骤获得了同意，就自动在后续修改或调试循环中擅自重启；每一次重启都是独立的高风险动作，必须单次向用户明确申请。
- **避免打断他人工作**：线上重启会强制断开当前会话，并中断用户或其他 Agent 正在执行的工作和 GUI 交互，影响范围直接落在全系统，因此绝对决定权在用户。
- **改动就位即可**：代码构建完成并链接后，文件改动已就位，重启时机完全等待用户点头。
- 隔离验证实例（acquire-port 动态端口、不改线上进程）不受此限制。注意：**插件行为 e2e 用 [[dsh-e2e]]（worktree 最小实例），本 skill 的临时实例只用于线上 profile 整树回归验证**——两者目的不同，别混用。

## 重启前必须先验证（重要！）

**直接重启线上 dsh 前，必须先在单独端口启动一个临时实例验证能稳定运行。**
线上 dsh 崩了 = dsh 彻底不可用（supervisor 重试耗尽后 STOPPED，恢复要人工介入），
而插件改动是 dsh 崩溃的头号原因（见 [[dev-dsh-plugin]] 的 link 包依赖坑，已反复犯）。
没验证就重启 = 拿线上服务赌改动没问题。

验证步骤：

1. **acquire-port 取端口，拉起临时实例**（不动线上 4175）：

   ```bash
   P=$(acquire-port --wait)
   DSH_HOME=~/.dsh dsh web --no-open --port "$P" --trusted-host dsh.<your-domain> &
   echo "$P" > /tmp/dsh-verify.port
   ```

   - 与线上实例**共享 `DSH_HOME`**（同一 profile、同一插件树）——这是本验证的目的：要验证的就是线上那棵树改动后的表现
   - **共享 home 的边界（红线）**：临时实例**只做启动/加载验证，绝不打开会话、不驱动任何 turn**——共享 home 双实例驱动同一会话是 seq 对撞事故的源头（见 [[dsh-e2e]] 血泪史）
   - 端口由 acquire-port 动态分配（槽位上限天然防止验证实例挤爆机器）

2. **看启动日志稳定**：等到出现 `dsh web: http://127.0.0.1:$P` 且**不再有**
   `plugin tree failed to load` / `ERR_MODULE_NOT_FOUND` 报错。至少观察 10 秒确认
   进程不退出。

   ```bash
   P=$(cat /tmp/dsh-verify.port)
   ss -tlnp | grep ":$P "          # 端口在听
   pgrep -af "dsh web.*--port $P"  # 进程活着
   ```

   进一步可用无头浏览器带 token cookie 加载页面，捕获 console.error / pageerror
   （combo bundle 语法错误只在浏览器侧暴露，见 [[dev-dsh-plugin]] client bundle 坑）。

3. **验证通过 → 杀掉临时实例 → 释放槽位 → 再重启线上**：

   ```bash
   P=$(cat /tmp/dsh-verify.port)
   pkill -f "dsh web.*--port $P"   # 杀临时实例
   acquire-port --release "$P"     # 还槽位（须等端口停止监听）
   # 然后用下面的 setsid 方式重启线上
   ```

4. **验证失败 → 不要重启线上**：临时实例崩了说明改动有问题，修好再重试。
   线上实例没动，不受影响。

## 一行命令（验证通过后）

```bash
setsid bash -c 'sleep 2 && supervisorctl restart dsh' </dev/null >/dev/null 2>&1 &
```

## 原理

1. `setsid` 创建新会话，脱离当前进程树
2. `sleep 2` 延迟 2 秒，让当前 bash 先返回结果
3. `</dev/null >/dev/null 2>&1` 完全 detach stdio
4. `&` 后台运行

2 秒后 supervisorctl 重启 dsh，旧进程（含当前 agent 会话）被杀，新进程拉起后 agent 可在新会话继续工作。当前会话的 bash 命令已经返回了 "detached restart scheduled in 2s"，不会挂住。

## 等价快捷函数

`~/.shell-env` 中可加：

```bash
rdsh() {
  setsid bash -c 'sleep 2 && supervisorctl restart dsh' </dev/null >/dev/null 2>&1 &
  echo "dsh restart scheduled in 2s"
}
```

shell 内直接 `rdsh` 即可。

## 注意

- 重启后当前会话会断开，需要重新打开或等待自动重连
- 如果只是改了 client-plugin（HMR 热更新覆盖层），且 `pnpm run dev:web` 在跑，则不需要重启——client 插件热更新不重启
- apps/web shell 和普通 packages 的改动才需要重启

## 已知事故：重启流程中会话日志 seq 对撞（2026-09-15）

一次由 agent 驱动的 live 重启流程（camoufox 操作 GUI + 排程重启）后，该会话历史
加载失败：`corrupt Zstandard session log: complete frame contains a torn JSONL
record (gateway/internal)`。

**真实成因不是重启本身、也不是 zstd 损坏**（supervisor 日志证实重启发生在
02:34:50，而日志损伤在 02:34:24–48 已发生，且全部 7772 帧 checksum 完好）。
是 **turn 被打断 → 会话被 resume，而打断前的工具调用（浏览器点击）仍在跑**：
中断路径先写合成 closers（seq 91261–91263），resume 又补 `session/end-seed`
（91264），随后旧写入方用陈旧内存游标把真实结果从 91261 续写——两段分歧历史
共用同一段 seq，读取时被误报成 torn record。

教训与守则：

- **重启杀掉进行中的 turn 是良性的**（日志停在未闭合 step，下次 resume 自动补
  closers），真正危险的是 **打断/resume 一个还有工具调用在跑的 turn**。
  重启流程若由 agent 跑浏览器自动化，中途尽量别手动 stop；要停也先等工具调用返回。
- 遇到这个报错先别信字面意思：zstd 帧完好时，真因几乎必然是 seq 倒卷
  （scanner 的 issue 未上报，上游缺陷）。修复 = 切掉合成块保留真实续写。
- 完整诊断 + 修复脚本：`~/projects/dsh-patch/docs/issues/260915-zstd-session-log-seq-collision/`；
  原始文件备份在 `~/.dsh/session-log-backups/`。修复后用真实后端 `readPrefix`
  验证事件连续性。
