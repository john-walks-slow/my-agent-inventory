# chroot-devfs-pitfall（触发入口）

> **完整内容已合并进技能 `container-ops`**（章节「devfs 故障排查」）。
> 本技能保留名字与故障关键词，只为让「/dev 相关报错」的场景能按关键词被触发、再跳转到
> container-ops。**修故障时请先读 container-ops 对应章节**，避免两处维护。

## 铁律（唯一需要在本技能记住的）

**绝对不要往 rootfs 的 `/dev` `/proc` `/sys` 里 mknod 或重定向创建文件。**

- /dev 现在是宿主 Android /dev 的 rbind → mknod/写文件 = 直接写宿主 /dev，影响整个系统
- 重定向创建的普通文件会遮蔽真节点、留下 kernel stale 残留；节点会被 SELinux 打
  `app_data_file` 标签 → EACCES
- 唯一例外：`/dev/shm`（mkdir 1777 临时恢复运行中进程，canonical 是 tmpfs 由宿主挂）

## 症状速查 → 去 container-ops

| 症状 | 根因 | container-ops 章节 |
|---|---|---|
| 写 `/dev/null` 失败 / EACCES；zsh `/proc/self/fd/N` 打不开；git/apt 报 urandom/null | 野节点/遮蔽文件/mount 缺失 | devfs 故障排查 |
| multiprocessing / sem_open 裸 ENOENT（无文件名） | /dev/shm 缺失（每 boot 必丢） | devfs 故障排查（shm） |
| `os.ttyname(0)` 报 `[Errno 25] Inappropriate ioctl` | devpts 未 fresh newinstance | devfs 故障排查（devpts） |
| `browser_install` 报 `'python'` ENOENT | 裸 python 缺失 | devfs 故障排查（python wrapper） |
