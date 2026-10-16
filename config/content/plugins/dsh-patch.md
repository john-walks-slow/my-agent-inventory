# dsh-patch

dsh（`@deepseek-ai/dsh`）的部署补丁集。这些补丁修的是本机部署上 dsh 的问题，
其根因在 dsh 上游代码里，但上游尚未修，所以以补丁形式打到已安装的 dsh 包上。

> ⚠️ **升级 dsh 会覆盖这些补丁**——每次 `npm i -g @deepseek-ai/dsh`（或等价升级）后，
> **必须**重新跑 `./apply.sh` 全部重打。`apply.sh` 是幂等的（已应用会跳过，上下文不匹配会报错而非静默失败）。
>
> **血泪教训（2026-10-05）**：2026-09-28 升级到 0.1.7-rc.2 后没人重跑 `apply.sh`，
> 而 0001 恰好因 rollup chunk 改名而 context-mismatch → **补丁静默失效一周**，
> 期间症状就是本 README 里写的「会话列表加载不出 + 单核 100%」。现在 `apply.sh` 会
> 自动把补丁里的 `runner-launch-<hash>.js` 重写为当前安装的 chunk 名，仅剩真正的
> 上下文漂移才会失败。判断当前是否已全部就位：直接跑 `./apply.sh`，全是 `⊘ already applied` 即健康。

## 补丁清单

### 0001-subprocess-local-orphan-poll-backoff.patch

**症状**：dsh web 会话列表 / 会话首次加载极慢（本地直连 session.list 也要 ~12s），
dsh 进程空闲时仍占满 ~80% CPU。

**根因**：`@deepseek-ai/dsh-subprocess-local` 的 fallback owner（本机无 systemd，
只能走 PGID 兜底路径）里 `while (alive()) await sleepTick()`（`sleepTick` = 15ms）
在直接子进程 `settled` 后，对“组长已死、孤儿仍活”的进程组（典型：从 bash 工具
用 `nohup ... &` 起的 dev server / tunnel / 另一个 dsh 实例）做**永久全 /proc stat
扫描**——每轮 `readdirSync('/proc')` + 同步 `readFileSync` 读全部 `/proc/<pid>/stat`
（本机实测 1097 个条目、1023 次读、**35.5ms**），按 15ms 排程 → 事件循环被淹没。
进程组只要有长驻成员就永不消失，循环永不退出，`this.live` 里对应 handle 也永久滞留。

**修复**（三段策略，见 2026-10-05 重推导版）：

```js
const FALLBACK_PENDING_POLL_MS = 100;    // 杀树进行中：100ms
const FALLBACK_SETTLED_POLL_MS = 5e3;    // 直接子进程已退：只可能剩孤儿 → 5s
const FALLBACK_WAIT_BUDGET_MS  = 6e4;    // 总预算 60s，到点放弃观察
```

CPU 从「单核 100% 永久」降到「1% 量级且 60s 内结束」。不改变正确性：普通命令
`waitForExit` 仍 0–1ms 返回；被 kill 的树 100ms 内察觉；SIGTERM→SIGKILL 的
grace-timer escalation 由独立定时器驱动，不受影响。取舍：预算到点后不再对残留
守护进程补发信号（正常完成的命令本来也不会调用 `terminate()`）。

**规避**：长驻后台进程（dev server / tunnel / 守护进程）用 supervisord 托管，别用
dsh bash 工具前台启动。

> 诊断全文：`docs/issues/261005-session-list-starved-by-orphan-liveness-poll/`。
> 上游状态：0.2.0-rc.2 / 0.2.1-alpha.1 的 `runner-launch-*.js` 与出问题的 0.1.7-rc.2
> 逐字节相同，尚未修。

### ~~0002-apiproxy-history-chunk-filter.patch~~（已被上游吸收，归档）

**症状**：dsh 会话首次加载慢——`session.history` 响应一个长会话能到 5.9MB。

**根因**：`session.history` 响应里 `assistant/chunk`（LLM 流式 token 增量）占 payload
>82%（一个长会话 5.9MB 里 27191 个 chunk 占 4.39MB）。而最终的 `assistant/message`
事件已含完整组装内容（`data.message.content`），客户端 `dsh-client-ui-conversation`
的 fold 分支用 `toAssistantBlocks(data.message.content)` 自足渲染——chunks 是纯冗余
的流式遥测，只服务直播动画。

**修复**：在 `dsh-host-apiproxy` 的 `historyPage` 里，先收集本页所有 `assistant/message`
的 `turn:step` 入 `completeSteps` 集合，再过滤掉 `assistant/chunk` 中
`turn:step ∈ completeSteps` 的（即“该轮已收尾”的 chunks），**保留不完整轮**（无
`assistant/message`，如被中断的流）的 chunks 以免丢部分内容。`hasMore` 不受影响。

**实测**：payload 5.38MB → 0.96MB（-82%），事件数 27439 → 248，客户端 fold -99%。

**结局**（2026-09-17）：dsh 0.1.2-rc.1 重构了 `dsh-host-apiproxy`（包已不存在），历史
分页迁至 `dsh-api-session-controller` 并引入 `chunkrow/*` 紧凑行打包（`pageRecords` →
`packChunkRuns`），等效实现了本补丁的 payload 缩减目标。补丁归档至
`patches/absorbed-upstream/`，不再参与 apply.sh。

> 诊断文档：`dsh-im-humanize/docs/issues/260909-dsh-web-slow-listing/`。

### ~~0003-session-log-seq-collision-guard.patch~~（已被 0.1.5 上游吸收，归档）

**症状**：GUI 打开会话报「历史加载失败：corrupt session log: seq gap in committed
region at line N (expected X, got Y)」或误导性的「corrupt Zstandard session log:
complete frame contains a torn JSONL record」。2026-09-15 ~ 09-17 连续 4 例（260915、
260917-b91c、260917-batch 三例）。

**根因**（详见各 issue 文档）：同一 session id 被两条互不知情的写入生命周期驱动——
打断/恢复路径按存储态追加 `session/end-seed` 世代标记或合成 closers，持陈旧内存游标
的存活写入方（同进程或跨进程）随后继续 append，seq 重复对撞落盘。持久化层 append-only
且无跨写入方 seq 冲突检测。

**修复**（`dsh-session-persistence-jsonl` 两处）：

1. **对撞守卫**（主防线）：`appendLines` 写盘前 `assertNoSeqOverlap` —— 读盘上最后
   一条 record（zstd 走 `scanZstdFrames` 帧边界扫描仅解码末帧；plain 读尾部 64KB），
   批首事件 seq（打包行取 `seq0`）若 ≤ 已存末事件 seq（打包行 + `texts/args.length`）
   则**拒绝写入**并抛错。陈旧写入方从此无法把分歧历史落盘。
2. **误报修复**（诊断体验）：`readZstdPrefix` 在 `committedBytes !== inputBytes` 时
   优先抛 `scanner.issue`（真实成因，如 "seq gap in committed region …"），
   仅在其为空时才报 torn record——「torn JSONL record」不再掩盖 seq 对撞。

**取舍**：守卫按批检查（非逐事件），帧扫描实测最大日志（2.4MB / 8000 帧）~30ms 一次性
开销，每批一次，可忽略。拒绝写入抛错而非静默丢弃——上游代码将 batch 保留在内存中，
持有最新游标的写入方仍能正常落盘；陈旧方拿到的报错会显式暴露对撞。

> 诊断文档：`docs/issues/260915-zstd-session-log-seq-collision/`、
> `docs/issues/260917-b91c-end-seed-seq-collision/`、`docs/issues/260917-batch-seq-collision/`；
> 数据修复流程 skill：`~/.claude/skills/repair-dsh-session-log/`。

### 0004-web-fixed-launch-token.patch

**症状**：`dsh web` 每次重启随机生成 URL `?token=`，书签/快捷方式在重启后失效
（401 authentication required）。

**根因**：`dsh-client-connection` 的 `processLaunchToken` 每进程用
`randomBytes(32)` 现铸 token，进程生命周期外无任何稳定凭据入口。

**修复**：`processLaunchToken` 先读环境变量 `DSH_TOKEN`——非空则固定使用该值
（URL、`?token=` 交换均生效）；未设置或为空时维持上游随机行为，零侵入。
校验侧 `tokenMatches` 本就是 timing-safe 任意字符串比较，无 base64 约束。

**用法**：supervisor 配置 `environment=...,DSH_TOKEN="<your-token>"` 后重启 dsh，
浏览器固定访问 `https://<host>/?token=<your-token>`（首次访问铸 cookie，之后无需
再带 token）。

**安全提示**：固定 token 意味着它不再是"重启即轮换"的进程级秘密——强度完全
取决于所选值。请只配合受信传输（`--trusted-host` / 隧道）使用。

### 0005-web-401-token-input-page.patch

**症状**：token 验证失败（401）时只返回一行纯文本「dsh web authentication
required; reopen the URL printed by dsh web」——URL 一旦丢失（换设备、记不住
token URL），除了上服务器看日志外没有任何办法进入。

**修复**：`dsh-client-connection` 的 `writeUnauthorized` 改为返回极简 HTML 页：
一个 token 输入框 + Sign in 按钮，提交后 JS 跳转 `/?token=<输入>`，走上游既有的
token→cookie 交换（`authorizeIndex` 303 铸 cookie），不新增任何端点或校验逻辑。
HEAD 请求仍返回无 body 的纯文本；错误 token 依然 401（重新显示表单）。

**实测**（throwaway 实例）：401 页渲染表单；`/?token=<正确值>` → 303 + Set-Cookie；
`/?token=<错误值>` → 401 + 表单；HEAD → 无 body。

### 0007-web-allow-all-interfaces-host.patch

**症状**：`dsh web --host 0.0.0.0` 被硬编码拦截报错：`error: --host 0.0.0.0 is intentionally not supported yet for safety: it would expose remote code execution to the network; use 127.0.0.1 instead`，导致局域网外部设备（如手机、同一局域网电脑）无法直接通过局域网 IP 访问。

**根因**：`@deepseek-ai/dsh-web-app` 的 `startup.js` 在命令行解析时无条件拦截了 `options.host === "0.0.0.0"`。实际上底层 `@deepseek-ai/dsh-host-webserver` 的配置 Schema 原生就支持 `host: '127.0.0.1' | '0.0.0.0'`，且 `resolveLanTrust` 亦内建了 `0.0.0.0` 时提取局域网网卡 IP 并追加至 `trustedHosts` 栅栏与打印 LAN URL 的逻辑。

**修复**：移除 `startup.js` 中对 `options.host === "0.0.0.0"` 的报错拦截。

**用法**：启动时加参数 `--host 0.0.0.0`（如 `dsh web --host 0.0.0.0 --port <PORT> --no-open`），局域网设备即可通过 `http://<LAN_IP>:<PORT>/?token=...` 直接访问。

## 用法

```bash
# 重打所有补丁（升级 dsh 后必跑）。输出全是 "⊘ already applied" = 已在位。
./apply.sh

# 不改文件，只检查：dry-run 全部补丁（rc=0 即全部已在位）
./apply.sh --check

# 验证某补丁是否已应用
cd "$(dirname "$(readlink -f "$(command -v dsh)")")/.." && \
  patch -p1 --dry-run < /path/to/dsh-patch/patches/0001-*.patch

# 回滚单个补丁
cd "$(dirname "$(readlink -f "$(command -v dsh)")")/.." && \
  patch -p1 -R < /path/to/dsh-patch/patches/0001-*.patch
```

## 兼容性

补丁针对当前部署的 dsh 版本（`dsh --version`）。dsh 升级若改动了被补丁文件的相关
上下文行，`apply.sh` 会报 context-mismatch——此时需对照新版代码重新推导补丁
（diff 旧备份与新文件），更新本仓库的 `.patch` 文件后再 `./apply.sh`。

打补丁前请先确认 dsh 版本与补丁推导时一致；不一致时先在测试环境验证。

`apply.sh` 的落盘方式不做备份，回滚单个补丁用上面的 `patch -R`（补丁都是幂等可逆的
文本编辑，无二进制/新文件）。
