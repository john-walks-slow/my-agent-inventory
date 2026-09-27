# Claude Code 采集指南

采集器已全支持：`node skills/harness-inventory/scripts/collect-stats.mjs` 自动完成，本文件是口径说明与手动核对参考。

## 存储位置

- 会话：`~/.claude/projects/<project-dir>/*.jsonl`（`<project-dir>` = 工作区绝对路径斜杠换连字符，如 `-root-projects-my-app`）
- 子代理：`~/.claude/projects/<project-dir>/<session-uuid>/subagents/*.jsonl`（新版嵌套在会话 uuid 目录下；旧版直接挂 `<project-dir>/subagents/`）
- 汇总缓存：`~/.claude/stats-cache.json`（`totalSessions`、`firstSessionDate` 等，可交叉核对）
- 环境变量覆盖：`CLAUDE_CONFIG_DIR`

## 文件格式

JSONL。关注 `type: "assistant"` 的行——**同一轮次会因工具调用拆成多行，携带相同 `message.id`**：

```json
{ "type": "assistant", "timestamp": "...", "message": {
  "id": "msg_01ABC...",
  "usage": {
    "input_tokens": 1250, "output_tokens": 420,
    "cache_creation_input_tokens": 3500, "cache_read_input_tokens": 18200
  }
} }
```

## 统计口径（harness.stats 对应关系）

- `sessions`：`~/.claude/projects/*/*.jsonl` 文件数（排除 `subagents/` 子目录）
- `subagentSessions`：各 `<session-uuid>/subagents/`（及旧版直挂 `subagents/`）下的 jsonl 总数
- `tokens`：按 `message.id` **去重**后 Σ `input_tokens + output_tokens`
- `cacheTokens`：Σ `cache_read_input_tokens`（可加 `cache_creation_input_tokens`）
- `since`：`stats-cache.json` 的 `firstSessionDate`，或最早 jsonl 的 mtime

## 版本

`claude --version` 或 `npm list -g @anthropic-ai/claude-code --json`。

## 陷阱

- **不去重 message.id 会因工具调用拆行而多计**——这是 Claude Code 统计最常见的错误。
- `input_tokens` 不含 `cache_read_input_tokens`（Anthropic 口径两者独立），无需做减法。
- `projects/` 目录名有截断规则（200 字符 + 哈希），别假设能从目录名还原完整路径。

## 社区工具交叉验证

`npx @ccusage/claude`（ccusage）可跑 `ccusage session` 对比你的数字。
