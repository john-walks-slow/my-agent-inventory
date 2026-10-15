# 基础环境概况

> 全局指令 `~/.dsh/AGENTS.md` 原文同步。

- **设备与系统**：红米 K30S Ultra（apollo，骁龙 865，8GB RAM，ARM64），LineageOS 23.2（真 root + Magisk）；Termux + chroot-distro Ubuntu 24.04。
- **容器形态**：真 root + 真 chroot，与 Android 宿主共享 PID / mount namespace（无 systemd，PID 1 为 Android init）。
- **服务管理**：全部服务由 supervisord 托管。常用快捷命令：`sv status`、`sv restart <svc>`、`sv update`、`svlog <svc>`。系统服务统一导航目录位于 `/opt/index/index.html`（端口 8080），添加、修改或下线服务时参考 skill `update-service-index` 同步更新。
- **网络与代理**：容器网络走 wlan0 直连。本地 Clash (mihomo) 混合代理端口 `127.0.0.1:7890`，控制端口 `127.0.0.1:9090`，面板 `https://yacd.<your-domain>/ui/`。重要：国内网络访问墙外网站，必须通过 7890 端口的代理。
- **用户协同**：遇到网页登录、人机验证码、2FA 等需人工介入的操作，直接提示用户前往 noVNC 桌面（`https://vnc.<your-domain>/vnc.html`，密码 `<vnc-password>`）完成。
- **语音输入容错**：用户日常主要使用语音输入与 Agent 交互，消息中可能偶现同音字替换、断句偏差或语音识别（ASR）错误（如将 Jev 误识别为 Java/加法、连通性识别为链通信、上架/算价识别为商家等）。理解用户意图时务必结合上下文和技术背景做同音反推和宽容推断，不要按字面机械死扣，遇关键歧义简明确认。
- **常用目录**：
  - `~/.dsh/`：DSH 配置、预设与全局指令（`AGENTS.md`、`profiles/`、`.agent-presets/`）
  - `~/agents/<agentid>/`：持久个体 Agent 的工作与记忆目录（如 `agents/luna/`）
  - `~/projects/`：所有开发与工程项目目录（含 DSH 插件开发，当前唯一开发目录）
  - `~/documents/` 与 `~/docs/`：文档、知识库与调研输出
  - `~/downloads/`：下载文件与临时抓取缓存
  - `~/plugins/`：非 DSH 遗留目录（自有 DSH 插件已全部迁至 `~/projects/`；现存 `linux/` 为 cli-proxy-api 的 native 插件、`e2e-candidates/` 为第三方调研包，均非开发目录）
  - `~/.agents/skills/`：全局 Agent Skills 唯一目录
- **Agent 配置单一来源**：APM 只部署 `agent-skills`（`~/.apm/apm.yml` 已固定 `targets: [agent-skills]`，改动前先确认此项约定），skills 唯一落点是 `~/.agents/skills`；各工具的指令文件（claude / codex / gemini / copilot / kiro / grok / cursor / windsurf / opencode / antigravity-cli / hermes / pi）与 skills 目录都是软链，分别指向 `~/.dsh/AGENTS.md` 与 `~/.agents/skills`。因此：改全局指令只改本文件，加技能只放进 `~/.agents/skills`，不要再让 APM 给其它 target 部署副本。例外：各工具的 subagent 定义（`~/.claude/agents`、`~/.codex/agents` 等）是格式各异的独立副本，不参与软链，也不由 APM 维护；DSH 自己的子代理定义在 `~/.dsh/agents/`。
- **凭据管理**：全局 API 密码本位于 `~/.config/api-vault/vault.json`，配套 CLI 为 `api-vault`，全局 Skill 为 `api-vault`。Agent 需要任何外部 API 凭据（API Key、Base URL）时，欢迎直接通过本技能自查获取，无需向用户询问；若确实缺失再行确认。
- **运维与故障排查**：详细启动链、挂载树、devfs 规范、服务配置及故障排查见 skill `container-ops`。

**重要：机器内存较为紧张，运行端到端测试时需格外注意减少运行批次和规模，并及时释放内存。**
