## 极其珍贵的一手嵌入式/容器排坑结晶
详细记载了在 Android Termux + chroot-distro Ubuntu 24.04（真实 root、无 systemd、PID 1 为 Android init）环境下的完整运维手册：
1. 启动链与真实 mount 命名空间；
2. Devfs 安全铁律：绝对禁止往 rootfs /dev /proc /sys 里 mknod 或裸写文件；
3. /dev/shm 内存盘重建与 multiprocessing 跨进程通信支持；
4. Supervisord 服务快捷管理命令（sv status, sv restart, svlog）；
5. 8GB 物理内存下的高危进程 OOM 护栏与 Swap 调优策略。
