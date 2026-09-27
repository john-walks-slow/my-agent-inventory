# OpenAI Codex CLI 采集指南

采集器已全支持：`node skills/harness-inventory/scripts/collect-stats.mjs` 自动完成，本文件是口径说明与手动核对参考。

## 存储位置

- 会话：`${CODEX_HOME:-~/.codex}/sessions/YYYY/MM/DD/rollout-<timestamp>-<uuid>.jsonl`
- 索引数据库：`~/.codex/state_5.sqlite`（`threads` 表，含 `created_at`）
- 提示词日志：`~/.codex/history.jsonl`（轻量，统计不用）

## 文件格式

JSONL，每行 `{timestamp, type, payload}`。Token 在 `type: "event_msg"` 且 `payload.type: "token_count"` 的行：

```json
{ "info": {
  "total_token_usage": { "input_tokens": 15420, "cached_input_tokens": 12800, "output_tokens": 850 },
  "last_token_usage":  { "input_tokens": 3200,  "cached_input_tokens": 2800,  "output_tokens": 180 }
} }
```

## 统计口径（harness.stats 对应关系）

- `sessions`：`sessions/**/*.jsonl` 文件数（或 `SELECT count(*) FROM threads`）
- `tokens`：**每个会话只取最后一条 `token_count` 的 `total_token_usage`**（累积值），跨会话再求和：
  `Σ_sessions (input_tokens + output_tokens - cached_input_tokens)`，单会话净输入取 `max(0, input - cached)`
- `cacheTokens`：末条 `total_token_usage.cached_input_tokens` 的跨会话和
- `since`：rollout 文件名中的最早日期（`rollout-YYYY-MM-DD…`），回退 `~/.codex` 目录创建时间（或 `SELECT min(created_at) FROM threads`，Unix 秒）

## 版本

`codex --version` 或 `~/.codex/version.json`。

## 陷阱（Codex 是陷阱重灾区）

- **累积 vs 增量**：`total_token_usage` 是会话开始到当前的**累积值**——逐行累加会把 Token 放大几十倍。整场统计只取**每个会话最后一条**。
- **毛输入**：`input_tokens` 是**包含** `cached_input_tokens` 的毛值，净输入要 `max(0, input - cached)`。
- **推理 Token**：`reasoning_output_tokens` 已含在 `output_tokens` 里，不要再加。
- 想按日拆分时才用 `last_token_usage`（单轮增量）逐条累加。
