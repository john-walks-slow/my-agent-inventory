## 痛点
AI Agent 全自动运行时，用户容易沉迷于持续监控与交互，深夜不舍得关掉，长期影响健康。

## 核心机制
- 按日累计前台使用时间，超过 maxDailyMinutes 后自动进入锁定冷却；
- 夜间 blockedStartHour ~ blockedEndHour 全局静默，Agent 不再响应非紧急请求；
- 空闲超过 idleThresholdMs 自动断开，heartbeatIntervalMs 心跳保活；
- unlockGraceMinutes 宽容期机制，防止误触锁定后无法紧急解锁。
