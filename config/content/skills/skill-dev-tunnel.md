# dev-tunnel（开发调试用 CF 临时隧道）

## 何时用

- 给用户（或外部协作者）看还在本地的 dev / preview 站点
- 调试需要公网回调的服务（webhook、OAuth redirect、支付通知）
- 手机真机访问容器内的本地服务
- **不需要** Cloudflare 账号 / 登录 / token——quick tunnel 是匿名的

## 一行命令

```bash
bash ~/.agents/skills/dev-tunnel/scripts/dev-tunnel.sh 4325   # 端口默认 4325
# → https://xxx-xxx-xxx.trycloudflare.com
```

返回 URL 即用。停止：`dev-tunnel.sh stop [port]`；查状态：`dev-tunnel.sh status [port]`（端口默认 4325）。

**记账按端口隔离**：pidfile/log 是 `/tmp/dev-tunnel-<port>.{pid,log}`。幂等只在同一端口内成立——
A 端口已有隧道时再来问 B 端口，会**新开**B 自己的隧道，不会把 A 的 URL 冒领给 B
（2026-10-04 修复：旧版单一全局 `/tmp/dev-tunnel.pid`，换端口复用时会把别人的 URL 报成你的，
`stop` 也会误杀别人的隧道）。`stop <port>` 只关那个端口的实例，绝不碰系统命名隧道。

等价的裸命令（脚本做的事）：

```bash
: > /tmp/empty.yml
nohup cloudflared tunnel --url http://127.0.0.1:4325 --no-autoupdate \
  --config /tmp/empty.yml > /tmp/tunnel.log 2>&1 &
grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/tunnel.log | head -1
```

## 本机关键事实（apollo 容器）

1. **cloudflared 在 `/usr/local/bin/cloudflared`**（2026.8.2，arm64）。
2. **`/etc/cloudflared/config.yml` 会被自动加载**——里面是系统命名隧道 `<tunnel-id>-…`，16 条 ingress 规则（models/codeg/term/…/dsh.<your-domain>），catch-all 是 `http_status:404`。不绕开它时，`--url` 参数**被静默忽略**，所有请求落到 catch-all → 边缘返回 404 空响应。**必须 `--config` 挂一个空文件**（脚本里的 `/tmp/dev-tunnel-empty-config.yml`）。
3. **绝不能杀系统隧道进程**：`ps` 里 `/usr/local/bin/cloudflared --protocol=http2 tunnel --config /etc/cloudflared/…` 那个是常驻服务（用户靠它访问 dsh GUI 等）。只杀自己起的 `tunnel --url` 实例（脚本用 pidfile + 空配置路径双重定位，不会误伤）。
4. 代理环境：容器走 Clash（127.0.0.1:7890）。curl 测隧道时加 `--noproxy '*'` 排除干扰；cloudflared 自身的 QUIC 出站不受影响。

## 症状速查

| 症状 | 原因 | 解法 |
|---|---|---|
| 边缘 404、响应体为空、`server: cloudflare` | `/etc/cloudflared/config.yml` 的 ingress 覆盖了 `--url`（debug 日志可见 `ingressRule=16 originService=http_status:404`） | `--config` 指向空文件 |
| 403 + `Blocked request. This host … not allowed … allowedHosts in vite.config.js` | **请求其实已到达源站**，是 Vite/Astro preview 的 Host 校验（DNS rebinding 防护）拒了隧道域名 | `astro.config.mjs` 的 `vite.preview.allowedHosts: ['.trycloudflare.com']`；纯 Vite 项目则 `server.allowedHosts`；dev 和 preview 都要加 |
| URL 已分配但 curl 一直 404 | quick tunnel 边缘传播延迟（一般 <15s） | 等几秒重试 |
| 502 Bad Gateway | 隧道通了但源站没起 / 端口错 | 先 `curl 127.0.0.1:<port>` 确认源站 |
| 日志只有 1 条 `Registered tunnel connection` | 正常现象（quic 协议下常见，不影响使用） | 无 |

诊断技巧：`--loglevel debug` 重跑，请求行会打出 `ingressRule=N originService=…`，直接看路由到了哪条规则。

## 长期方案（对比）

- quick tunnel：零配置零登录，但 URL 随机、进程关了就失效、无 SLA——适合临时给人看。
- 要长期/固定域名：往系统命名隧道 `/etc/cloudflared/config.yml` 加一条 `hostname: xxx.<your-domain> → http://127.0.0.1:<port>` 并重启系统隧道。**这会短暂影响该隧道的全部现有入口（含 dsh GUI），动之前先和用户确认。**

## 收尾

用完 `dev-tunnel.sh stop`。残留进程兜底：`pkill -f "cloudflared.*dev-tunnel-empty-config"`（只匹配空配置实例，安全）。
