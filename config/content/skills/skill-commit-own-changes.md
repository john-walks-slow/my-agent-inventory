## 为什么需要
在多 Agent 同时工作的环境中，`git add .` 会把其他 Agent 的改动一起提交，造成混乱。

## 核心规则
- 执行任何 `git add` 或 `git commit` 前必须使用本技能；
- 基于 git diff 逐 hunk 选择性添加，只提交属于当前任务的改动；
- 例外：若当前在单独 worktree 中工作，则无需使用本技能。
