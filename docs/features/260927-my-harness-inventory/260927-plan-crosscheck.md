# my-harness-inventory 计划交叉核查报告

> 日期: 2026-09-27 · 核查对象: `260927-my-harness-inventory.plan.md`（268 行，全文已读）
> 核查方式: 通读计划 + 三份 research；实测本机仓库现状（`src/`、`dist/`、`index.html`、`.github/workflows/`）；实测 DSH 会话数据实况（`~/.dsh/sessions/`，含 zstd 解压后的记录级 census）；查证 DSH 源码（`/usr/lib/node_modules/@deepseek-ai/dsh`）与外部一手文档（GitHub Docs、Node.js Docs/commit、Vite 8 blog）。
> 结论文档: 外部事实断言的逐条取证明细（一手链接、HTTP 状态、PNG IHDR 统计、字体字节数等）见同目录 `260927-plan-crosscheck-evidence.md`。
> 结论一句话: **方向、调研质量、结构设计都站得住；真正危险的不是"做得对不对"，而是三处"输入数据/口径"层的隐性错误（会让等级与 badge 建立在沙地上）、一处分发路径的结构性空白（模板仓 = 我们私货仓 + 完整 git 历史），以及一个没有任何执行机制支撑的验收承诺（"dev/build 时即抛错"）。**

## 0. 经实测/取证**成立**的预设（可放心推进，不必再回头论证）

为避免重复劳动，先把已经独立核实为**成立**的关键预设列出来（含一手证据）：

| 预设 | 核实结果 | 证据 |
|---|---|---|
| 7Soul 496 套件许可 = CC0 | **成立**。OGA 条目页 `License(s)` 字段为单选 **CC0**，无并列 CC-BY；作者在 DeviantArt 原发布页声明 "Public Domain / free for commercial use"。**精度提示**：该一手声明针对的是其免费 RPG 图标套件（420 / Extra 98），而不是"画廊全部作品"——research 报告 §2.1 里"将其全部作品置于公有领域"属过度概括，对外不宜复述；但对本项目结论无影响（授权链条完整） | `https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg`、7soul1 DeviantArt 原作页 |
| 套件是 34×34、496 张、可脚本裁边至 32×32 | **成立**。zip 内 **496 个 PNG，经 IHDR 实测 `Counter({(34,34): 496})`**，无混尺寸 | OGA `496_RPG_icons.zip`（HTTP 200，`content-length: 1541171`，与调研的 1.54MB 一致） |
| "LPC 的 CC-BY-SA 会传染、itch.io 受限包不得再分发" 红线 | **成立**（措辞也准确：限定在"受限"免费包）。注意不要过度外推成"禁一切 itch.io 资产"——Shade、Nikoichu 等正是托管在 itch.io 的 **CC0** 包，可用；Kyrise 为 CC-BY 4.0、Kenney/josehzz 为 CC0 | research 报告 §3.4/§3.5 已给依据；逐条见 evidence 文件 |
| Fusion Pixel 许可 = SIL OFL 1.1，可直接自托管 | **成立** | `github.com/TakWolf/fusion-pixel-font` release |
| `<img>` 引用的 SVG **不能**加载外部字体/`<link>` | **成立**。SVG-as-image 上下文禁止一切外部网络资源请求 | W3C SVG-as-image 约束；与计划 §9 的取舍一致 |
| `<img>` 引用的 SVG **可以**加载内嵌 data-URI `@font-face`，且 GitHub camo 只做转发 | **成立** → 让下方 S9 成为可执行方案 | 同上 |
| js-yaml 默认 schema 会把未加引号的 `2026-05-01` 解析成 `Date` | **成立**（本机 `js-yaml@4.3.0` 实测 + 官方 `DEFAULT_SCHEMA` 含 `type/timestamp.js`）；`yaml` 包同样输入给字符串 | 见 M4 |
| P0 清理项（`PixelIcon.tsx` 死代码、`App.css` 是 Vite 模板残留、`public/fonts` 与 `src/assets/fonts` 重复、`VT323.ttf` 全仓零引用） | **全部成立**，`App.css` 里仍是 `.counter/.hero/.base/.framework/.vite` 模板样式 | 实测 |

---

## Must Reconsider

### M1. 统计口径与基准数字：三处硬伤 + 一个来源不明的数

这是本计划里**唯一会让后续 P4 校准结果直接错掉**的问题，且计划把它当作"已实机验证、已成定论"。

**实测证据（本机，2026-09-27）：**

| 断言 | 实测结果 | 证据 |
|---|---|---|
| 会话文件是 `session.v3.jsonl.zstd` | 实测 `~/.dsh/sessions/*/*/*.jsonl.zstd` 共 **1682 个文件：1237 个 `session.jsonl.zstd`（version 0）+ 445 个 `session.v3.jsonl.zstd`**，**74% 是无版本号文件名** | 文件名单计数；DSH 源码注释明确："Version zero retains the original suffix-only name; every later generation carries a lowercase numeric `vN` component"（`dsh-session-persistence-jsonl/lib/index.js`，`generationLogFilename` 上方） |
| Token 从 `type:"usage"` 记录聚合 | **顶层 `{"type":"usage"` 记录数 = 0**（25 个文件 grep 计数全为 0，2 个文件逐行解析也为 0）。真正来源是 `type=="assistant/message"` 的 `data.usage = {inputTokens, outputTokens, cacheReadTokens, totalTokens}`。而 `type:"usage"` 这个字符串出现在**另一处**：`{"type":"assistant/chunk","data":{"chunk":{"type":"usage","usage":{...}}}}`，且该 chunk 结构**只有 `inputTokens/outputTokens`，没有 cacheRead/totalTokens** | 见 `/tmp/all-usage-lines.txt` 首行（chunk 形态）与我实测的 message 形态样本。**计划把两个不同层级的 schema 混写成了一句话**（research 报告 §2.5 的表述是对的：`assistant/message → data.usage`，是计划压错） |
| 直接对文件 grep `"totalTokens"` 求和 | **不可靠**：`totalTokens` 子串还出现在 `tool/result`、`tool/call`、`compaction/summary` 记录里（工具回显、被读取的源码/JSON 都会带入）。旁证：`/tmp/all-usage-values.txt` 有 **305,530** 行 `"totalTokens":N`，而 `/tmp/dsh-token-components.txt` 只统计了 **238,850** 条记录，二者差 **28%** | 逐文件按顶层 type 的 census（`assistant/message` + `tool/result` + `tool/call` + `compaction/summary` 均命中） |
| 会话数 = 目录数（1676） | **口径严重虚高**：本仓库项目目录下实测 **root 会话 8 个 / subagent 会话 50 个（86% 是子代理）**。research §1.2 第 4 条已明确警告"子代理重复统计需决定计入还是去重"，但计划没有做这个决定，还直接把 1676 写进了基线 | Header 行 `"origin":"subagent"` 计数；`~/agents/...` 同理 |
| Token 基线数字 | 计划 schema 示例写 `tokens: 380000000`；计划正文引用的 `/tmp/dsh-token-components.txt`（今天 14:05 生成）写的是 **totalTokens=15,444,442,154 / input=1,580,907,460 / output=31,518,591 / cacheRead=13,832,022,057，且 `dropped_outliers=0`**。**380M 无处可溯**，"剔除 >10B 离群坏点"与 `dropped_outliers=0` 也对不上 | 文件原文 |

**影响**：`§6` 明确说"系数在 P4 以我们真机数据**数值校准，目标 DSH ≈ Lv.16**"。也就是说等级曲线、`itemScore` 权重、badge 上的 Lv 与 EXP 条**全部由这组数字决定**。现在的状态是：来源口径含混（chunk vs message）、文件枚举漏 74%、会话数含 86% 噪声、展示值与实测值差 40 倍。任何一个环节错，Lv.16 这个"彩蛋"就变成随机数——而它同时是我们对外演示的门面数字。

**建议行动**：
1. 把采集口径写进计划/schema 的**规范文本**（不是散落在正文）：`source = type=="assistant/message" 的 data.usage`；`files = 匹配 session*.jsonl(.zstd) 全部代际`；`必须结构化 JSON 解析，禁止对原始文本正则求和`；`(turn,step)` 或 `seq` 去重；`子代理是否计入` 显式开关。
2. **明确"展示哪个 token 数"**：cacheRead 占 "total" 的 **89.6%**。若展示 15.4B 会是个既不可比又不好看的数字；建议展示 `outputTokens`（31.5M）或 `非缓存 input + output`（1.61B），并在 UI/README 标注口径。跨 harness 比较必须统一到同一口径（research §1.2 第 2 条已给公式）。
3. **会话数改成 root 口径**（或拆成"对话数 / 子代理调用数"两个 stat）。"会话数 1676"里的 86% 是 agent 自己开的子会话，既不有趣也不可比。
4. 380M 要么改成实测值，要么删掉示例数字（示例数字会被 fork 者当默认值抄）。
5. **数字要可复现**：口径一旦定稿，`collect-stats.mjs` 与一次性统计脚本应当同源，且我们自己的 config 由该脚本产出（而不是手工粘一个数）。

---

### M2. 分发方式：现在被公开的"模板仓"= 我们的私货仓 + 完整 git 历史

计划 §2 说"拆仓预案本次不执行，只保证结构就绪"，但 §1.2 的 fork 者路径、§10 的 skill、§9 的 badge、P8/P9 都指向"这个仓就是别人要用的模板"。二者的时序是矛盾的：**在这一轮结束时，世界上还不存在一个干净的白板仓**，别人只能 fork/clone 我们这棵装了全部私货的树。

后果（按严重度）：

1. **fork 会带走全部 git 历史。** GitHub 官方文档：*"A new fork includes the entire commit history of the parent repository, while a repository created from a template starts with a single commit."* 也就是说用 fork 路径的人，仓库里永远留着我们的 commit 历史（含 260916/260927 的研究与计划文档、我们的真实数据迭代过程）。而 skill 里写的是"fork 本仓或使用模板"——把两条后果完全不同的路径并列了。
2. **我们的内容就是他的初始内容**：`config/` 装的是 8 插件 / 35 技能 / 6 MCP / 4 篇长文 + 我们的昵称、token 数、私有仓链接；`docs/`、`references/`、`AGENTS.md` 也在。`init:harness` 只能"重置 config"，重置不了 `docs/`、`references/`、git 历史、以及他们仓库里那份"我的 DSH 背包"的 README。
3. **脱敏面被低估**：计划只安排了 `pnpm privacy:scan`（扫 `config/`）。实测**已公开的树里就有真实自持域名与内网 IP**：`src/data/inventoryData.ts` 的 `*.<真实自持域名>`、`docs/features/260916-.../..validation.md` 的 `192.168.x.x`。按全局规范，这类真实公网隧道域名/内网细节**不应出现在对外仓库与文档中**；而 P2 恰好要把这些内容迁移到 `config/content/**`。

**建议行动（择一，但必须在本轮内落定）**：
- **A（最小代价）**：把本仓标记为 GitHub **template repository**，并在 skill/README 里**只写 "Use this template"（历史被压成单 commit）**，显式劝阻 fork；`docs/`/`references/` 里的过程文档在模板分支或 `.gitignore`/`.templateignore` 层面处理。（注意：模板仓本身仍然是我们的私货仓，只是历史不外带。）
- **B（结构最干净）**：本轮就把仓库一分为二（引擎+示例白板 / 引擎+我们的数据），代价是增加一次拆仓操作。
- **C（补充，与 A/B 均可叠加）**：脚手架走 `npx degit <user>/my-harness-inventory my-inventory`（无历史、无 `.git`），这是同类项目的 canonical 做法；skill 里给出这一条。同时 `privacy:scan` 的扫描范围扩到**全仓**（至少 `config/`、`README.md`、`docs/`、`skills/`），并把上面两处已知字符串在 P2 顺手清掉。

---

### M3. 等级公式：5 个自由参数拟合 1 个目标点 = 欠定；sessions 用线性还与自己的论证矛盾

计划 §6：

```
exp = sessions×A + log10(1+tokens)×B + log10(1+days)×C + itemScore(...)
level(n) = clamp(1 + floor((exp/K)^p), 1, 99)
```

- 论证是"真实 token 量级横跨 6 个数量级，线性公式必然失衡"——**同一条理由对 sessions 同样成立**（新用户 0～10 个会话，重度用户 10⁴～10⁵ 个会话，同样跨 4～5 个数量级；本机单仓库就 1670 个目录）。sessions 用线性、tokens 用对数，是内部不一致的：结果是**会话数在高段统治等级**，而会话数恰恰是最容易被无意（反复开关会话）或有意（刷）膨胀的量——对一个"等级"展示来说，这是最不该被选为主因子的量。
- **A/B/C/K/p 五个自由参数、唯一约束是"DHS ≈ Lv.16"**：这个方程组有无数解，任何一组都能满足，拟合成功不代表曲线在别的用户身上合理。"公式与校准基准写入 README，fork 者可预期自己的等级"这个承诺**没有依据**——我们只验了一个点。
- 而且 Lv.16 这个锚点本身来自彩蛋文案（现站实际显示 `Lv.10`），**用它来反解公式是把展示效果当成了物理常量**。

**建议行动**：
1. 用**锚点集**代替单点拟合：`Lv.1 = 全新用户（0 会话/0 token）`、`Lv.5 ≈ 周末用户`、`Lv.16 = 我们（真机）`、`Lv.40 ≈ 重度 Claude Code 用户`、`Lv.99 = 渐近上限`——中段锚点可直接取 research §2 里 12 家 harness 的真实量级（这也是那 48KB 调研最有价值的变现方式）。
2. `itemScore` 作为主要可控项、`sessions` 也取对数（或干脆只做 `log10(1+sessions)` 的小权重项）。
3. **我们的 Lv.16 直接用 `harness.level: 16` 显式覆盖**（schema 已支持），把参数校准与彩蛋解耦：彩蛋不需要公式正确，公式也不需要迁就彩蛋。
4. 补一条单测断言锚点区间（`level(0)=1`、`level(我们)≈16`、单调不减、`clamp≤99`）。

---

### M4. "dev/build 时即抛错"没有任何执行机制；配置装载的技术选型也选错了一个关键项

计划 §3 结尾："校验：zod schema，dev/build 时即抛错并精确指出 `sections.plugins.items[3].icon` 级路径 —— agent 填错立刻可见，**这是 agent DX 的关键**。"

但 §2/§1.3 描述的装载方式是**运行时** `import.meta.glob('/config/**', {query:'?raw'})` + js-yaml 解析 + zod 校验。**Vite 构建不执行应用代码**，所以 `pnpm build` 不会因为坏配置失败；`pnpm dev` 只会在浏览器里白屏/控制台报错。整个"agent DX 的关键"落空了，而计划把它当成已解决的问题。

**附带一个实测到的选型缺陷**：计划指定 `js-yaml`。实测 `js-yaml@4.3.0`：

```
since: 2026-05-01   →  Date 对象 2026-05-01T00:00:00.000Z   ← 不是字符串！
added: 2026-08-12   →  Date 对象
version: 1.0        →  number 1                             ← 不是 "1.0"
```

而 `yaml`（eemeli，DSH 自己在用）解析同一份输入得到 `since => string "2026-05-01"`。也就是说：**用 js-yaml + `z.string()` 校验 `since`，agent 照抄计划里的示例就会得到一条"Expected string, received object"的报错**——恰恰发生在我们承诺"agent 填错立刻可见、路径精确"的地方。`version: 1.5.0` 是字符串、`version: 1.0` 变数字，也是同类地雷。

**建议行动**：
1. **换用 `yaml` 包**（YAML 1.2 core schema，日期保持字符串），或在 js-yaml 里显式选 schema；同时在 schema 层对 `version`/`since`/`added` 用 `z.coerce.string()` + 正则。**注意 zod 不是体积问题**：`zod/mini` gzip 实测仅 ~1.9–2.1KB，保留 zod 做校验完全符合"零重依赖"。若想彻底零运行时开销，可用 `@rollup/plugin-yaml` 在构建期把 YAML 编译成静态 JSON（代价：需确认它在 Vite 8 / rolldown 下的兼容性，且必须保留 `watchChange` 触发重编译；相比之下"换 yaml 包"是更低风险的一步）。
2. **加一个真正的构建期闸门**：在 `vite.config.ts` 里加一个 ~30 行的小插件（`buildStart` + `handleHotUpdate`/`watchChange` 时对 `config/**` 跑 `loadConfig()`），坏配置 → 终端报错 + dev overlay，`pnpm build` 非零退出。这也顺带解决 **`<title>`/OG 注入**：`index.html` 现在硬编码"星露谷 DSH 装备背包…"，而计划说 `site.title` 驱动"`<title>` + OG"——运行时改 `document.title` 拿不到 OG 预览，`transformIndexHtml` 才是正解（当前 `index.html` 里 **0 个 OG 标签**）。
3. 提供一个 `pnpm validate`（给 agent 用的单命令自检）——skill 流程里应该出现它，而不是只靠 `pnpm dev` 看白屏。

---

### M5. "stardew 回归截图必须一致"是一个无法验证的验收标准

计划把"stardew 主题观感必须与现状一致"列为**第一条关键约束**，P5 的验证写"stardew 回归对比截图（**必须一致**）"。但：

- 计划**没有安排在任何改动之前采集基准截图**。P5 在 P0～P4 之后执行，届时 `PixelIcon.tsx`/`App.css`/资产已被清理、45 个图标已抽出→必然无法回溯"改前"的样子（除非现在就先截）。
- 代码现状比想象的重：`src/` 里有 **755 处硬编码 hex 颜色**、**2925 处中文字面量**（`App.tsx` 474、`DetailPanel` 283、`InventoryGrid` 268、`BooksView` 237）。把它们全部 token 化，同时要求"色值/边框/字体/布局全部保留"，是"必须一致"里最容易破功的一条。
- "一致"的判定标准也没定义（哪些页面/视口？允许多少像素差？字体加载竞态怎么算？）。

**建议行动**：
1. 把 **`P0` 之前加一步 P-1：基准截图归档**（4 个主题面 × 桌面/移动 ≥2 视口，含 hover/弹窗/详情/阅读器状态），存 `docs/features/260927-*/baseline/`。这是一次性 10 分钟的动作，却是后续所有主题工作的唯一客观标尺。
2. 把验收语改成可判定式：`每张基准图 visual diff ≤ 阈值（如 0.1% 像素）`，并明确 diff 工具（既然已有 `puppeteer-core`，`pixelmatch` 之类纯 JS 比对即可，或人工走查 + 固定清单）。
3. 把 P5 拆成 **P5a（token 化 + stardew 逐图对齐）** 与 **P5b（pokemon/jrpg/diablo 三主题）**：前者是回归风险集中区且阻塞其它所有阶段，后者是纯增量。这样"stardew 必须一致"这条硬约束不会被三个新主题的迭代噪音掩盖。

---

### M6. 4 篇长文的去留含糊，而 P2 是一次**破坏性重写**

§4 表格写：「BOOKS_DATA 个人经验长文（4 篇）→ **不再展示**。tomes = 全局规则/AGENTS.md/CLAUDE.md 的脱敏精编版（我们放 3~4 卷：宿主环境志/编码心法/安全铁律）」。

有四种互斥解读：①4 篇排坑长文被丢弃、换成 3~4 篇规则文档；②4 篇被压缩改写成 3~4 卷规则；③4 篇 + 3~4 卷规则并存（tomes 有两类）；④只是换 tab 名。而 P2 的动作写的是"books→tomes 脱敏重写"——**这是不可逆的内容决策，却用一行模糊的表格承载**。

风险是实打实的：这 4 篇（孤儿进程 80% CPU 排查、Devfs 避坑、上下文自主蒸馏、Cloudflare 命名隧道）是原站**最有价值、最有趣、也最"我们"**的内容（README 专门拿它当卖点，260916 summary 把它列为"万字级实战避坑秘籍"交付物）。把它们换成"全局规则摘编"，等于用一个通用模板的姿态把本站最亮的资产换掉；而 t"宿主环境志"本身又和 M2 的脱敏方向互相拉扯（既然要脱敏，为什么还专门写一卷宿主环境志？）。

**建议行动**：在 P2 动手前把映射表写死成"原 4 篇 → 新 tomes 条目"的逐条对照（保留/改写/删除 + 原因）。推荐：**保留全部 4 篇作为 tomes**（tomes 的 schema 只是"长文 + tags"，容纳 `pitfalls` 类毫无问题），把 AGENTS.md 类规则作为**新增**的 3~4 卷；tab 词汇从"秘籍"改叫"典籍/长文馆"即可。这样既不丢内容，也不违背"tomes = 规则与全局指令"的新定位（把定义放宽为"长文馆"）。

---

### M7. 第三方资产的许可与署名在计划里是"只做一半"，且现状已经欠账

计划对图标很讲究（CC0 复核、红线、三处致谢），但对**字体**只谈选型与红线，没谈合规交付物：

- 现状实测：仓库里**没有任何 LICENSE/NOTICE/第三方资产清单文件**，但已经随仓分发 3 个字体（`DotGothic16.ttf` 1.9MB、`Silkscreen.ttf`、`VT323.ttf`，且在 `src/assets/fonts/` 与 `public/fonts/` 各存一份）；P5 还要再加 3~4 个字体家族（Fusion Pixel / PKMN / Cinzel / Pirata One）。
- 这些字体均为 **SIL OFL 1.1**（OFL 要求随字体分发许可文本，并遵守保留字体名；网络嵌入 `@font-face` 是被明确允许的）。CC0 图标无义务（计划已安排致谢），**OFL 字体有义务**——只写在 README 的致谢段落里与"随字体分发 OFL 文本"不是一回事。
- 另外 `7Soul 496` 的 "CC0" 与 "作者亲自置于公有领域" 的说法，计划是当作定论引用的；OGA 条目页可能同时列出 CC0 与其他许可（这一点已派子代理取证，若结论是"CC0 成立"则风险仅在于表述；若含 CC-BY 则致谢就从"建议"变成"必须"）。

**另有两条与字体相关的**事实性修正**（都已取证，建议在计划里改掉，否则 §8.2/§12 的假设是错的）：

- **Fusion Pixel 12px 比例版 woff2 实际约 651 KiB（666,264 字节）/ TTF 变体约 906 KiB（928,148 字节），不是"~450KB"**（低估约 45%）。影响：§12"CJK 字体体积 → pyftsubset 子集化"不是"可选优化"，而是**必做项**；同时也削弱了"单文件直传即可"的轻松假设。
- **Johto Font（npm `pokemon-font`）不能按 OFL 使用**：该字体已转向闭源商业授权（Superpencil）。§8.2 表里写的 `PKMN(MIT)/Johto(OFL)` 应改为**只用 `nue-of-k/pkmn`（MIT，仓库 `github.com/nue-of-k/pkmn`）**。这正是计划自己立的红线（"禁 Zpix/IPIX/VonwaonBitmap"）的同类风险，属于必须修掉的目录错误。

**建议行动**：
1. P0/P3 里增加 `THIRD-PARTY-LICENSES.md`（或 `LICENSES/` 目录）：逐项列资产名 / 作者 / 来源 URL / 许可证 / 许可文本或链接。**注意 7Soul 的 zip 内不含任何 README/license 文件**（已实测），许可文本需从 OGA 条目页取得。这是发布前 `before-publish-repo` 类检查的必查项，成本极低。
2. 顺带清掉 P0 已识别的重复：实测 `dist/` 4.3MB 中，`DotGothic16` 在 `dist/fonts/`（public 拷贝）与 `dist/assets/`（`@font-face` 引用）**各存一份**；`VT323` **全仓无任何引用**（死资产）。

---

## Suggestions

1. **字体子集化应该覆盖现有中文字体，而不只是 Fusion Pixel。** 实测 `dist` = 4.3MB，其中 `DotGothic16.ttf` 1.9MB（且重复两份），JS 只有 401KB。stardew 主题保留现状是"观感不变"，但**体积没有理由保留**：同样的 `pyftsubset` 流程（research §4.2 已有脚本）按"仓库实际出现的字符"子集化，可以把页面从 ~4.3MB 压到 <1MB，且对 fork 者天然自适应（按他们自己的 content 生成），比固定 3500 字表更聪明。计划只对新字体做子集化，是把现有最大的性能包袱放过了。

2. **496 图标套件的入库范围可以再收一档。** 实测：我们站点 61 个物品**全部**使用自有手绘图腾（47 个不同名字），也就是说 7Soul 套件在本站**零消费**，它的价值 100% 面向未来的 fork 者。而入库 496 个 PNG = 每个 fork 永久继承 1.5MB 素材 + 一张 496 项的 id 图鉴页 + 一个切图脚本。更省的方案：**内置一套精选（约 40~80 个，覆盖 plugin/skill/mcp/tool/tome/potion/scroll/weapon/armor 等通用语义）+ 保留 research 里已验证的 `fetch-icons.sh` 供按需拉全量**。既不牺牲模板开箱效果，又把 P3 的工作量和仓库噪音砍掉一大截。（URL 与几何已实测：`https://opengameart.org/sites/default/files/496_RPG_icons.zip` → HTTP 200，`content-length: 1541171`；zip 内为 **496 个独立 34×34 PNG，无精灵图 sheet、无 README/license**——注意 research 报告里"内含 496 个独立 PNG 文件及完整精灵图"这句是错的，计划 §7 的"裁边 34→32"才是准确描述。）

3. **图标美术一致性值得在 P3 前做一次目测。** 现状的"16×16 手绘像素图腾"实际上是**含 `<path>` 贝塞尔曲线、圆角 `rx`、`strokeWidth` 描边的混合矢量图**（不是逐像素矩阵；`image-rendering: pixelated` 对它其实是 no-op）。把这类图与 7Soul 的**真·32px 像素画**放进同一排格子，风格落差会比预期明显（尤其 stardew 暖木调 vs 7Soul 的 RO/D2 高饱和）。建议 P3 先摆一屏"混合样例"再决定是否统一描边/降色板。

4. **测试与 CI 是计划里的隐形假设。** 计划多处依赖"单测"（P1 合法/非法配置用例、P4 level 单测、P3 解析链单测），但 `package.json` **没有任何测试框架、没有 test 脚本**；CI 只跑 `pnpm build`。零依赖路线下 `node:test` + `tsx` 就够（纯函数测试），无需 vitest。另外 CI 里 `node-version: 20`：Vite 8 要求 20.19+/22.12+（20.x 最新满足），但 Node 20 已于 2026-04 EOL，且 `node:sqlite` 仅在 **22.5+ 存在、22.13/23.4 起才免 flag**（本机 Node 22.23.2 实测免 flag 可用，只有 ExperimentalWarning）。建议 CI 提到 22/24，并把 `pnpm validate` + `pnpm test` 纳入 workflow。

5. **fork 路径的手动步骤可以再少一步。** 计划 §1.2 第 7 步要求人类"Settings→Pages→GitHub Actions"。现有 workflow 缺 `actions/configure-pages`；加上 `- uses: actions/configure-pages@v5` + `with: {enablement: true}` 即可**首次运行自动开通 Pages**，无需人工点设置（官方 action 支持该参数，社区实例亦印证）。对"agent 一条龙"的承诺，这一步的自动化收益很直接。

6. **`init:harness` 的职责清单要写全。** 计划称 `config/` 是"fork 者唯一需要动的目录"，实测至少还有：`package.json`（现在仍是 vite 模板遗留的 `"name": "test-app"`、`version 0.0.0`）、`index.html`（`<title>`/favicon）、`README.md` 首屏。这些应当由 `init:harness` 一并处理或明确列入 skill 的收尾清单。

7. **`install` 的展示规则建议配置化而非硬编码 section 白名单。** 现在 61 个条目里有 **51 个**带 `installCommand`（含大量 `cp -r ~/.agents/skills/...` 形式的技能安装指引）。按 §4 的新规则"仅 plugins / mcp / 有 repo 的 skill 展示 install"，本站会静默丢掉约 20+ 条有用信息。既然整站都走"数据驱动"，更一致的规则是：`该条目有 install 就展示` + `section 级 showInstall 开关`（默认按有值判断）——fork 者也能自己决定。

8. **采集脚本的输出默认取整。** skill 的第 3 步是"与人类对齐（哪些数字展示/取整）"，但更安全的是**默认就输出取整值**（如 `tokens: 1.6e9` 或 `≈1.6B`），精确值需显式 `--exact`。因为真实风险路径是：agent 把精确数字粘进 config → 人类没细看 → 提交 → 数字进入公开仓库与 badge。

9. **badge 的像素感可以更强（已确认可行，建议纳入 P7）。** 计划接受"`<img>` 引用 SVG 无法用外部字体 → 用系统字体栈"——前半句已核实成立（SVG-as-image 禁止一切外部资源请求）。但**内嵌 data-URI `@font-face` 是允许的**（base64 内联不触发外部请求，GitHub camo 只做代理转发、不拦截 SVG 内部的 data-URI）。因此可以给 badge 内嵌一个 ASCII-only、约 2-4KB 的像素字体子集，让昵称/Lv 数字立刻"像那个游戏"。代价：4 个主题 badge 各多 2-4KB base64，且需在真实 GitHub README 环境里跑一次 camo 验证（camo 有缓存，改动后建议换文件名/加 query 刷新）。

---

## Open questions

1. **"任何人 fork" 的漏斗第一环是什么？** skill 位于**仓库内部**，因此必须先克隆才能读到它——它无法像普通 skill 那样"先安装、再由 agent 引导建站"。真正的入口只有 README 的一段话。是否应该：(a) 把 skill 同时发布到 skill 市场/独立安装；(b) 在 README 放一段"复制这段 prompt 给你的 agent"的 Quick Start；(c) 提供 `npx degit`/`create-*` 一行命令？这决定了这套东西是"我们自娱自乐"还是真会被别人用。

2. **单 harness schema 是否够？** `harness:` 是**单个对象**，而 `collect-stats.mjs` 的设计是"自动探测**全部**已知 harness 并输出 YAML 片段"。多 harness 用户（同时有 Claude Code + Codex + DSH 的人不少）会遇到"探测到 3 个但我只能填 1 个"的落差，skill 里也没有话术。要么把 `harness` 改成数组 + HUD 切换，要么在 schema/skill 里明确"选一个主力 harness"并说明取舍。

3. **这个项目的成功标准是什么？** "简单有趣"与 11 个阶段、4 套主题、4 套词汇表、496 图标、badge 生成器、跨 6 家 harness 的采集指南之间有明显张力。值得先写下"这一轮做完，什么算成功"（例：我们自己的站完成迁移且观感不变 + 一个陌生 agent 能在 30 分钟内替它的主人建出一个站），再据此决定 P3/P5/P7 的范围优先级。

4. **YAML 作为"agent 主编辑格式"的长期代价。** 本次核查就撞到一个具体地雷（日期被解析成 Date）。YAML 还有块标量缩进、锚点、`key: value` 与多行 `content` 混排等 agent 易错点。是否值得：(a) 为 `harness.yaml` 提供**JSON Schema**（agent 可直接校验、IDE 可补全，zod 从 schema 派生或反之）；(b) 让 `pnpm validate` 输出"可执行的修复建议"（"把 since 加引号"）；(c) 或者给长文正文单独放 `.md`（计划已经这么做了，很好）——把 YAML 只留给结构化字段。

5. **`sections` 里 `tools` 的定位。** §3 的 `tools` section 只给了"harness 内建工具"一行字段（`{id,name,title,icon,category,description,content?}`），与 plugins/skills/mcp 的字段集不一致（无 rarity/version/install/tags）。若它要参与 `itemScore` 与筛选，字段需要对齐；若不需要，就该明确它是"轻量 section"并让 loader 支持两种条目形态——否则 schema 会先长出特例。
