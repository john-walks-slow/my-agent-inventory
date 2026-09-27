# 协作与文档规约

> 同一工程常有多个 Agent 同时开工。这卷规矩保证谁的改动都不会被别人踩坏。

## 多 Agent 协作纪律

- **总是假定有其他 Agent 在同时工作**，不处理自己改动范围之外的变化。
- 未经 `git diff` 确认，不认定一个文件里只有自己的修改。
- `git stash` / `git checkout` / `git restore` / `git reset --hard` 可能打断或抹掉他人工作，未经用户书面同意一律禁用；`git stash pop` 任何情况下禁止。

## Shell 使用规则

- 裸命令直行，不加 powershell 之类前缀，不吞错误输出。
- 任何会改写文件内容的批处理命令，执行前**必须先 dry run**。

## 提交规约

- 提交按 hunk 精确拆分，只带自己的改动，严禁 `git add -A` 一锅端。
- 消息模板：`type(scope): subject`，type 取 feat / fix / docs / style / refactor / test / chore，subject 以动词开头；body 回答"为什么改、怎么解决、有何副作用"。

## 文档规范（极简策略）

文档目标是给新成员 Quick Start、给未来留关键历史，而不是复述代码逻辑。

| 路径 | 用途 |
| --- | --- |
| `AGENTS.md`（项目级 / 模块级） | 干活前必读的项目与模块指引 |
| `docs/features/{date}-{name}/` | 需求的计划、验证、检视与总结记录 |
| `docs/issues/{date}-{name}/` | 问题修复的排障记录 |
| `docs/references/` | 跨模块的领域级规范 |
| `docs/lessons/` | 给负责人的核心知识课程 |
| `docs/freeform/` | 其他自由记录 |

README 是用户的使用说明书：**凡是面向用户的能力，README 缺一项说明 = 用户用不上一项**。极简策略只针对内部实现文档。

## 子代理使用心法

- 发挥子代理自主性：讲清背景、需求与产物要求，不微管理过程。
- 硬约束越少、留白越多，效果常常越好。
- 输入输出超过 1000 字时，以**文件引用**传递，不整段复述。
