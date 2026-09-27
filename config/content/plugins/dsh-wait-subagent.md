## 核心解决的痛点
DeepSeek Harness 原生的 subagent 工具在开启 `run_in_background: true` 时只返回 durable id，之后父 Agent 只能通过持续轮询 `list_agents` 或等待系统异步发送 Notice。在多子代理流水线、并行调研汇聚、严格串行审查等场景下，极度缺乏确定性的阻塞等待机制。

## 核心特性
1. 精准等待：传入 subagent_id 即可优雅阻塞直到该子代理 settle，返回其 stop_reason 与 closing message。
2. 超时安全：支持毫秒级超时设置，防止子代理发生死循环或耗尽 token 导致父进程永久挂死。
3. 状态直显：直接解析 finished、aborted、max-tokens 等终止状态，父 agent 可立即接续后续决策。
