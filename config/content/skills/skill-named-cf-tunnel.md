# named-cf-tunnel（系统命名隧道：固定域名永久暴露本地服务）

## 与 dev-tunnel 的区别

| | dev-tunnel（quick tunnel） | named-cf-tunnel（命名隧道） |
|---|---|---|
| URL | 随机 trycloudflare.com | 固定自定义域名 |
| 持久性 | 进程结束即失效 | 持久，开机自动恢复 |
| 用途 | 临时调试、展示 | 生产/长期部署 |
| 需要账号 | 否 | 是（已配置好，无需重新认证） |

## 本机现有配置

- **系统隧道 ID**：`<tunnel-id>`
- **凭据文件**：`~/.cloudflared/<tunnel-id>.json`
- **ingress 配置**：`/etc/cloudflared/config.yml`
- **supervisor 程序名**：`cloudflared`（由 `/etc/supervisor/conf.d/services.conf` 托管）

## 完整操作流程（新增一个服务入口）

### 第 1 步：确保本地服务持久运行

把目标服务加入 supervisord（以便开机自启、崩溃自恢复）：

编辑 `/etc/supervisor/conf.d/services.conf`，在末尾追加：

```ini
[program:my-service]
command=/usr/bin/python3 -m http.server 4325 --bind 127.0.0.1
directory=/path/to/project
autostart=true
autorestart=true
startsecs=2
startretries=5
stopasgroup=true
killasgroup=true
stdout_logfile=/var/log/my-service.log
redirect_stderr=true
stdout_logfile_maxbytes=5MB
stdout_logfile_backups=3
```

热加载（**不重启** supervisord，不影响其他服务）：

```bash
supervisorctl reread && supervisorctl update
supervisorctl status my-service  # 应该显示 RUNNING
```

### 第 2 步：在 ingress 配置里加一条规则

编辑 `/etc/cloudflared/config.yml`，在最后的 catch-all（`- service: http_status:404`）**前面**插入：

```yaml
- hostname: myapp.<your-domain>
  service: http://127.0.0.1:4325
```

> ⚠️ 顺序很重要！hostname 规则必须在 catch-all 前面，否则永远命中 404。

### 第 3 步：在 Cloudflare DNS 添加 CNAME 记录

```bash
cloudflared tunnel --config /etc/cloudflared/config.yml \
  route dns <tunnel-id> myapp.<your-domain>
```

输出 `Added CNAME myapp.<your-domain> which will route to this tunnel` 即成功。

### 第 4 步：重启 cloudflared 使 ingress 规则生效

```bash
supervisorctl restart cloudflared
sleep 8
supervisorctl status cloudflared  # 应该显示 RUNNING
```

> ⚠️ 重启 cloudflared 会导致所有现有入口（含 dsh GUI）短暂中断 5~10 秒，属正常现象。

### 第 5 步：验证

```bash
sleep 10
curl -s -o/dev/null -w "%{http_code}" --noproxy '*' https://myapp.<your-domain>/
# 返回 200 即成功
```

## 现有入口清单（截至 2026-09-16）

| 域名 | 本地端口 | 说明 |
|---|---|---|
| models.<your-domain> | 9999 | LLM 模型网关 |
| codeg.<your-domain> | 3080 | Code Editor |
| term.<your-domain> | 7681 | ttyd 终端 |
| pan.<your-domain> | 5244 | Alist 网盘 |
| webdav.<your-domain> | 18480 | WebDAV |
| vnc.<your-domain> | 6080 | noVNC |
| index.<your-domain> | 8080 | 导航首页 |
| stats.<your-domain> | 19999 | Glances 监控 |
| sync.<your-domain> | 8384 | Syncthing |
| music.<your-domain> | 4533 | Navidrome |
| vault.<your-domain> | 8000 | Vaultwarden |
| chat.<your-domain> | 3001 | 聊天服务 |
| search.<your-domain> | 4444 | Degoog 搜索 |
| dsh.<your-domain> | 4175 | DSH Web UI |
| anotherworld.<your-domain> | 4325 | AnotherWorld 游戏化站点 |
| tokenspeed.<your-domain> | 8000 | Token Speed |
| ssh.<your-domain> | 22 | SSH |

## 常见问题

| 症状 | 原因 | 解法 |
|---|---|---|
| curl 返回 404、body 为空 | ingress 规则顺序错误或未重启 cloudflared | 检查 config.yml 顺序，重启 cloudflared |
| DNS 解析失败（Could not resolve） | CNAME 未添加 | 执行第 3 步 `route dns` 命令 |
| 502 Bad Gateway | 本地服务未启动或端口错误 | `curl 127.0.0.1:<port>` 先确认本地服务 |
| cloudflared 重启后其他服务断连 | 正常，重启期间约 5~10 秒中断 | 等待即可 |

## 注意事项

- **不要直接 kill 系统 cloudflared 进程**，必须用 `supervisorctl restart cloudflared`。
- 每新增域名都要同时做：① ingress 规则 + ② DNS CNAME + ③ 重启 cloudflared，三步缺一不可。
- supervisor 的 `reread + update` 只热加载新程序，**不重启** cloudflared，是安全操作。
