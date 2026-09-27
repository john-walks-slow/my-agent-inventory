---
name: harness-inventory
description: 为任意 AI coding harness（Claude Code / Codex CLI / DSH / Cursor / Gemini CLI 等）生成一个星露谷风格的「个人装备背包」展示站：采集本地真实使用统计（会话数、Token、等级）、盘点插件/技能/MCP 装备、填充 YAML 配置、隐私自检并发布到 GitHub Pages，最后领取游戏名片 badge。当人类说「帮我做一个我的 harness 背包 / 我的 Claude 背包 / 展示我的 AI 装备」或要求 fork/degit 本站模板时使用。
---

# Harness Inventory —— 打造你的 harness 背包

把一个 harness（AI coding agent 运行时）的插件、技能、MCP 与踩坑经验，做成《星露谷物语》背包风格的展示站。
本 skill 自包含，不假设你运行在哪种 harness 里。仓库：<https://github.com/john-walks-slow/my-dsh-inventory>

## 十步流程

### 1. 识别 harness

检测本地痕迹判断人类在用哪个 harness：

| 痕迹目录 | harness |
|---|---|
| `~/.dsh/` | DSH (DeepSeek Harness) |
| `~/.claude/` | Claude Code |
| `~/.codex/` | OpenAI Codex CLI |
| `~/.cursor/` | Cursor |
| `~/.gemini/` | Gemini CLI |
| `~/.config/goose/` | Goose |
| `~/.config/amp/` `~/.amp/` | Amp |
| `~/.copilot/` | GitHub Copilot CLI |
| `~/.aider*` | Aider |

检测到**多个** harness 时，列出清单让人类选一个（不要自作主张）。
各家数据存储位置与统计口径详见 `references/harnesses/`（dsh / claude-code / codex / cursor / generic）。

### 2. 采集原始数据

```bash
node skills/harness-inventory/scripts/collect-stats.mjs                        # 自动探测
node skills/harness-inventory/scripts/collect-stats.mjs --harness claude-code  # 指定一家
```

零依赖、只读本地文件。**先快速探测（只数文件，秒级）**：多个 harness 都有会话数据时立即 `exit 2` 呈报，按第 1 步让人类选一个，再用 `--harness <id>` 重跑（id 为 kebab-case：`dsh` / `claude-code` / `codex` / `cursor` / …）。
DSH / Claude Code / Codex CLI 会全量解析并输出 YAML 片段（大量会话需数十秒到几分钟，进度实时打印）；Cursor 等其余 harness 探测到痕迹后指引你读对应采集指南（`references/harnesses/generic.md` 含通用陷阱清单）。
通道约定：**YAML 片段走 stdout**（可 `> stats.yaml` 安全重定向），进度与告警走 stderr。
版本号的获取命令见 `references/harnesses/<id>.md` 的「版本」小节；昵称采集不到，第 3 步与人类商量拟定（可留空）。

### 3. 与人类对齐（必经闸门 ⛔）

**在填充任何将要公开的数据之前（第 6 步），必须把以下内容呈报人类并取得确认。未获确认不得进入第 6 步。**

话术模板（直接改写后使用）：

> 我从 `<harness>` 本地记录中采集到以下数据，计划放进你的公开背包站，请确认：
>
> **【harness 档案】**
> - 昵称：`<...>`　版本：`<...>`　启用日期：`<since>`
> - 主会话数：`<N>`　子代理会话：`<N>`
> - 累计 Token：`<N>`（非缓存口径）　缓存命中：`<N>`
>
> **【装备清单】**（共 N 件）
> - `<section>`：`<item1>`、`<item2>`…
>
> **【隐私提示】**（我建议脱敏/不展示的项）
> - `<例如：repo 链接含内网域名；正文提及本机 IP>`
>
> 以上是否可以原样发布？需要修改、隐藏或补充的请直接说。

### 4. 获取代码（不要直接 fork！）

两种方式，都**不带 git 历史**：

- **Use this template**：在仓库 GitHub 页面点 `Use this template`，得到单 commit 的干净仓库（推荐）。
- **degit**：

```bash
npx degit john-walks-slow/my-dsh-inventory my-<harness>-inventory
cd my-<harness>-inventory && git init && git add -A && git commit -m "init from harness-inventory template"
```

⛔ **明确劝阻直接 `git fork`**：fork 会带走完整提交历史，以及原站作者的全部私有内容（配置、正文、文档）。本站设计上就是「白板模板 + 各自填充」，template / degit 才是正路。

### 5. 初始化白板

```bash
pnpm install
pnpm init:harness --name "Claude Code" --title "我的 Claude 背包" --theme pokemon --yes
```

该命令把模板**彻底重置为白板**——degit 只去掉 git 历史，正文私货仍在，靠这一步清：
- 清空 `config/content/` 与 `config/icons/`（保留 .gitkeep 与目录结构）
- `config/harness.yaml` ← `harness.example.yaml`（代入 name/title/theme；brand 由 --name 自动映射）
- `package.json` name、`index.html` 标题
- README.md / AGENTS.md ← 白板模板（原正文是模板作者的内容）
- 删除 `docs/` 下的作者历史文档（features/issues/essays/lessons/freeform/references/learning）
- `.privacy-allow` ← 模板（仅保留 iconkit/字体署名域名的豁免，去掉作者个人域名）

`--yes` 跳过交互确认（agent 场景推荐；交互确认用于人类手动执行）。主题四选一：`stardew` / `pokemon` / `jrpg` / `diablo`。
注意：白板 `harness.yaml` 里的 `nickname` / `version` / `since` 仍是占位符，第 6 步记得替换为真实数据。

### 6. 填充配置

- 主配置 `config/harness.yaml`：粘贴第 2 步采集的 YAML 片段 + 逐件装备条目。**全字段说明见 `references/schema.md`**。
- 每件装备的深度正文：`config/content/<section>/<id>.md`（Markdown）。
- 图标：从 `references/icons.md` 的常用 id 表选（内置套件共 496 枚，表内精选 121 枚），或在 `config/icons/` 放自定义 16×16 SVG；AIGC 生成图标走 `config/icons/` 为**可选**通道。
- 随时校验：`pnpm validate`（id 唯一性、category 引用、正文/图标完整性全查）。

### 7. 本地预览

```bash
pnpm dev
```

打开终端打印的地址，**请人类过目**背包、详情卡、典籍、档案弹窗与主题切换，按反馈修改。

### 8. 隐私自检

```bash
pnpm privacy:scan
```

全仓扫描。**硬模式**（私钥、API Key、Token 等密钥形态）命中即 `exit 1` 阻断发布；**软模式**（域名、IP、个人路径）警告放行。
误报的公共域名可加入 `.privacy-allow`（每行一个，支持后缀匹配）。分级标准与用法见 `references/privacy.md`。

### 9. 发布 GitHub Pages

push 到 GitHub → 仓库 **Settings → Pages → Build and deployment → Source 选 GitHub Actions** → 用仓库自带的 `deploy` workflow（Node 22 + build + deploy，一次配置）。
详细步骤见 `references/publish.md`。

### 10. 领取 badge

部署完成后名片地址为 `<站点URL>/badges/<theme>.svg`（四主题各一枚，构建时生成）。
站内 `#/badge` 页提供 URL / Markdown / HTML 三种嵌入片段的一键复制，把人类引到那里即可。

## 快速索引

- 配置字段 → `references/schema.md`
- 图标选型 → `references/icons.md`
- 隐私分级 → `references/privacy.md`
- 发布步骤 → `references/publish.md`
- 各 harness 采集指南 → `references/harnesses/{dsh,claude-code,codex,cursor,generic}.md`

## 铁律

1. 对齐闸门（第 3 步）必经，先确认后填充。
2. 直接 fork 被明确劝阻——历史与私货问题无解，用 template / degit。
3. 采集器与隐私扫描只读、零副作用；但**发布是公开行为**，`privacy:scan` 通过 ≠ 免责，最终以人类确认为准。
