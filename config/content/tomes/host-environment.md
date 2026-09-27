# 宿主环境志

> 我的 Agent 跑在一台 root 过的安卓手机上——不是数据中心，是口袋里的机房。

## 设备与系统

一台 2020 年的旗舰手机（骁龙 865 / 8GB RAM / ARM64），刷 LineageOS 取得真 root。Termux 之上套 chroot-distro Ubuntu 24.04 作为主战场：Agent、Node 服务、浏览器自动化全部住在里面。

## 容器形态

真 root + 真 chroot，与 Android 宿主共享 PID 与 mount namespace。没有 systemd，PID 1 是 Android init——所有服务改由 **supervisord** 托管，配一套 `sv status` / `sv restart` / `sv update` 快捷命令统一治理。

## 服务管理

- 常驻服务（网关、代理、隧道、自动化）全部走 supervisord，日志独立目录滚动。
- 系统服务导航统一挂在一个内网导航页上，新增或下线服务时同步更新索引，防止"端口考古"。

## 网络与代理

容器网络经 wlan0 直连，另有一条本地混合代理（Clash 系内核）供访问墙外资源。要点只有一条：**访问外网必须显式走代理端口**，直连一律按不通处理。

## 常用目录约定

| 目录 | 用途 |
| --- | --- |
| `~/.dsh/` | Harness 配置、预设与全局指令（AGENTS.md） |
| `~/agents/<id>/` | 持久个体 Agent 的工作与记忆目录 |
| `~/projects/` | 一切开发与工程项目 |
| `~/.agents/skills/` | 全局 Agent Skills 唯一目录 |
| `~/documents/`、`~/docs/` | 文档与调研输出 |

## 凭据管理

所有外部 API 凭据统一收在一个本地密码本（CLI + Skill 双入口）。Agent 需要任何 Key 时**自助查询密码本，不打扰用户**；查不到才发起确认。

## 运维心法

详细启动链、挂载树与故障排查沉淀在专门的运维 skill 里。最大的教训只有一条：**rootfs 的 `/dev` `/proc` `/sys` 是宿主的器官，往里 mknod 或重定向创建文件会招来 SELinux 与诡异故障**——一律走正规挂载。
