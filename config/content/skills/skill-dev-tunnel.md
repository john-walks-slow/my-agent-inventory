## 用途
- 给用户展示本地 dev/preview 站点；
- 外部回调（webhook）调试；
- 手机真机访问本地服务。

## 实现
使用 cloudflared quick tunnel（trycloudflare.com），免登录即用即走。

## 本机坑
本机有系统级 cloudflared 配置会静默覆盖 --url 参数，
导致隧道指向错误的后端。本技能含绕开方法与症状速查。
