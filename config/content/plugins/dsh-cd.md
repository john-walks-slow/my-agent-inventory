# dsh-cd

<p align="center">
  <a href="./README.md"><strong>简体中文</strong></a> ·
  <a href="./README.en.md"><strong>English</strong></a>
</p>

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）补一个 `cd`：既能**只换工作基准**（文件工具的相对路径与 bash 默认工作目录跟随），也能**真正把会话搬到另一个工作区**（沙箱根、AGENTS.md、skills 发现、会话存储位置、侧边栏分组全部跟随）。用户还能用 `/cd` 命令直接搬。

## 是什么 / 为什么需要

dsh 会话的工作目录（`session.header.cwd`）在创建时冻结，是会话身份的一部分——它决定会话存储位置、沙箱根、AGENTS.md 与 skills 的发现根，因此 dsh 出于设计不支持中途修改它。于是模型在需要操作工作区之外的目录时（比如"去 /tmp 帮我整理这些日志"），只能在每一次 read/write/bash 调用里写完整绝对路径，又长又容易错；而当工作重心**长期**移出原工作区时，AGENTS.md、skills、沙箱边界还留在旧地方，也不对。

dsh-cd 给模型和用户两种粒度：

| 粒度 | 入口 | 效果 |
|---|---|---|
| **工作基准覆盖**（轻，可逆） | `cd {"path": "..."}` | 只把「相对路径解析基准」挪过去：文件工具与 bash 默认 workdir 跟随；会话身份不变 |
| **真切工作区**（重，改身份） | `cd {"path": "...", "workspace": true, "confirmed": true}` 或用户 `/cd <dir>` | 会话真正属于新目录：存储位置迁移、header 重写、沙箱根 / AGENTS.md / skills 发现 / 侧边栏分组全部跟随。**需要用户明确同意**（见下） |

覆盖模式下各工具的行为变化：

| 工具 | 行为变化 |
|---|---|
| `bash` / `pwsh` | 不传 `workdir` 时，默认在覆盖目录执行；相对 `workdir` 也解析到那里 |
| `read` / `write` / `edit` / `read_image` | 相对 `file_path` 解析到覆盖目录 |
| `glob` / `grep` | 不传 `path` 时默认搜覆盖目录；相对 `path` 解析到那里 |
| `present` | `files[].path` 相对路径解析到覆盖目录 |
| 其他工具 | 不受影响，仍按原语义（需要绝对路径） |

**覆盖模式下明确不迁移的**：沙箱策略根、项目指令（AGENTS.md）、skills 发现、MCP 配置、会话存储位置——`cd 回会话工作区根` 即清除覆盖，恢复原状。要连这些一起搬就用真切工作区。

## 安装

```bash
dsh plugin --profile web add dsh-cd
```

安装后无需手动改配置，插件自带的 `cordis.patch.yml` 自动挂载生效：模型多出一个 `cd` 工具，输入框多出 `/cd` 命令。

从 GitHub 直装（源码安装，pnpm ≥10 需允许构建脚本）：

```bash
dsh plugin --profile web add github:john-walks-slow/dsh-cd
# 首次 add 会被 pnpm 拦截：把 pnpm 提示的包名加入
# ~/.dsh/profiles/web/pnpm-workspace.yaml 的 allowBuilds 后重跑
```

## 模型用法

```
cd {"path": "/tmp/some-dir"}                      # 只换基准：绝对路径 / 相对路径 / ~ 开头
cd {"path": "/path/to/other-project", "workspace": true}   # 请求真切搬迁：先问用户，同意后才补 confirmed
cd {"path": "/path/to/other-project", "workspace": true, "confirmed": true}   # 用户已同意 → 本回合末生效
cd {"path": "-"}                                  # 回到上一个目录
cd {}                                             # 查询当前目录与排队中的真切切换
```

细节行为：

- 目标必须是已存在的目录（符号链接会解析成真实路径），否则报错。
- 覆盖按**会话**隔离：一个会话 cd 走不影响其他会话。
- cd 回会话工作区根 = 清除覆盖，一切回到原状。
- 切换后系统提示里会注入一段说明（cache 安全的 runtime-context 快照，仅覆盖激活时存在）：**工具参数的**相对路径解析到覆盖目录，而**回答里的** markdown 链接/图片/文件提及仍以会话工作区根为基准（必须写工作区相对路径或绝对路径，否则链不上），以及不迁移的边界。
- **跨重启持久化**：覆盖状态写入 `$DSH_HOME/dsh-cd/state.json`（原子写，30 天未使用自动剪除）。实例重启后再打开该会话，覆盖自动恢复。
- **子代理继承**：会话派生的子代理在创建时快照父会话的覆盖目录（继承条目不落盘）。
- **真切切换必须取得用户明确同意**：`workspace: true` 改变的是会话身份（存储位置、沙箱根、AGENTS.md 与 skills 归属），所以它只在同一次调用**带上 `confirmed: true`** 时才排队搬迁。不带 `confirmed` 的调用只换工作基准，并在结果里明确回报"等待用户同意、请先问用户"。模型不得自行补 `confirmed`——它代表用户已经点头。
- **工作树场景不需要真切切换**：在 git worktree 里干活时，一般保持 `workspace` 为 `false`（工作基准切换就够）；真切切换是留给"工作重心永久搬到别处的项目"的。
- **真切切换需要空闲**：搬迁会重写会话日志并在磁盘上移动它，所以它只在会话空闲时执行。模型调用 `workspace: true` 时正在跑回合，于是本回合仍按工作基准工作（相对路径立即生效），**回合结束**时自动完成搬迁；排队状态与失败原因都会写进运行时上下文。

## 用户命令

```
/cd <directory>   # 把这个会话真正搬到该目录（要求会话不在回合中）
/cd               # 查看当前目录、所属工作区、覆盖状态与排队中的真切切换
```

命令由宿主直接执行、不经过模型，因此不会消耗一次模型回合；搬迁完成后它告诉你是否需要刷新页面（见下）。

## 真切切换做了什么

dsh 没有搬迁会话的官方接口，dsh-cd 自己完成三件事（源码见 `src/relocate.ts`）：

1. **磁盘**：把会话目录迁到新工作区的 `projectKey(cwd)` 目录，并重写日志**第一帧**的 header `cwd`。dsh 的会话日志是多帧 Zstandard 容器且第一帧恰好只放 header 一行，所以这里只解码/重编码第一帧，其余事件帧**逐字节复制**（不整文件重压，否则破坏读取器不变量）。旧世代日志（`session.jsonl[.zstd]`）一并处理。
2. **内存**：换掉 `session.header` 引用（对象本身是深冻结的）并重定向 JSONL 写入句柄，使后续追加落到新路径；同时刷新工作区注册表的 header 索引。沙箱根与文件工具的相对路径每次调用现读 header，因此即时生效。
3. **账本**：`detachSession` 旧工作区 → 复用/新建目标工作区 → `attachSession` 新工作区（注册表会重读磁盘 header 校验，所以必须排在磁盘改写之后）。

磁盘搬迁是「复制 → 校验 → 删旧目录」：任何一步失败即回滚（删副本、恢复内存 header、旧目录原样保留），失败原因如实返回，不做降级。

## 模型看到什么

覆盖激活时，每个 step 组装的 Runtime Context 快照里会多出一段（仅在文本变化时追加，内容不变则复用上一条）：

```
[dsh-cd] Working-directory override active for this session: /home/me/project/legacy. Relative paths in read/write/edit/glob/grep/read_image/present and the bash tool's default workdir resolve against it; other tools need absolute paths. Markdown links, images, and file mentions in your visible reply use a different base: they resolve against the session workspace root (/home/me/project), so write them workspace-relative (a file at /home/me/project/legacy/report.md is written "legacy/report.md") or absolute — reply paths written relative to the override will not open. The session workspace root still anchors sandbox policy, project instructions (AGENTS.md), skills, and session storage.
```

排了真切切换时，最后一句会被替换为搬迁说明（并追加失败原因，如果有）：

```
… A real workspace switch to /home/me/project/legacy is queued: as soon as this turn ends the session is relocated there for good — sandbox root, project instructions (AGENTS.md), skill discovery, session storage and the sidebar workspace all follow, and this override stops being needed.
```

覆盖目录在工作区根之外时，末尾不会出现那句换算示例（此时回答里只能写绝对路径）。

## 权限与兼容

- **无网络、无外部服务**：插件只在本地内存与状态文件里维护「会话 → 覆盖目录」表，并调用宿主的工作区注册表 / 会话持久化服务。
- **文件写入**：`$DSH_HOME/dsh-cd/state.json`（tmp+rename 原子写、30 天未使用自动剪除）；真切切换会**迁移会话自身的日志文件**（`$DSH_HOME/sessions/<projectKey>/<sessionId>/`）并更新 `$DSH_HOME/storages/workspace.json` 的归属账本——这两个都是 dsh 自己的数据文件。
- **真切切换带同意闸**：搬迁只在调用同时带 `confirmed: true` 时排队；插件不提供绕过方式，也不降级。之所以用"模型先问、用户同意后重调"的显式协议而不是审批弹窗：本机默认 Full access 预设下审批请求会被自动拒绝（`approval: never`），弹窗路线在默认配置里必然失败。用户自己执行 `/cd <dir>` 属于用户本人的操作，无需二次确认。
- **模型可以新建工作区**：为了满足"让模型自己搬工作区"的需求，模型调用 `workspace: true, confirmed: true` 时若目标目录还不是工作区，插件会为它新建一条工作区记录。这意味着在 `workspace-write` 沙箱模式下，用户一旦同意搬迁，模型即可把沙箱根指向任意已存在目录；`danger-full-access` 下无额外影响。若你不接受这一点，请勿授予模型 `cd` 工具或改用只读/受限预设。
- **提示词而非机制**：回答里的路径基准由 DSH Web GUI 决定（固定为会话工作区根），插件无法改写模型输出，只能靠注入文案约束。
- **搬迁后 GUI 分组**：会话本身搬迁后立刻可用（e2e 已验证同一页面可继续对话），但侧边栏的分组依赖客户端缓存的会话列表，通常需要刷新页面（F5）才显示到新工作区下；命令回执会提示。
- **宿主版本要求**：`@deepseek-ai/dsh-tools`、`@deepseek-ai/dsh-home-paths` 声明为 `^0.1.5-rc.3 || ^0.2.0-rc.1` 的 peerDependencies（由宿主提供，不重复安装）；真切切换另需宿主的 `sessionPersistence` 与 `workspaceRegistry` 服务（`dsh-base` 提供，缺失时 `cd`/`/cd` 会明确报错）；Node.js >= 22.5。

## 开发

本地以 `link:` 方式接进 profile 调试：

```bash
cd ~/.dsh/profiles/web
pnpm add dsh-cd@link:/path/to/dsh-cd
# 再把 "dsh-cd" 加进 package.json 的 dsh.profile.bundles 数组，然后重启 dsh
```

```bash
npm install       # 触发 prepare → 构建 dist/
pnpm check        # 类型检查
npm test          # 构建 + 行为测试（帧手术 / 账本 / 回滚 / 真实日志往返）
npm run e2e:cd          # 旧的基准覆盖 e2e
npm run e2e:workspace   # 真切切换 e2e
```

- 源码：`src/index.ts`（装配）、`src/relocate.ts`（搬迁引擎）、`src/command.ts`、`src/context.ts`、`src/state.ts`。
- 设计与调研记录见 `docs/features/260927-cd-tool/` 与 `docs/features/261012-workspace-switch/`。

## 发新版

```bash
npm run release                                                # test + npm version patch（自动 commit+tag）+ pack 到 /tmp
node ~/.agents/skills/npm-publish/scripts/publish-webauthn.cjs /tmp/dsh-cd-<新版>.tgz
git push --follow-tags
```

发布后用 `npm view dsh-cd version` 复验。

## License

MIT

## 社区

- 感谢 [LINUX DO](https://linux.do/) 社区提供的交流环境。
