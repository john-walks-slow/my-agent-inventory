# my-harness-inventory 总体改造计划（终稿）

> 日期: 2026-09-27 · 状态: **已批准可实施**（auto_human 通过 + expert 交叉核查 7 项 Must 全部吸收，见 `260927-plan-crosscheck.md`）
> 愿景: 把「我的 DSH 背包」升级为任何人都能填充自己 harness 装备的趣味模板项目 **my-harness-inventory**。当前仓库 = 引擎 + 我们自己填充的 DSH 数据（试验场），为拆仓（白板模板仓）做好结构准备。
> 项目基调: **简单、有趣**。零重依赖、纯像素美学、agent 友好（配套 skill 一条龙）。

---

## 0. 关键约束与验收底线

1. **星露谷主题视觉不变**：任何改动前先采集**基准截图归档**（P-1），P5a 完成后逐图 visual diff 对齐（≤ 阈值）。这是硬门槛。
2. 所有内容数据迁出 TS 源码，进入 `config/`（YAML + Markdown + 自定义图标文件）。
3. 引擎（`src/`）不得硬编码任何"我们自己的内容"；只允许读取 config 与内置公共资产（图标套件、品牌头像、主题）。
4. 调研与核查记录（同目录）：三份 `*.research.md`（图标/字体/统计）+ `260927-plan-crosscheck.md`（+evidence）。本计划已整合其全部 Must/Suggestion 结论。
5. 遵守仓库 AGENTS.md 规范：无外部矢量图标库做物品图腾、视口约束、提交规范、文档规范。

## 1. 用户路径 (User Paths)

### 1.1 访客（看别人的背包）
打开站点 → 顶部 HUD 看到 harness 头像/昵称/等级 → 切 Tab 浏览装备格 → 悬停预览 / 点击看详情卡（摘要、亮点、正文、安装块）→ 翻「典籍」读规则 → 点「档案」看 harness 数据卡（版本/会话/Token/等级/经验条）→ 换主题玩 → 点金币彩蛋。

### 1.2 Fork 者的 Agent（核心新增路径）
人类说"帮我做一个我的 harness 背包" → Agent 读取仓库内 `skills/harness-inventory/SKILL.md`：
1. **识别 harness**（检测本地痕迹：`~/.claude` `~/.codex` `~/.gemini` `~/.dsh` …；多 harness 时呈报让人类选一个）
2. **采集原始数据**（`node skills/harness-inventory/scripts/collect-stats.mjs`，零依赖，自动探测，输出 YAML 片段，默认取整）
3. **与人类对齐**（必经闸门）：拟展示数据、装备清单、隐私脱敏建议呈报人类确认
4. **获取代码**（**Use this template**（单 commit 无历史）或 `npx degit`（无历史）；skill 明确劝阻直接 fork——fork 会带走完整历史与我们的私货）
5. **初始化**（`pnpm init:harness` 重置白板：config + package.json name + index.html title + README 标题）
6. **填充配置**（`config/harness.yaml` + `config/content/**/*.md`；`pnpm validate` 随时校验；图标从 `references/icons.md` 常用 id 表选，AIGC 图标放 `config/icons/` 为可选项）
7. **本地预览**（`pnpm dev`，请人类过目）
8. **隐私自检**（`pnpm privacy:scan` **全仓扫描**，硬模式（密钥/密码）失败即阻断，软模式（域名/IP/用户名）警告）
9. **发布 GitHub Pages**（推送 → Settings→Pages→GitHub Actions）
10. **领取 badge**（`<url>/badges/<theme>.svg`，嵌入片段见站内 badge 页）

### 1.3 维护者（我们自己）
新增装备 = config 加条目 + 放 md。新增主题 = `src/themes/` 加 token 文件。零代码改动。

## 2. 目标仓库结构（拆仓就绪）

```
config/                        # ← fork 者唯一需要动的目录
  harness.yaml                 # 主配置
  harness.example.yaml         # 白板模板（带完整注释）
  content/{plugins,skills,mcp,tools,tomes}/<id>.md
  icons/                       # 自定义图标（.svg 内联 / .png|.gif 位图；AIGC 走这里，可选项）
src/                           # 引擎
  config/                      # zod schema + loader（yaml 包，非 js-yaml）
  themes/                      # 主题 token + 词汇表 + 字体
  iconkit/                     # 7Soul 496 资产 + registry + 归属
  brands/                      # harness 品牌像素头像
  badge/                       # badge SVG 生成器（Node/浏览器共用）
  stats/                       # 等级/经验（锚点校准）
  audio/ components/ …
docs/essays/                   # 原 4 篇实战长文归档（不在站内展示，README 可链接）
scripts/
  gen-badges.ts  init-harness.mjs  privacy-scan.mjs
skills/harness-inventory/      # 配套 agent skill（SKILL.md + references/ + scripts/collect-stats.mjs）
```

**分发决策（M2）**：本轮结束时本仓仍是"我们的填充站"。skill 与 README 只引导 **Use this template / degit**（皆不带 git 历史）；直接 fork 被明确劝阻。仓库打 template 旗标与真正拆仓为后续用户操作（收尾时提示）。已公开历史中的旧内容不重写（无授权不动 git 历史）；新 config 内容按隐私规范撰写。

## 3. YAML 配置 Schema（v1）

`config/harness.yaml`（README 与 `references/schema.md` 逐项文档化；`pnpm validate` 可独立校验）：

```yaml
site:
  title: 我的 DSH 背包               # header h1 + <title> + OG（vite transformIndexHtml 注入）
  subtitle: 展示我的 harness 装备
  theme: stardew                     # stardew|pokemon|jrpg|diablo

harness:
  name: DeepSeek Harness
  nickname: 大肥鱼                    # 可选；badge/档案优先展示
  brand: dsh                         # 内置品牌头像 key；customAvatar 可覆盖
  version: 1.5.0                     # 可选（注意引号："1.5.0"，YAML 核心模式 1.5 是数字）
  since: "2026-05-01"                # 注意引号：yaml 包下未加引号也安全，但文档统一教加引号
  stats:                             # 全部可选；口径：root 主会话数 + 非缓存 input+output Token
    sessions: 586
    tokens: 1611000000
  level: 16                          # 可选；缺省由锚点公式计算

sections:                            # 启用 tab 及顺序（plugins 可省略）
  plugins:
    label: 插件                      # 可选；缺省用主题词汇
    icon: sword                      # kit 图标 id
    categories: [{id: core, label: 核心}, ...]
    items:
      - id: dsh-wait-subagent        # 正文 = content/plugins/<id>.md
        name: dsh-wait-subagent
        title: 子代理收敛同步器
        icon: hourglass              # 解析链: config/icons/<icon>.svg|png → kit id → 兜底
        rarity: iridium              # normal|silver|gold|iridium
        category: tools
        version: "1.0.0"
        author: John Ren
        repo: https://github.com/... # 可选 → 「仓库」按钮
        install: |                   # 可选；UI 只看字段是否存在（数据侧把关：plugins/mcp/有 repo 的 skill 才填）
          dsh plugin install dsh-wait-subagent
        config: |                    # 可选；插件给 cordis.yml、MCP 给 mcpServers JSON
          ...
        description: 一句话摘要
        highlights: [...]
        tags: [...]
        note: ...                    # 可选；人类真实备注，默认不出现
        stack: 1
        added: "2026-08-12"
  skills: {...}  mcp: {...}
  tools:                             # 字段集与其他 section 完全同构（content 可选）
    items: [...]
  tomes:                             # 规则库：全局指令/rules 精编（不放个人经验谈）
    items: [{id, title, icon, rarity, tags}]
```

**校验机制（M4）**：zod（`zod/mini`，gzip ~2KB）schema 单一来源，三处消费：① vite.config 内自定义插件（buildStart/watchChange 校验，坏配置 → 终端报错 + dev overlay，报错精确到 `sections.plugins.items[3].icon` 路径）；② 运行时 loader；③ `pnpm validate` 独立脚本。YAML 解析用 **`yaml` 包**（js-yaml 会把 `2026-05-01` 解析成 Date、`1.0` 变数字 1，已实测）。transformIndexHtml 顺带注入 `<title>`/OG（现 index.html 零 OG 且标题硬编码）。

## 4. 内容模型修订

| 原现状 | 新模型 |
|---|---|
| 「深度解析」= longDescription 纯文本 | **完整正文** = `content/<section>/<id>.md`，Markdown 渲染，不再二次提炼 |
| 所有物品都有安装块 | `install` 字段驱动：plugins / mcp / 有 `repo` 的 skill 保留；普通 skill 数据侧删除该字段 |
| configExample 任意出现 | `config` 保留：插件 cordis.yml、MCP mcpServers JSON |
| 农场主秘笈 tips（31 处） | 删除；`note` 字段留给人类真实备注（主题化命名，默认不出现） |
| BOOKS_DATA 4 篇个人经验长文 | **归档到 `docs/essays/`（M6 决策：保留内容但不进背包展示）**，README 提供链接 |
| tomes = 空 | 全局规则精编 3~4 卷：宿主环境志 / 编码心法 / 安全铁律（源自 ~/.dsh/AGENTS.md **脱敏**：剔除 noVNC URL/密码/代理端口等） |
| tab 固定四类 | sections 可配置：可加 `tools`、可删 `plugins`；筛选/空槽文案数据驱动 |
| docId 联动跳转 | 随 essays 一起移除 |
| PixelIcon.tsx / App.css / 未用资产 | 死代码，P0 删除 |

## 5. Harness 档案系统与统计口径（M1 修正后）

- **DSH 采集规范（已实机复核）**：
  - 会话文件 glob = `~/.dsh/sessions/*/*/session*.jsonl*`，**排除 `.bak`/`.corrupt-bak`**；实测 1237 个无版本号 `session.jsonl.zstd`（74%）+ 446 个 `session.v3.jsonl.zstd`，只匹配 v3 会漏 3/4。
  - 会话数 = 首行 header 计数，**按 `origin` 区分 root/subagent（实测约 35%/65%）**；展示口径 = root 主会话数（subagent 计数作为档案彩蛋行）。
  - Token = **结构化解析 `type=="assistant/message"` 的 `data.usage`**（jq/Node JSON 解析，禁用 grep 子串——`"totalTokens"` 子串还出现在 tool/result、compaction/summary 等回显里，grep 会虚高 ~28%）。
  - 展示口径 = **非缓存 input+output**（cacheRead 占 89.6%，总流量既不可比也不好看）；P4 用规范解析器全量重测后填入真实数字。
- **档案弹窗**：品牌头像 + 昵称 + Lv + EXP 条 + 数据行（版本/安装于/主会话/Token/装备计数/存活天数）。布局随主题。
- **头像**：`src/brands/` 像素品牌头像（dsh/claude-code/codex/gemini-cli/cursor/opencode/goose/amp/copilot/aider + generic 兜底）。
- **采集脚本**：`skills/harness-inventory/scripts/collect-stats.mjs`（Node≥22，零依赖，node:sqlite 兜底 Cursor 类；自动探测全部已知 harness；输出 YAML；默认取整；各 harness 手动口径在 `references/harnesses/*.md`，含"累积量 vs 单轮增量/缓存净毛/推理归属"三大陷阱说明）。

## 6. 等级与经验（锚点校准，M3 修正后）

纯函数 `src/stats/level.ts`（node:test 单测）：

```
exp = A·log2(1+rootSessions) + B·log10(1+tokens) + C·√days + itemScore(plugins/skills/mcp/tools/tomes 加权)
level = clamp(1 + floor((exp/K)^p), 1, 99)
```

- **锚点集校准**（防欠定）：用调研报告 §2 的 12 家 harness 真实量级构造 4 个人设锚点（轻度/中度/重度/离谱 → 目标约 Lv.5/9/14/20），DSH 真机数据为第 5 锚（目标 ≈16）。锚点表与拟合结果写入 README，fork 者可预期。
- 会话与 Token 同样对数压缩（会话数也跨 4-5 个数量级且最易刷）。
- 等级**称号阶梯**随主题词汇表变化。`harness.level` 可显式覆盖（彩蛋与公式解耦：想固定 16 就写 16）。
- EXP 条 = 当前等级区间内进度。

## 7. 图标系统

```
item.icon 解析链:
  1. config/icons/<icon>.svg        → 内联 SVG（我们的 45 个手绘图腾迁到这里）
  2. config/icons/<icon>.png|.gif   → 位图（AIGC 可选通道）
  3. src/iconkit registry id        → 7Soul 套件（多物品共用合法）
  4. 兜底 chest
```

- **7Soul 496（CC0）全量入库** `src/iconkit/assets/`（1.54MB；已实测 496 张全 34×34 RGBA，149 张触边**不可裁切**，原生 34×34 整数倍渲染 34/68px；前缀 W_/A_/Ac_/S_/P_/I_ 语义命名）。`registry.ts` = id→文件 + **常用 id 分组速查表**（~80 个精选）。fork 者零网络即可用全量。
- 归属：CC0 免署名，但 LICENSE/NOTICE/CREDITS + README + `references/icons.md` + 页脚 credit 五处致谢（zip 内无 license 文件，文本取自 OGA 页；Public Domain 声明范围限定为其免费 RPG 套件，对外措辞注意）。**红线：LPC（CC-BY-SA 传染）、itch.io 受限免费包（itch.io 上的 CC0 包如 Shade/Nikoichu 不在此列）。**
- 图鉴页 `#/icons`：全量 id 网格 + 复制 id + 归属信息。
- 自定义图标建议 16/32px 真像素（文档说明混排观感差异）。

## 8. 主题系统（4 主题）

### 8.1 机制
- token 接口（颜色/边框/纹理/字体/品质色/阅读器）+ 词汇表接口（货币、档案称呼、tab 默认名、品质命名、正文章节标题、HUD 提示、空态、badge 用语）+ 音色 profile；四个主题各一个文件，`:root[data-theme]` 注入 CSS 变量。
- 现状 755 处硬编码 hex + 2925 处中文字面量全部 token 化（P5a）。
- 主题切换：HUD 按钮 + `?theme=` + localStorage；默认来自 config；切换伴音效。
- 字体加载：@font-face 随 data-theme 切换，仅激活主题字体被下载。

### 8.2 四主题规格
| | stardew（现状保留） | pokemon | jrpg | diablo |
|---|---|---|---|---|
| 灵感 | 星露谷菜单 | 宝可梦 Gen3 摘要卡 | FF/DQ 菜单窗 | D2 角色面板 |
| 基调 | 暖木+羊皮纸 | 奶油底+红白圆角双框+HP/EXP 条 | 深蓝渐变窗+细白双线框+金色光标 | 近黑+血红+鎏金浮雕 |
| 品质映射 | 银星/金星/铱星★ | 精球/超级球/高级球配色语言 | 铜/银/金/虹 | 白装/魔法蓝/稀有金/传奇橙 |
| 字体 | 现状（DotGothic16+Silkscreen） | PKMN(MIT) 展示 + Fusion Pixel 正文 | Cinzel(OFL) 展示（中文回退系统 serif）+ Fusion Pixel 正文 | Pirata One(OFL) 哥特展示（中文回退系统 serif）+ Fusion Pixel 正文 |

- **字体（M7 修正）**：CJK 正文 = Fusion Pixel 12px 比例版 zh_hans（OFL，实测 666KB woff2，全量自托管保证 fork 者任意文案覆盖；不做按字子集——会破坏 fork 者文本）。DotGothic16 转 woff2（1.9MB→~1MB）去重（dist 现两份）。PKMN 三字重 ttf→woff2。**Johto 已闭源，删除不用**。OFL 字体随仓分发许可文本（NOTICE）。**红线：Zpix（商业收费）/ IPix（无授权）/ VonwaonBitmap（字模瑕疵）禁用。**
- 渲染防模糊：正文严格 12px 整倍数、行高整像素、避免半像素位移；`image-rendering:pixelated` 只对真位图有意义。
- 新主题质量闸门：截图迭代循环；**某主题两轮迭代仍达不到"一眼就是那个游戏"则砍掉**（3 个惊艳 > 4 个平庸）；stardew 回归 diff 是硬门槛。

## 9. Badge（游戏名片）

- 纯函数 `src/badge/build.ts`：主题 tokens + 档案 → SVG 字符串（Node/浏览器共用）。
- 规格：约 480×160：品牌头像 + 昵称 + harness 名 + Lv 徽章 + EXP/HP 条 + 2~3 数据 chip + 主题框架。
- **字体（已核实可行）**：`<img>` 上下文 SVG 不能加载外部字体，但**可内嵌 data-URI 字体子集**——PKMN/Pirata One 拉丁子集（数字+字母，~10-20KB）data-URI 嵌入 badge；中文昵称回退系统字体栈。
- 构建：`scripts/gen-badges.ts`（tsx）predev/prebuild 生成 `public/badges/{四主题}.svg` + 默认 `badge.svg` + `favicon.svg`（= 品牌头像）。
- 站内 `#/badge` 页：四主题实时预览 + GitHub/HTML 嵌入片段复制 + "如何拥有你的背包"引导。

## 10. 配套 Skill（`skills/harness-inventory/`）

- `SKILL.md`：标准 agent-skill 格式，面向任意 harness 的 agent，自包含零 DSH 假设。流程 §1.2（含**与人类对齐闸门**与话术模板）。
- **获取代码一节写 "Use this template / npx degit"，明确劝阻直接 fork**（带历史+私货）。
- `references/`：`schema.md`（全字段）、`privacy.md`（脱敏指南：绝不入库/建议脱敏/人工复核三级 + `pnpm privacy:scan` 说明）、`harnesses/*.md`（每家采集指南）、`publish.md`（GH Pages）、`icons.md`（常用 id 表 + 自定义/AIGC 通道）。
- `scripts/collect-stats.mjs`：统一采集器（§5 规范）。

## 11. 实施阶段（每阶段独立验证 + 独立 commit）

| Phase | 内容 | 验证 |
|---|---|---|
| **P-1** | **基准截图归档**（改代码前！四视图：plugins grid+detail / skills / mcp / books / 档案弹窗，PC+移动两断点，存 docs/features/.../baseline/） | 截图齐全 |
| P0 | 清理死代码（PixelIcon.tsx、App.css、assets 残留、public/fonts 重复） | build 绿 + 截图无回归 |
| P1 | config 基建：`yaml` 包 + zod schema 单源 + vite 校验插件（buildStart/watchChange + overlay）+ transformIndexHtml 标题/OG + `pnpm validate` | 坏配置用例在 dev/build 均报错；好配置通过 |
| P2 | 迁移：inventoryData.ts → config/（脚本：yaml+md+45 svg 抽取，用后即弃）+ 人工修整（install 字段规则、tips 删除、essays→docs/essays/、tomes 脱敏重写） | build 绿 + 条目数/字段完整性断言 |
| P3 | 图标系统：解析链 + 7Soul 入库 + registry + `#/icons` 图鉴页 | 图鉴截图 + 解析链单测 |
| P4 | 品牌头像 + 档案弹窗 + HUD + 等级公式（**规范解析器全量重测 DSH 数据 + 锚点校准**） | level 单测 + 档案截图 |
| P5a | 主题 token 化全组件 + stardew 逐图对齐 | **visual diff ≤ 阈值（硬门槛）** |
| P5b | pokemon / jrpg / diablo 三主题 + 字体管线 + 音色 profile | 每主题七面截图走查（两轮不达标砍主题） |
| P6 | 内容模型 UI：详情卡 md 正文、install/config 规则化、tomes 阅读器主题化、tools tab、空态数据驱动 | 交互走查 |
| P7 | badge：build 函数 + data-URI 字体子集 + gen 脚本 + badge 页 + favicon | 4 主题 SVG + 页面截图 |
| P8 | skill 全套 + harness.example.yaml + init-harness（含 package.json/index.html/README 重置）+ privacy-scan（全仓）+ **白板状态 fork 演练**（子代理从干净 clone + init 起步走全流程） | 演练报告 |
| P9 | 文档：README（全配置项）、AGENTS.md、content-maintenance.md 重写 + LICENSE/NOTICE/CREDITS + CI（Node 22、configure-pages enablement、node:test） | 配置面逐项核对 |
| P10 | 端到端验证：e2e 子代理 + 四主题视觉走查 + reviewer 检视 | validation.md / review.md |

## 12. 风险与对策

- **图标/字体许可**：LICENSE/NOTICE/CREDITS 齐备（M7 欠账清偿）；OFL 字体附许可文本；7Soul 措辞限定范围。
- **js-yaml Date 雷**：已换 `yaml` 包；schema 文档统一教引号写法。
- **stardew 回归**：P-1 基准截图 + P5a 逐图 diff，不达标不进 P5b。
- **新主题平庸**：两轮迭代闸门，宁缺毋滥。
- **fork 带私货**：Use this template / degit 路线 + privacy:scan 全仓 + README 劝阻 fork。
- **等级公式失真**：锚点集校准 + 显式 level 覆盖兜底。
- **多 Agent 并行冲突**：严格阶段化 + 每阶段独立 commit；范围外不动。

## 13. 本次不做（明确出界）

- 拆仓实操与 GitHub template 旗标（用户操作，收尾时提示）
- 在线 badge 服务/动态 API（纯静态产物）
- 新增外部重依赖（react-router / icon 库 / UI 框架不进；`yaml`+`zod/mini`+`tsx` 为必要的轻依赖）
- AIGC 图标自动生成链路（只留可选通道与指南）
- git 历史重写（无授权不做）
