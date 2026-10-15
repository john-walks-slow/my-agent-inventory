# update-ive-learned（学习记录站极速更新）

仓库 `~/projects/i-ve-learned`，线上 https://john-walks-slow.github.io/i-ve-learned/ 。
push 到 `main` 自动触发 CI + Pages 部署。

## 极速原则与豁免（Fast Track）

- **豁免 `commit-own-changes`**：纯内容增量，无需获取 git-lock，直接暂存 `content/` 提交并推送。
- **豁免 `ci watch`**：`git push` 成功即向用户汇报完成，无需 `gh run watch` 同步等待流水线。
- **本地极速验证**：提交前只需执行 `pnpm build` 确认 frontmatter schema 与静态路由生成无误（耗时 ~3s）。
- **一键发布脚本**：支持直接运行 `pnpm publish:content "feat(content): ..."` 自动完成构建快检与 push。


## 1. 新增想学（tolearn / backlog）

目标文件：`content/backlog/<slug>.md`（`<slug>` 建议用文章英文化连字符短名）

### 典型 Frontmatter 字段
```yaml
title: "文章或材料标题"
type: blog # article/video/paper/blog/book/course/doc/talk/podcast/project/snippet
date: 2026-09-15 # 加入日期
category: [AI, Multi-Agent] # 最多两级，全自动派生分类树，无需注册
comment: 一两句核心看点（列表页随行展示）
url: https://... # 原文链接
tags: [multi-agent, architecture] # 小写连字符标签，全自动派生标签页
est: 45 # 预计用时（分钟）
source: Anthropic Engineering # 来源/作者（可选）
why: 为什么想学——记录当前阶段的动机或解决什么问题
status: todo # todo（默认）| learning（正在学，置顶展示）

## 核心要点与脉络（可选，可先记动机、提纲或抓取摘要）
```

### 操作流
1. 若用户提供了 URL，快速抓取网页提取标题、作者、标签与摘要。
2. 写入 `content/backlog/<slug>.md`。
3. 执行 `pnpm publish:content "feat(backlog): 新增 <title> 待学"`（或手动 `pnpm build && git add content/ && git commit -m "..." && git push`）。
4. 立即向用户回报条目信息与状态。


## 2. 新增已学（learned）

目标文件：`content/learned/<slug>.md`

- 与 backlog 结构一致，差异：
  - `date` 为学完日期。
  - 用 `duration: 60`（实际用时·分钟）替代 `est`。
  - 无 `status` 和 `why` 字段。
  - markdown 正文存放完整学习笔记/深度长文（正文存在时列表页自动显示 `note →`）。
- 提交发布同上：`pnpm publish:content "feat(learned): 新增 <title> 学习笔记"`。


## 3. 学完晋升（backlog → learned）

```bash
git mv content/backlog/<slug>.md content/learned/<slug>.md
```
- 修改 frontmatter：
  - `date` 改为学完日期。
  - 删掉 `status` 和 `why`。
  - `est` 字段重命名为 `duration`（实际耗时）。
  - 保留 `added: YYYY-MM-DD`（原 backlog 加入日期，用于展示"等了 n 个月"）。
- 补齐笔记正文。
- 提交发布：`pnpm publish:content "feat(learned): 晋升 <title> 学习笔记"`。


## 字段规范速查

- **分类与标签**：完全自动从 frontmatter 的 `category` 和 `tags` 派生，无需配置任何注册表。
- **tag 格式**：URL 安全的小写形式（`/^[a-z0-9][a-z0-9-]*$/`），如 `deep-dive`、`multi-agent`。
- **category 格式**：数组最多 2 级，如 `[Systems, Distributed]`。
