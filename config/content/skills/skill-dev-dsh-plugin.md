# dev-dsh-plugin（DSH 插件开发）

## 核心坑：link 包依赖未声明 → dsh 崩溃循环

**已反复犯。** dsh 插件以 `link:` 形式接入 profile（`~/.dsh/profiles/web/package.json`
里 `"dsh-wait-subagent": "link:~/projects/dsh-wait-subagent"`）。这些插件目录在 dsh
profile 的 pnpm workspace 之外，Node ESM 解析 `import ... from "@deepseek-ai/dsh-tools"`
时沿目录树向上 walk 到 `/root` 都找不到包 → `ERR_MODULE_NOT_FOUND` →
`plugin tree failed to load` → dsh 崩溃 → supervisor `autorestart` 反复拉起反复崩 →
`startretries` 耗尽后 STOPPED，dsh 彻底不可用。

### 症状

- `/var/log/dsh.log` 反复出现：
  `Error: dsh: plugin tree failed to load: ... Cannot find package '@deepseek-ai/dsh-tools'`
- `sv status dsh` 显示 `STARTING` 或 `FATAL`，进程反复起死
- 每个 plugin tree failed to load 都会让整个 dsh 挂掉（一崩全崩，不是单插件降级）

### 根因

插件 `lib/index.js` import 了 `@deepseek-ai/dsh-tools`（或其他 `@deepseek-ai/*` 包），
但插件的 `package.json` **没声明 `dependencies`**，也没有自己的 `node_modules`。
pnpm 的 hoisting 只覆盖 workspace 内包；link 到 workspace 外的目录（`~/projects/...`）
解析不到 hoist 上来的依赖。

对比：dsh-proactive 是 link 到 `~/projects/dsh-proactive/...` 的本地项目包，它在
**自己项目 workspace** 的 `.pnpm` store 里有 dsh-tools 的软链，所以能解析。`~/projects` 下的裸插件目录（无 workspace）没有这层，就解析不到。

### 修复（正向，每次新增/修改插件必做）

1. **声明依赖**：插件 `package.json` 加 `dependencies`，版本对齐 dsh 主包实际锁定的版本：

   ```json
   "dependencies": {
     "@deepseek-ai/dsh-tools": "0.1.1-rc.2"
   }
   ```

   查主包锁定版本：
   ```bash
   node -e "console.log(require('/usr/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-tools/package.json').version)"
   ```

2. **本地安装**：在插件目录 `npm install --no-audit --no-fund`，让它有自己的 `node_modules`。

3. **验证**：改动后**不要直接重启线上 dsh**，先单独端口验证（见 [[restart-dsh]]）。

### 防御检查清单（改完插件、重启 dsh 前过一遍）

- [ ] 插件 `lib/*.js` 里所有 `import ... from "@deepseek-ai/*"` 或第三方包，
      是否都在 `package.json` 的 `dependencies` 里声明了？
- [ ] 插件目录有 `node_modules`，且 `node -e "require.resolve('<pkg>', {paths:['~/projects/<plugin>']})"` 能解析？
- [ ] 如果是 build 产物（如 dsh-proactive 的 `lib/panel/service.js`），源项目已 `pnpm build` 且产物齐全？
- [ ] `export const inject = [...]` 数组**写全**了插件直接访问的每一个 ctx 服务？
      （漏掉的每个服务运行时会炸，见下方「核心坑：inject 数组必须写全」）

## 核心坑：inject 数组必须写全 → 运行时崩溃

**踩过。** dsh-set-model 在 `inject` 数组里只写了 `["tools", "llm", "agents"]`，
但代码里直接访问 `(ctx as any).sessionProjections`，cordis 在活跃 fiber 下对
**未声明注入**的服务属性访问会直接抛错：

```
Error: cannot get property "sessionProjections" without inject
```

### 症状

- **启动正常，插件能加载**——错误只在运行时（事件回调、tool execute）访问该属性时炸
- `?.` 可选链**防不住**：`ctx.sessionProjections?.x` 也是在求值 `ctx.sessionProjections`
  时触发了 proxy 的 `get` trap，属性本身 throws，可选链拿不到这个异常

### 根因

cordis 的 ctx 是 proxy：`get` trap 里 `Reflect.has(target, prop)` 不存在且
`fiber` 未注入该服务时，抛 `cannot get property "${prop}" without inject`。
不写进 `inject` 数组 = 该服务在此 fiber 无 runtime 记录，访问即抛。

### 修复（正向）

1. **`inject` 数组写全**：插件直接访问的所有 ctx 服务都列上：

   ```ts
   export const inject = ["tools", "llm", "agents", "sessionProjections"];
   ```

2. **可选依赖**：若某服务可能存在也可能不存在的组合，用
   `ctx.inject(["sessionProjections"], (injectedCtx) => { ... })` 包裹，回调内
   再访问该服务（peers: dsh-plan-mode、dsh-mnemon 都这样用）。

3. **验证**：同 link 依赖坑——不要直接重启线上 dsh，先单独端口验证（见 [[restart-dsh]]）。
   但注意此坑是**运行时**才暴露，启动验证看不出来；需构造一次真实访问路径
   （如触发一次 tool 调用 / 事件）确认不抛 `without inject`。

## 核心坑：client bundle 构建产物语法错误 → combo bundle 炸 → typert-registry "loaded without registering"

**踩过。** dsh-clear-mind 的 `scripts/build-client.mjs` 用 esbuild 生成 lazy-CJS
bundle，手动拼接 `window.__ModuleLoader__.load({ id, factory: ... })` wrapper，
但 `wrapped` 数组漏了结尾的 `"});"`——只写到 `"\t}"`（factory 闭合），没闭合
`load({` 调用。生成的 `lib/client.js` 缺最后两字符，**单看文件几乎不可能发现**。

### 症状

- web 端报 `Failed to load plugins / failed to import loader entry <hash>
  (@deepseek-ai/dsh-typert-registry): bundle ...&rev=<rev> loaded without
  registering "@deepseek-ai/dsh-typert-registry" via __ModuleLoader__.load`
- **typert-registry 是无辜的**：它只是 application combo bundle 里第一个 entry。
  combo bundle 把几十个 entry 的 client.js 拼成一个大 JS 文件，任一 entry 的
  factory body 有语法错误 → 整条 bundle 执行中断 → 没有任何 entry 注册成功 →
  浏览器报"第一个 entry（typert-registry）loaded without registering"。
- 浏览器 console 同时有 `Unexpected token ';'`（或其他 SyntaxError）——这是
  真正的定位线索，但容易被 typert 报错淹没。
- server 端日志正常，combo bundle 返回 200；问题纯在浏览器侧执行。

### 根因

1. build 脚本手拼 wrapper 漏闭合括号（本例）。
2. 或 factory body 里有顶层 `;`、裸语句等 CJS 语法问题，esbuild 没拦住。
3. combo bundle = 多 entry 拼接，**一处语法错全条炸**，报错指向第一个 entry。

### 修复（正向）

1. **构建后必跑 `node --check lib/client.js`**：语法错误会被 node 直接抓到，
   不需要浏览器。这是最快、最可靠的防线。
2. build 脚本的 wrapper 拼接要完整闭合 `load({ ... })`：

   ```js
   const wrapped = [
     "window.__ModuleLoader__.load({",
     "\tid: \"<plugin-id>\",",
     "\tfactory: (require) => {",
     "\t\tvar module = { exports: {} };",
     "\t\tvar exports = module.exports;",
     body,
     "\t\treturn module.exports;",
     "\t}",   // ← 闭合 factory 函数
     "});"    // ← 闭合 load() 调用，别漏！
   ].join("\n");
   ```

3. **端到端验证**：server 正常不代表 client 正常。用无头浏览器（playwright +
   google-chrome）带 token cookie 加载 `http://127.0.0.1:4175/?token=X`，捕获
   console.error 和 pageerror（见 [[restart-dsh]]）。combo bundle 的语法错误
   只在浏览器侧暴露。

### 防御检查清单补充

- [ ] 有 `lib/client.js` 的插件：build 后 `node --check lib/client.js` 通过？
- [ ] build 脚本手拼 `__ModuleLoader__.load` wrapper 的，结尾有 `});`？
- [ ] `__ModuleLoader__.load({ id: ... })` 的 **id 等于包名**（=graph row
      id），不是 cordis.patch.yml insert 的短 id？（2026-09-19 token-game
      panel spike 实测：id 写错 → 整个 62-entry application combo 被二次执行
      → `duplicate factory registration for @deepseek-ai/dsh-typert-registry`
      → 整页 Failed to load plugins。**现象与语法错误完全同构但根因不同**
      ——排查 combo 炸时先核对 load id 与包名。）
- [ ] 端到端：无头浏览器加载页面，console 无 `Unexpected token`、无
      `loaded without registering`？

## 核心坑：e2e 临时实例必须用独立 DSH_HOME（否则对撞损坏线上会话日志）

**踩过，反复。** 临时实例（`dsh web --port 4176 --patch ...`）默认共享
`~/.dsh`，与线上 4175 共用同一 sessions 目录。同一 session id 被两个进程
驱动时：turn 被打断 → 恢复路径追加 end-seed/合成 closers → 陈旧游标的存活写入
方继续 append → seq 对撞。0003 守卫（`assertNoSeqOverlap`）会拒绝坏写入，但
**陈旧写入方的内存会话卡死**（反复重试被拒，用户再发消息报「本轮运行失败」，
只能重启对应实例重建）；且 2026-09-15~17 守卫生效前已损坏 6 份日志。

### 症状

- `corrupt session log: refusing append to "..." overlapping stored sequence
  numbers (batch starts at N, stored events end at M)` —— 0003 守卫在工作，
  日志本身没坏；卡的是触发报错的那个进程的内存会话
- 用户对该会话再发消息 →「本轮运行失败」重复报同一拒绝 → 重启触发方进程即恢复
  （盘上数据连续，新进程从盘上重建）

### 修复（正向）：用 worktree 最小 e2e 实例（dsh-e2e 托管）

启动方式、脚本规范统一见 [[dsh-e2e]]。要点：

```bash
cd <插件 worktree>
dsh-e2e start && dsh-e2e wait && dsh-e2e run e2e/x.mjs
```

- **必须走 `dsh-e2e` 脚本**，禁止裸 `dsh web --port ...` 启动（home 隔离、端口分配、进程清理协议都在脚本里）
- home 在 `<worktree>/.dsh-e2e-home`，最小插件组合（base + web-app + 本插件），随 worktree 销毁即弃
- 端口由 acquire-port 动态分配；4175 线上（supervisor）、4176/4188 均已废弃
- e2e 脚本读 `DSH_E2E_PORT` / `DSH_E2E_HOME` 环境变量，禁止硬编码端口和 `~/.dsh-e2e` 路径
- **绝不共享 DSH_HOME 跑双实例**；必须共享时，同一会话只能被一个实例驱动

### 防御检查清单补充

- [ ] e2e 实例只通过 `dsh-e2e start` 启动（不裸跑 `dsh web`，
      不共享线上 home，不共享其他 worktree 的 home）
- [ ] e2e 会话 id 不与线上会话重叠（隔离 home 下天然不重叠）

## DSH 插件结构速查

一个 dsh 插件包的最小结构：

```
<plugin>/
├── package.json          # name/version/type:module/exports/dependencies
├── cordis.patch.yml      # bundle patch 层：声明 loader entry（insert id/name）
├── lib/
│   └── index.js          # 入口，import dsh-tools 等
└── README.md
```

- `package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`
- `cordis.patch.yml` 用 `- insert: [{ id: <id>, name: <pkg-name> }]` 注册 loader entry
- profile `package.json` 的 `dsh.profile.bundles` 数组列出该包名，`dependencies` 用 `link:` 指向目录

## 发布上架与 README 撰写（摘要）

完整生态地图、dsh-market 搜索机制（源码逆向）、分渠道流程、发布前 checklist 与 reference 链接，见 [references/publish-and-marketplace.md](references/publish-and-marketplace.md)。速记：

- **双渠道**：npm 预构建（官方推荐；`prepare: "npm run build"` + `prepublishOnly: "npm test"`；实际发布动作走 [[npm-publish]] 指纹发布）+ GitHub 公开仓库（自包含 prepare；pnpm ≥10 用户侧 allowBuilds）
- **收录**：自动市场全扫 GitHub topic `dsh-plugin`，打 topic 等刷新即可；awesome-dsh-plugin 人工收录：仓库满 1 天 + PR 一个 `data/plugins/<owner>__<repo>.yml`（双语描述 keyword 密集，会被对着代码核）
- **dsh-market 搜索**只索引 awesome 条目字段（name/npm/owner/双语 description/分类），README 不参与——双语描述是唯一搜索优化面
- **README**：中文主体 + README.en.md + 顶部语言切换（panda-calendar 模式）；四件套 = 一行价值 / 可复制安装命令 / 截图或真实输出 / 权限声明；仓库根 `screenshots.json`（1-8 张）控制市场详情页
- **验证**：发布验证走 scratch profile（验完即删），线上 profile 保持 `link:` 本地开发目录

## 关联

- [[npm-publish]]：npm 包指纹发布（2FA/passkey 现实；无 TTY 吞认证链接坑）
- [[dsh-e2e]]：e2e 测试实例标准用法（worktree 最小实例 + run 互斥）
- [[restart-dsh]]：改完插件后安全重启 dsh（含单独端口验证步骤）
- [[repair-dsh-session-log]]：会话日志损伤修复（守卫拒绝≠日志坏了，先扫描确认）
- 容器/服务总览见 AGENTS.md「服务清单 dsh」
