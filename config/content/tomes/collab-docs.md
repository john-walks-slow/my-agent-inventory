# 文档规范与协作通例

> 全局指令 `~/.dsh/AGENTS.md` 原文同步。

## 文档规范

采取极简文档策略：文档的目标是给新加入开发的成员一个 Quick Start、并将关键历史留作记录，而不是把代码逻辑在文档中重述一遍。

我们维护以下文档文件：

## AGENTS.md

项目级指引。
**进行任何工作前，必须确保已了解其中内容。**
更新规则见 `/update-project-instruction`。

## {module_path...}/AGENTS.md

模块/子模块级指引。
**就某一模块进行任何工作前，必须确保已了解其中内容。**
更新规则见 `/update-module-instruction`。

## docs/features/yymmdd-{feature_name}/

|- yymmdd-{topic}.research.md (optional)
|- yymmdd-{feature_name}.plan.md
|- yymmdd-{feature_name}.review.md (optional)
|- yymmdd-{feature_name}.summary.md
|- yymmdd-{feature_name}.validation.md (optional)
|- e2e/yymmdd-{topic}/yymmdd-{topic}-e2e-report.md (optional)

需求计划和实施状态记录。根据工作流中的要求，在计划、开发、验证、检视阶段完成时及时更新。当需要回顾特定需求的策略和进展时查看。

## docs/issues/yymmdd-{issue_name}/

|- yymmdd-{issue_name}.troubleshoot.md
|- yymmdd-{issue_name}.review.md (optional)
|- yymmdd-{issue_name}.summary.md
|- yymmdd-{issue_name}.validation.md (optional)
|- e2e/yymmdd-{topic}/yymmdd-{topic}-e2e-report.md (optional)

问题修复记录。根据工作流中的要求，在问题复现、分析、修复、验证、检视阶段完成时及时更新。当需要回顾特定问题的分析和解决进展时查看。

## docs/references/yymmdd-{topic}.md

不归属于特定模块和需求的领域级规范（例：设计规范、测试规范），可以被模块和项目级指引引用。
更新规则见 `/update-references`。

## docs/freeform/yymmdd-{topic}.md

不归属于特定模块和需求的其他记录。

## README.md

面向用户的说明入口。发布前需确保 README 已覆盖开始使用所需的全部配置说明。

## 约定与通例

## 多 Agent 协作

本工程同时由多个 Agent 修改，总是假定有其他 Agent 或人类在同时工作。不要处理你的改动范围之外的变化。
除非你用 git diff 确认过，不要认为一个文件里只包含你自己的修改！
未经用户书面同意，禁止使用以下命令（它们可能破坏他人的工作）：

- `git stash`
- `git checkout`
- `git restore`
- `git reset`。

> 特例：当你在独立 worktree 中工作时不受此限。

## Shell 使用规则

执行任何会修改文件内容（例如批量替换）的批处理脚本/命令前，**必须** 先 dry run。
如果在运行必要命令时权限遭到拒绝，可告知用户需要执行的命令，请他手动执行。

## 版本管理规则

- 新建项目时，总是使用 Git 进行版本管理
- 提交消息默认模板：

```
# head: <type>(<scope>): <subject>
# - type: feat, fix, docs, style, refactor, test, chore
# - scope: can be empty (eg. if the change is a global or difficult to assign to a single component)
# - subject: start with verb (such as 'change'), 50-character line
#
# body: 72-character wrapped. This should answer:
# * Why was this change necessary?
# * How does it address the problem?
# * Are there any side effects?
#
# footer: 
# - Include a link to the ticket, if any.
# - BREAKING CHANGE
#
```

## 子代理使用规则

- 明确说明任务背景、你的需求、产物要求、相关文档，供子代理快速开始，但无需微管理子代理行事方式。
- 当输入或输出信息超过 1000 字时，必须以文件引用的形式传递。

正例：将计划文件链接提供给子代理
反例：向子代理复述计划全文

正例：要求子代理将报告以文件形式输出到指定路径，并仅回复输出文件的链接
反例：不做要求，子代理直接回复2000字的报告文本

## 默认测试范围

简单修改默认无需测试。

编写和执行测试时，必须注意控制测试的范围和粒度：

- 编写测试：仅为核心真实场景和容易出错的逻辑添加测试用例。用例要有意义、能真正减少问题，不要写过于显而易见的、仅为提高 coverage 数字的用例。
- 运行测试：严格按本次改动的业务影响面决定执行哪些用例，只跑受影响的模块；严禁无差别全量跑历史用例。
- 测试分层：涉及外部 API 或高负载运算时，优先通过 Mock、假流注入、缓存或会话复用进行测试。确需真跑时单点单测，确保排除在日常测试范围之外，防止后续日常开发产生无意义开销。
