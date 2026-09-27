---
title: "【实战排坑】孤儿 Vite 进程霸占 80% CPU 的排查与优雅杀死规范"
subtitle: "骁龙 865 手机容器发烫卡顿背后的进程树断裂迷局"
author: "John Ren"
date: 2026-09-14
readTime: "8 分钟"
tags: ["Process Management","CPU Leak","Termux","Linux"]
---
# 孤儿 Vite 进程霸占 80% CPU 的排查与优雅杀死规范

## 一、故障现象：手机发烫与响应骤降

在红米 K30S Ultra（骁龙 865，LineageOS 23.2）的 chroot Ubuntu 24.04 容器中，用户反馈使用 DSH 进行交互时出现明显的迟滞。执行 `top` 观察发现：
- CPU 空闲率（id）跌至 10% 以下；
- 负载均值（Load Average）高达 8.42；
- 列表中存在 3 个 `node /root/projects/.../node_modules/vite/bin/vite.js` 进程，各个稳占 25%~30% 的 CPU 核心。

奇怪的是，在 DSH 的 Web 终端中并未查看到对应项目的前台任务。

---

## 二、根因定位：断裂的进程树（Process Disassociation）

在非标准容器（Termux + chroot，PID 1 为 Android 的 `init`）中，不存在常规 Linux 的 `systemd --user` 会话监控。

当一个 Agent 通过后台子进程启动 `pnpm dev` 或 `vite` 时：
1. Vite 启动了自身的主进程；
2. Vite 又通过 `child_process.fork` 启动了 esbuild / rollup 编译工作进程；
3. 如果父任务由于会话重启、超时代替或非优雅退出（SIGKILL）中断，操作系统会将子进程托孤给 PID 1；
4. **esbuild 的文件监听器（inotify/fsevents）在某些 chroot 环境下陷入了密集无阻塞 poll 循环**，导致 CPU 占用直接顶格！

---

## 三、排查利器与实战命令

### 1. 定位到底是谁在吃 CPU
```bash
# 查看吃 CPU 最凶的前 5 个 node 进程及其运行时间
ps -eo pid,ppid,%cpu,etime,cmd --sort=-%cpu | grep node | head -n 6
```

### 2. 检查父子进程关系树
```bash
pstree -p -s <PID>
```
你会发现其父进程变成了 `init(1)` 或 `termux-services`，证明已是孤儿进程。

---

## 四、安全杀死与根治防护方案

### 方案 A：针对性批量收割孤儿 Node 进程
```bash
# 谨防误杀 DSH 自身（DSH 也在 node 下运行），必须精准正则匹配！
ps -ef | grep "vite/bin/vite" | grep -v grep | awk '{print $2}' | xargs -r kill -9
```

### 方案 B：在启动脚本中引入 `exec` 与进程组清理
编写启动脚本时，务必使用以下范式包裹：
```bash
#!/bin/bash
# 开启作业控制，使信号能下发给整个进程组
set -m
# 捕获退出信号
trap 'kill -- -$$' SIGINT SIGTERM EXIT

vite --host 0.0.0.0 --port 5180 &
wait $!
```

---

## 五、总结与经验条目

1. **容器无小事**：没有 systemd 的环境必须格外警惕子进程托管问题；
2. **监控警报**：建议在 DSH 心跳任务中加入定期的 CPU 异常检测脚本；
3. **保持冷酷**：凡是占用 CPU > 50% 且运行超过 2 小时的非守护进程，坚决排查其正当性！
