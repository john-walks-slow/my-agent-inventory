## 核心难题
Agent 的进程本身运行在 DSH 内部。直接 `supervisorctl restart dsh` 会杀掉 Agent 连同 bash 命令一起终止。

## 安全方案
1. 用 setsid 延迟 detach 重启，让自己先脱钩；
2. 重启前必须先在单独端口验证 DSH 能稳定运行；
3. 验证通过才重启线上实例；
4. 重启线上实例前必须先征求用户书面同意。
