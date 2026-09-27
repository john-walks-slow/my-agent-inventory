## 触发条件
当出现以下症状时自动触发本技能索引：
- 写 /dev/null 失败、/proc/self/fd/N 打不开；
- git/apt 报 urandom/null EACCES 错误；
- multiprocessing/sem_open 裸 ENOENT（/dev/shm 缺失）；
- os.ttyname 报 Inappropriate ioctl（devpts 挂载异常）；
- browser_install 报 'python' ENOENT。

本技能只做触发与索引，故障细节、命令与完整逻辑一律见 container-ops 技能。
