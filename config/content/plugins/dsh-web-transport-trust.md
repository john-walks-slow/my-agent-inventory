## 核心问题
在 Termux / 容器化环境通过公网隧道（如 Cloudflare Named Tunnel、noVNC 或移动端局域网）访问 DSH Web GUI 时，DSH 默认出于安全策略会将外部 IP 判定为非 loopback（只读或受限模式），导致设置页面变灰、无法保存 Provider Key 或修改全局配置。

## 解决方案
本插件向前端 index 注入 `globalThis.__DSH_TRANSPORT__ = { ownsHost: true }`，让经鉴权的远程会话完全拥有本地 Host 权限，真正实现随时随地远程控制手机/服务器上的 DSH 实例。
