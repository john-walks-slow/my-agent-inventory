# 我的 DSH 背包 (My DSH Inventory) 🎒

> 模仿《星露谷物语》背包系统，展示个人自研的 DSH 插件、全域 Agent 技能、MCP 服务器和实战避坑经验典籍。
> 本仓库同时是 **harness-inventory 模板的官方填充实例**——任何 AI coding harness 都能拥有自己的背包（见下文「做你自己的背包」）。

🌐 **在线体验 (GitHub Pages)**：https://john-walks-slow.github.io/my-dsh-inventory/

## ✨ 能做什么

- 🎒 **36 格背包网格**：品质星级（普通/银/金/铱星★）、分类筛选胶囊、全文检索、悬停预览条
- 📜 **双向联动详情卡**：摘要、亮点、Markdown 深度正文、一键复制安装命令与配置示例
- 📖 **典籍阅读器**：书架 + 羊皮纸 Markdown 阅览器，收纳踩坑长文（reader 型 section）
- 👤 **harness 档案**：品牌头像、昵称、版本、入坑日期、会话/Token 统计、对数压缩的等级经验公式与称号
- 🎨 **四主题**：`stardew`（星露谷）/ `pokemon`（宝可梦）/ `jrpg`（日式 RPG）/ `diablo`（暗黑）——配色、字体、音色、全套文案随主题切换
- 🪪 **游戏名片 badge**：480×160 纯 SVG，四主题各一枚，站内 `#/badge` 页提供 URL / Markdown / HTML 嵌入片段
- 🖼️ **内置 496 枚 CC0 像素图标**（7Soul），`#/icons` 图鉴页在线检索；自定义 16×16 SVG 随放随用
- 🎵 **8-bit Web Audio 原生声效**：悬停轻击、拾取、翻书、金币（HUD 金币可点，音效可关）

---

## 🍴 做你自己的背包（fork 者）

完整流程由随仓 skill 驱动，把这句话交给你的 agent 即可：**「帮我做一个我的 harness 背包，从仓库里的 `skills/harness-inventory/SKILL.md` 开始」**。十步流程（识别 harness → 采集统计 → 与你对齐确认 → degit → 白板初始化 → 填充 → 预览 → 隐私自检 → 发布 GH Pages → 领 badge）见 [skills/harness-inventory/SKILL.md](./skills/harness-inventory/SKILL.md)。

```bash
# 获取白板（二选一，都无 git 历史；不要直接 fork——会带走本站全部私货）
npx degit john-walks-slow/my-dsh-inventory my-<harness>-inventory
# 或在 GitHub 页面点 "Use this template"

cd my-<harness>-inventory
pnpm install
pnpm init:harness --name "Claude Code" --title "我的 Claude 背包" --theme pokemon --yes
```

`init:harness` 会清空本站内容、重置 `harness.yaml`/README/AGENTS、删除文档私货，只留下引擎与模板。

---

## ⚙️ 配置总览

整站由 `config/harness.yaml` 驱动（schema 见 `src/config/schema.ts`，逐字段文档见 [skills/harness-inventory/references/schema.md](./skills/harness-inventory/references/schema.md)）。**改完跑 `pnpm validate`**。

### site —— 站点信息

```yaml
site:
  title: 我的 DSH 背包          # 页面 h1 + 浏览器标签 + 分享卡
  subtitle: 个人开发的……        # 可选副标题
  theme: stardew               # stardew | pokemon | jrpg | diablo
```

### harness —— 背包主人档案

```yaml
harness:
  name: DeepSeek Harness       # 必填，harness 全名
  nickname: 大肥鱼              # 可选，HUD/档案优先展示
  brand: dsh                   # 内置品牌头像：dsh / claude-code / codex / cursor /
                               # goose / amp / gemini-cli / copilot / aider / opencode / generic
  # customAvatar: my-avatar    # 可选，用 config/icons/my-avatar.svg 覆盖内置头像
  version: '1.5.0'             # 可选（记得引号）
  since: '2026-08-27'          # 入坑日期 YYYY-MM-DD（等级公式「工龄」项，记得引号）
  stats:
    sessions: 487              # 主会话数（root 口径，不含子代理）
    subagentSessions: 1223     # 可选，档案彩蛋行
    tokens: 4437773392         # 累计 Token（非缓存 input+output）
    cacheTokens: 40385121961   # 可选，缓存命中
  # level: 16                  # 可选，显式覆盖等级（1-99）；缺省按公式自动计算
```

统计一键采集（DSH / Claude Code / Codex 全量，其余 harness 给出指南）：

```bash
node skills/harness-inventory/scripts/collect-stats.mjs --harness dsh
```

### sections —— 背包 Tab

```yaml
sections:
  - id: plugins                # 小写字母/数字开头，允许 - _ .；全局唯一
    label: 插件                # 可选，缺省用主题默认名
    icon: puzzle              # 同物品图标解析链
    categories:                # 可选，筛选胶囊
      - { id: core, label: 核心 }
    items: [ … ]               # 见下
  - id: tomes
    view: reader               # grid（默认背包格）| reader（典籍阅读器）
    icon: scroll
    items: [ … ]
```

### items —— 装备条目

```yaml
- id: dsh-wait-subagent        # section 内唯一；决定正文文件名
  name: dsh-wait-subagent      # 显示名
  title: 子代理收敛同步器       # 可选，中文称号
  icon: hourglass             # 图标（见「图标」一节）
  rarity: iridium              # normal | silver | gold | iridium（品质边框+星级）
  category: tools              # 可选，须在 section 的 categories 中定义
  stack: 1                     # 可选，格子右下角叠加数
  version: '1.0.0'             # 可选
  author: John Ren             # 可选
  repo: https://github.com/…   # 可选，详情卡「仓库」按钮
  install: |                   # 可选，安装命令块（仅插件/MCP/有仓库的 skill 填）
    pnpm add -g dsh-wait-subagent
  config: |                    # 可选，配置示例块（插件给宿主配置，MCP 给 mcpServers JSON）
    plugins:
      - dsh-wait-subagent
  description: 一句话摘要       # 必填，悬停预览 + 详情卡首行
  highlights:                  # 可选，2-4 条亮点
    - 阻塞等待指定后台子代理
  tags: [Subagent]             # 可选
  note: 人类真实备注             # 可选，默认不出现
  added: '2026-09-16'          # 可选，收录日期
```

### 正文 —— `config/content/<section>/<id>.md`

每件装备的深度解析正文，Markdown 全支持（标题/列表/代码块/表格）。文件名与 `section id + item id` 一一对应，缺失会在 `validate` 提示。reader 型 section 的正文即典籍书页。

### 图标

解析链：`config/icons/<icon>.svg` → `config/icons/<icon>.png` → 内置套件 id → 兜底。

- 内置套件 496 枚（7Soul，CC0），站内 `#/icons` 图鉴页可浏览检索；常用 121 枚速查表见 [references/icons.md](./skills/harness-inventory/references/icons.md)
- 自定义：`config/icons/` 放 16×16 像素风 SVG/PNG（AIGC 生成图标也走这里）
- ⚠ kit id 拼错不报错（静默兜底），`puzzle`/`sword` 这类裸词不在套件里（是 `sword-1`），从速查表复制最稳

### 等级与经验（fork 者预期表）

```
exp = 1.0·log2(1+sessions) + 1.0·log10(1+tokens) + 0.35·√days + 0.35·装备分
等级 = 1 + ⌊exp / 4.2⌋（上限 99）；装备分 = 插件×2 + 技能×1 + MCP×3 + 工具×1.5 + 典籍×5
```

| 人设 | sessions | tokens | days | 装备（插件/技能/MCP/工具/典籍） | 期望等级 |
|---|---|---|---|---|---|
| 轻度 | 50 | 500 万 | 60 | 2/3/1/0/1 | Lv.5 |
| 中度 | 300 | 1 亿 | 200 | 5/10/2/3/2 | Lv.9 |
| 重度 | 1200 | 6 亿 | 400 | 10/25/4/10/3 | Lv.14 |
| 离谱 | 5000 | 30 亿 | 700 | 15/40/6/20/5 | Lv.20 |
| 本站实测（DSH） | 482 | 43.6 亿 | 31 | 13/41/3/24/4 | Lv.16 |

等级称号随主题变化（stardew：见习农场主→渔夫大师→银河农夫；pokemon：短裤小伙→……）。不认可公式结果时用 `harness.level` 显式覆盖，EXP 条仍按公式计算进度。

---

## 🛠️ 命令

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 本地开发（HMR；改配置即时校验，坏配置页面飘红） |
| `pnpm build` | 生产构建（内含类型检查 + 配置校验 + badge/favicon 生成） |
| `pnpm preview` | 预览构建产物 |
| `pnpm test` | 单测（等级公式锚点 / 图标解析链 / 词汇表 / badge 布局，node:test） |
| `pnpm lint` | oxlint |
| `pnpm validate` | 单独校验配置（schema + 正文/图标引用完整性） |
| `pnpm init:harness` | 白板初始化（fork 后第一步） |
| `pnpm privacy:scan` | 全仓隐私扫描（发布前必跑） |

## 🔒 隐私与发布

- **`pnpm privacy:scan`**：硬模式扫密钥形态（`sk-`/`ghp_`/私钥/赋值密钥），命中即 exit 1 阻断；软模式提醒域名/IP/个人路径。误报的公共域名写入 `.privacy-allow`（每行一个，后缀匹配）。分级标准见 [references/privacy.md](./skills/harness-inventory/references/privacy.md)。
- **发布**：push 到 GitHub → Settings → Pages → Source 选 **GitHub Actions** → 推 main 自动部署（`.github/workflows/deploy.yml`，Node 22 构建）。
- **badge**：部署后领取 `<站点URL>/badges/<theme>.svg`（另有 `/badge.svg` 跟随 `site.theme`），嵌入片段在站内 `#/badge` 页一键复制。

## 🗺️ 站内路由与彩蛋

- `#/icons`：496 枚内置图标图鉴（分组浏览 + 检索）
- `#/badge`：四主题名片预览与嵌入片段
- HUD 金币点击有音效彩蛋；音效开关在 HUD 右侧；「档案」按钮弹出 harness 数据卡

## 📚 更多文档

- 内容扩展规范：[references/content-maintenance.md](./references/content-maintenance.md)
- 项目地图：[AGENTS.md](./AGENTS.md)
- fork 全流程 skill：[skills/harness-inventory/](./skills/harness-inventory/)
- 字体清单与许可：[src/assets/fonts/README.md](./src/assets/fonts/README.md)；图标归属：[src/iconkit/CREDITS.md](./src/iconkit/CREDITS.md)

## 🙏 致谢与许可

代码 MIT（[LICENSE](./LICENSE)）；第三方资产清单见 [NOTICE](./NOTICE)，致谢名单见 [CREDITS.md](./CREDITS.md)。
受《星露谷物语》启发的非官方粉丝作品，与 ConcernedApe 无附属关系。
