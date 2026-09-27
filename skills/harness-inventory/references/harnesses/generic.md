# 通用采集指南（Goose / Amp / Gemini CLI / Copilot / Aider / OpenCode 及任意 harness）

采集器对这些 harness 只做探测（发现痕迹后指到本文件）。动手前先读「四大陷阱」，再按「五步法」采集。

## 四大陷阱（跨 harness 通用，逐条自查）

1. **累积量 vs 单轮增量**
   有的 harness 记录的是「从会话开始到当前步骤」的累积值（Codex 的 `total_token_usage`、Goose 的 `accumulated_*`）——**逐行累加会把统计放大几十倍**。有的记每条仅当次请求的增量（Claude Code 的 assistant message、Amp 的 usageLedger、DSH 的 turn usage）——这些才需要逐条相加。开工前先打印同一个会话文件的头/中/尾三行，确认数字是递增基准（累积）还是独立小值（增量）。
2. **缓存口径差异**
   - Anthropic 系（Claude Code / Amp）：`input_tokens` **不含** cache_read，各字段独立相加即可。
   - OpenAI / Gemini / Copilot 系：`input_tokens` 是**包含** cached 的毛输入，净输入须 `max(0, input_tokens - cached_tokens)`。
3. **推理 Token 已含在 output 里**
   OpenAI（o 系/gpt 系）、Gemini（thoughts）、DeepSeek（reasoning_content）的 `reasoning_tokens` 是 `output_tokens` 的细分说明，**不要再加一次**。
4. **子代理与工作树重复统计**
   Claude Code `subagents/`、OpenCode 父子 Session、DSH `parentSession`、多 worktree 各自落盘——决定「计入总量还是独立计数」并**去重**（本站口径：主会话/子会话分开报，Token 按会话目录去重后汇总）。

## 五步法

1. **定位存储**：从下表起步；找不到就 `ls -la ~/` 找 `.` 开头的相关目录、查官方文档「data / storage / sessions」页。
2. **确认格式**：JSONL（逐行 JSON）最常见；SQLite（`.db`）用 `sqlite3 <db> '.tables'` 探表；Protobuf 优先找官方导出工具。
3. **小样本核对**：取 1 个会话文件，打印含 token 字样的行，对照四大陷阱判断口径。**拿不准就在对齐闸门时如实告诉人类「该数字为近似」**。
4. **全量采集**：写一次性脚本（或直接手算小数据集），产出 `sessions / subagentSessions / tokens / cacheTokens / since` 五个数。
5. **交叉验证**：有社区工具（ccusage、tokenuse、agentgrep 等）就跑一遍对数；没有就用「单日数据人工抽查」兜底。

## 常见 harness 存储速查

| harness | 位置 | 格式 | 备注 |
|---|---|---|---|
| Goose | `~/.config/goose/`（`sessions/`） | JSONL | `accumulated_*` 是累积值，取末值 |
| Amp | `~/.config/amp/` `~/.amp/` | JSONL/ledger | usageLedger 增量；Anthropic 缓存口径 |
| Gemini CLI | `~/.gemini/`（`tmp/<hash>/`） | JSONL | OpenAI 系毛输入口径 |
| Copilot CLI | `~/.copilot/` | JSONL | 毛输入口径 |
| Aider | `~/.aider*` + `.aider.chat.history.md` | md/json | 正则抽数，记 approximate |
| OpenCode | `~/.local/share/opencode/` | SQLite+JSONL | 父子 session 去重 |

（速查表是起点不是终点，版本会漂移，永远回到「小样本核对」。）

## 产出口径（喂给 harness.yaml）

```yaml
stats:
  sessions: <主会话数>
  subagentSessions: <子代理会话数，无则省略>
  tokens: <非缓存 input+output 总和>
  cacheTokens: <缓存命中，无则省略>
```

数字取整；近似值在对齐闸门时注明。`since` 取最早会话时间戳。
