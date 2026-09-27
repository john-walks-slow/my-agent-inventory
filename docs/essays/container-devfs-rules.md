---
title: "【核心铁律】容器 Devfs 架构与 /dev /proc /sys 安全避坑手册"
subtitle: "写错一个重定向，导致全盘只读与宿主崩溃的惨痛教训"
author: "John Ren"
date: 2026-08-28
readTime: "12 分钟"
tags: ["Kernel","Devfs","Chroot","SELinux"]
---
# 容器 Devfs 架构与 /dev /proc /sys 安全避坑手册

## 铁律概括：永远不要试图向 chroot 的 /dev 写入普通文件！

在宿主与容器共享命名空间的极简 Linux 容器中，新手最常犯的一个毁灭性错误就是：
```bash
# 致命操作示例！
echo "test" > /dev/null
```
如果此时 `/dev` 挂载点尚未正确绑定宿主的 `tmpfs`，这一行命令就会在 rootfs 文件系统上创建一个名为 `null` 的**普通文件**，彻底覆盖并遮蔽原本的字符设备节点！

---

## 连锁灾难后果

1. **git / apt 崩溃**：无法打开 `/dev/urandom` 或写入 `/dev/null`，报 `EACCES (Permission Denied)`；
2. **多进程共享内存失效**：Python `multiprocessing` 和 PyTorch 依赖 `/dev/shm`，缺少 tmpfs 挂载时直接抛出 `sem_open: No such file or directory`；
3. **PTY 伪终端错乱**：无法分配交互式 TTY，SSH / noVNC 会话瞬间断开。

---

## Canonical 挂载树基准（必须严格核对）

在启动 Ubuntu 容器脚本中，必须确保以下挂载点依序建立：

```bash
# 1. proc & sys
mount -t proc proc /rootfs/proc
mount -t sysfs sys /rootfs/sys

# 2. devtmpfs 与绑定
mount --bind /dev /rootfs/dev
mount --bind /dev/pts /rootfs/dev/pts

# 3. 极其重要的共享内存 tmpfs
mount -t tmpfs -o rw,nosuid,nodev,noexec,mode=1777,size=2G tmpfs /rootfs/dev/shm
```

## 紧急救砖恢复清单

若已不慎误写了普通文件破坏了设备节点：
1. 立即停止容器内所有进程；
2. 退出到 Android Termux 宿主终端；
3. 检查 `/data/data/com.termux/files/rootfs/dev/null` 是否为 `c 1 3` 字符设备；
4. 若为普通文件，直接 `rm -f` 删除，并重新执行挂载脚本重建绑定。
