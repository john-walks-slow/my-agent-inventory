# DSH (DeepSeek Harness) 采集指南

采集器已全支持：`node skills/harness-inventory/scripts/collect-stats.mjs` 自动完成，本文件是口径说明与手动核对参考。

## 存储位置

- 主目录 `~/.dsh/`；会话根 `~/.dsh/sessions/--<normalized-cwd>--/<session-uuid>/`
- 会话文件按代际命名：`session.v3.jsonl.zstd`（当前）、`session.v2.jsonl.zstd`、未压缩 `session.v*.jsonl`（历史兼容）
- 全文索引：`~/.dsh/session-search.db`（SQLite FTS5，统计不需要它）

## 文件格式

zstd 解压后每行一个 JSON 事件。关注两类行：

- **Header（首行）**：`type: "session"`，含 `createdAt`、`cwd`、`parentSession`（有则该会话是子代理）、`origin`
- **用量行**：`type: "assistant/message"`，`data.usage` 含 `inputTokens` / `outputTokens` / `cacheReadTokens` / `cacheWriteTokens` / `totalTokens`，逐轮增量

## 统计口径（harness.stats 对应关系）

- `sessions`：含会话文件的目录数中，Header 无 `parentSession` 的（root 主会话）
- `subagentSessions`：Header 有 `parentSession` / `origin == "subagent"` 的
- `tokens`：Σ `inputTokens + outputTokens`（**不含** cacheRead/cacheWrite——DSH usage 各字段独立，无毛输入重叠问题）
- `cacheTokens`：Σ `cacheReadTokens`
- `since`：所有 Header `createdAt` 的最小值（转 YYYY-MM-DD）

## 版本

`cat /usr/lib/node_modules/@deepseek-ai/dsh/package.json | grep '"version"'`（或该安装路径下的 package.json）。

## 陷阱

- v1/v2/v3 代际文件并存：全部要读，别只 glob v3。
- zstd 流式解压逐行处理即可，勿整体读入内存（会话文件可能上百 MB）。
- 子代理会话是独立目录，目录数 ≠ 主会话数，必须按 Header 区分。
