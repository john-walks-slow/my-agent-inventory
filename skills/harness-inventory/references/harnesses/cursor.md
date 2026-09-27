# Cursor 采集指南

采集器当前只探测、不自动统计（存储是 SQLite + Protobuf 混合，按本指南手动/脚本采集）。

## 存储位置

**IDE（桌面客户端）**：

- Linux：`~/.config/Cursor/User/`　macOS：`~/Library/Application Support/Cursor/User/`
- 全局库：`globalStorage/state.vscdb`（SQLite）
- 工作区库：`workspaceStorage/<hash>/state.vscdb`

**CLI（cursor-agent）**：

- `~/.cursor/projects/<project-hash>/agent-transcripts/**/*.jsonl` ← **推荐入口，纯 JSONL**
- `~/.cursor/chats/<workspace-hash>/<chat-uuid>/store.db`（Protobuf）
- `~/.cursor/ai-tracking/ai-code-tracking.db`

## 采集路径选择

优先走 CLI 的 `agent-transcripts` JSONL（结构清晰）；纯 IDE 用户才需要解 `state.vscdb`：

```sql
-- 会话数
SELECT count(*) FROM cursorDiskKV WHERE key LIKE 'composerData:%';
```

消息气泡在 `bubbleId:<composerId>:<bubbleId>` 键下，`tokenCount: {"inputTokens":…, "outputTokens":…}`；新版气泡 tokenCount 可能为 `{0,0}`，只能从 `composerData.usageData`（美分成本）或 `promptTokenBreakdown.totalUsedTokens` 取近似。

## 统计口径

- `sessions`：composerData 键数（IDE）或 transcripts 会话文件数（CLI）
- `tokens`：有非零 tokenCount 时累加 input+output；全零时取 totalUsedTokens 基准或成本换算，**在呈报人类时注明是近似值**
- `since`：`SELECT min(createdAt) FROM cursorDiskKV WHERE key LIKE 'composerData:%'`（毫秒时间戳）

## 版本

`cursor --version`（CLI）或 IDE 安装目录 `package.json`。

## 陷阱

- 版本迭代快：2.x 工作区库 → 3.x 集中索引（`ItemTable` 的 `composer.composerHeaders`），字段位置随版本漂移，采到什么先小样本打印核对。
- usageData 记的是**美分成本**不是 Token，别混填进 `stats.tokens`。
- 社区工具：`cursaves`、`cursor-export` 可辅助导出。
