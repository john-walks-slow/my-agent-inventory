# dsh-web-transport-trust

让 DSH Web 设置页在**任何访问路径**上可写（含公网域名/隧道），而不仅限于 127.0.0.1 / localhost。

## 背景

DSH 平台按浏览器地址栏是否为本机回环地址（localhost / 127.x / `[::1]`）决定 settings 的持久化模式：

- **loopback** → `host` 模式：设置页可读可写，保存持久化到 `settings.yaml`，全局生效；
- **非 loopback**（局域网 IP、公网域名 `dsh.<your-domain>` 等）→ `memory` 模式：**所有**设置 section（官方 General / Proactive 与插件页一致）显示「设置不可用」且不可写——这是平台防公网页面篡改本机配置的安全设计。

`--trusted-host` 只影响 `/api` 请求信任栅栏，不参与 settings 持久化判定。

## 原理

客户端连接判定 `isLoopback` 时有一条分支：`transport?.ownsHost === true` 也算 loopback。但正常 `dsh web` 从不注入 `globalThis.__DSH_TRANSPORT__`，该分支默认恒不生效。

本插件通过 webserver 的 `webserver/index-inject` 结构化注入，在页面加载早期写入：

```js
globalThis.__DSH_TRANSPORT__ = { ownsHost: true }
```

使浏览器端判定该传输为宿主持有 → settings 走 `host` 模式 → 所有设置页在**任意受信路由**下可读可写。

RPC 行为不变：`__DSH_TRANSPORT__.fetch` 缺失时连接层回退到 `globalThis.fetch`。

## 安全边界

- 本插件将**写设置**的权限扩展给所有能打开该页面的路由（含公网隧道）。仅在你信任传输本身、且 token / `--trusted-host` 栅栏可接受时启用。
- 建议浏览器的 API 信任栅栏（`--trusted-host`）与打开本插件的路由保持一致。

## 安装

1. `dependencies` 加 link 依赖：

   ```json
   "dsh-web-transport-trust": "link:~/plugins/dsh-web-transport-trust"
   ```

2. `dsh.profile.bundles` 数组追加包名（bundle 的 `cordis.patch.yml` 会自动 `insert` 加载项）：

   ```json
   "dsh-web-transport-trust"
   ```

3. `cd ~/.dsh/profiles/web && pnpm install`
4. 重启 dsh（`sv restart dsh` 或 setsid 延迟重启）。

## 验证

- `curl -s http://127.0.0.1:4175/ | grep -c '__DSH_TRANSPORT__'` 应 ≥ 1
- 浏览器设置页（任意路由）应显示可编辑表单而非「设置不可用」
