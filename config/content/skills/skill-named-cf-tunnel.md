## 与临时隧道的区别
- 域名固定不变，重启不变；
- 通过系统 Named Tunnel 实现，走 Cloudflare Edge CDN；
- 可配合 Cloudflare Access 规则阻拦恶意扫描；
- 适合持久部署站点、新增服务入口。

## 前置条件
需要已配置的 Cloudflare Named Tunnel（cloudflared 守护进程）和自持域名。
