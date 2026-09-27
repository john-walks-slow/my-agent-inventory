# Claude Code 背包 fork 演练报告 —— SKILL.md 可用性验收

- **日期**：2026-09-27
- **演练者**：零上下文 coding agent（仅以 `skills/harness-inventory/SKILL.md` + `references/` 为操作指南，不依赖任何先验知识）
- **模板位置**：`/tmp/p8-drill`（degit 干净副本，无 git 历史；演练中补做了 `git init` 基线提交以便 diff 取证）
- **流程调整**（人类预授权）：步骤 3 闸门预授权（统计用真实采集、装备围绕 Claude Code 生态自拟、无隐私敏感项，闸门话术全文见 §3.3）；步骤 4 已代劳；步骤 7 dev server 用高位端口 5199 + 截图后关闭；步骤 9 只核对不 push；步骤 10 只验本地构建产物。
- **结论速览**：十步流程**带一处代码修复后**可走通；验收 7 项全过；共发现 **13 项问题**（A 级 3 / B 级 4 / C 级 6），详见 §8。

---

## 1. pnpm install

```bash
$ pnpm install
+ puppeteer-core 25.11.0
+ tailwind-merge 3.7.0
+ tailwindcss 4.3.3
+ tsx 4.23.15
+ typescript 6.0.3
+ vite 8.3.0
Done in 4.1s using pnpm v11.24.0
```

**✅ 通过**（exit 0，本机 pnpm store 离线完成，无网络请求）。

## 2. init:harness 白板初始化

### 2.1 首次运行：直接崩溃（A 级 bug，详见 §8 问题 1）

```bash
$ pnpm init:harness --name "Claude Code" --title "我的 Claude 背包" --theme pokemon --yes
my-harness-inventory · 白板初始化
  目录: /tmp/p8-drill
node:fs:1241
SystemError [ERR_FS_EISDIR]: Path is a directory: rm returned EISDIR (is a directory) /tmp/p8-drill/config/content/mcp
    at walk (file:///tmp/p8-drill/scripts/init-harness.mjs:69:42)
[ELIFECYCLE] Command failed with exit code 1.
```

定位：`scripts/init-harness.mjs:69` 对清空后变空的目录调 `rmSync(p)` 但未带 `{ recursive: true }`。触发条件正是模板实发状态——`config/content/<section>/` 里只有 `.md`、**没有任何 `.gitkeep`**（`find config -name '.gitkeep'` = 0 个）。且崩溃发生在破坏性操作中途，留下半清理状态（`config/content/mcp/` 已被清空，其余原样）。

**演练内最小修复**（一行，diff 见附录 B）：

```diff
-        if (readdirSync(p).length === 0) rmSync(p);
+        if (readdirSync(p).length === 0) rmSync(p, { recursive: true });
```

### 2.2 修复后重跑：成功，验收断言逐项核对

```bash
$ pnpm init:harness --name "Claude Code" --title "我的 Claude 背包" --theme pokemon --yes
✓ 已清空 config/content + config/icons（103 个文件）
✓ config/harness.yaml 已重置（name: Claude Code）
✓ package.json name → claude-code-inventory
✓ index.html <title> 已更新
✓ README 标题已更新
```

| 验收断言 | 实测 | 结果 |
|---|---|---|
| `config/content` 清空 | `find config/content -type f -o -type d` 仅剩 `config/content` 自身 | ✅ |
| `config/icons` 清空 | 目录空 | ✅ |
| `harness.yaml` 重置为白板 | 内容 = example.yaml 代入 `name: Claude Code` / `title: 我的 Claude 背包` / `theme: pokemon` | ✅ |
| `package.json` name | `"claude-code-inventory"` | ✅ |
| `index.html` 标题 | `<title>我的 Claude 背包</title>` | ✅ |
| `README` 首个 `#` 标题 | `# 我的 Claude 背包` | ✅ |

**✅ 通过（含一处必要修复）**。附注：SKILL.md 说「保留 .gitkeep」，实际模板无 .gitkeep 且分区子目录被连锅删除（问题 8）；README 仅改标题，正文仍残留「展示个人自研的 DSH 插件」与原作者 Pages 链接（问题 7）。

## 3. 采集器与真实统计

### 3.1 步骤 1-2：识别与采集

本机探测到 **6 个** harness 痕迹（`~/.dsh` `~/.claude` `~/.codex` `~/.cursor` `~/.gemini` `~/.copilot`）。首次裸跑采集器（无参数）：

- **被 60s 工具超时杀掉**（无任何进度输出）；
- 加大超时重跑：**2m40s** 后才报多 harness 冲突 `exit 2`（冲突检测发生在把 DSH 487 会话 + Claude Code 284 会话全部解析完之后，问题 4/5）；
- 按脚本报错提示加 `--harness claude-code`（参数用法 SKILL.md 未记载，问题 6），**3.9s** 完成：

```bash
$ node skills/harness-inventory/scripts/collect-stats.mjs --harness claude-code
# collect-stats 输出（Claude Code，采集于 2026-09-27）
# input_tokens 不含 cache_read（Anthropic 口径），两者独立相加展示
harness:
  brand: claude-code
  since: "2026-09-27"
  stats:
    sessions: 284
    tokens: 50285819
    cacheTokens: 939788989
```

### 3.2 交叉验证（按 references/harnesses/claude-code.md 的口径说明）

| 指标 | 采集器 | 手工核对 | 判定 |
|---|---|---|---|
| sessions | 284 | `find ~/.claude/projects -maxdepth 2 -name '*.jsonl' \| wc -l` = 284 | ✅ 一致 |
| subagentSessions | 0（未输出） | `find ~/.claude/projects -path '*subagents*' -name '*.jsonl'` = **13** | ❌ **漏计 13 个**（问题 2） |
| since | 2026-09-27 | `stats-cache.json` 不存在；最早 jsonl mtime = **2026-08-29**（项目目录名显示 8-26 的会话） | ❌ **口径错误**（问题 3） |
| tokens/cacheTokens | 50,285,819 / 939,788,989 | message.id 去重口径，量级合理 | ✅ 采信 |
| version | （不输出） | `claude --version` → `2.1.235 (Claude Code)` | ⚠️ 需手工补（问题 12） |

### 3.3 步骤 3 对齐闸门：话术模板呈报文本（人类已预授权，此处全文留档以证明闸门可执行）

> 我从 `Claude Code` 本地记录中采集到以下数据，计划放进你的公开背包站，请确认：
>
> **【harness 档案】**
> - 昵称：`Claude`（采集器不采集昵称，暂拟）　版本：`2.1.235`（`claude --version`，采集器不输出）　启用日期：`2026-09-27`（stats-cache.json 缺失，采集器回退取 ~/.claude 目录时间——口径存疑，实际最早会话 2026-08-29）
> - 主会话数：`284`　子代理会话：`0`（采集器口径；实测漏计 13 个嵌套 subagents 会话，真实值应为 13）
> - 累计 Token：`50,285,819`（非缓存口径）　缓存命中：`939,788,989`
>
> **【装备清单】**（共 3 件，Claude Code 生态自拟）
> - `tools`：`cc-guard`（Token 守门人 · PreToolUse 预算闸门）
> - `skills`：`deep-dive`（深潜研究术 · 三段式调研技能）
> - `tomes`：`子代理失控记`（reader 典籍 · 子代理雪崩踩坑实录）
>
> **【隐私提示】**（我建议脱敏/不展示的项）
> - 无隐私敏感项：统计均为聚合计数，不含会话内容；装备为虚构条目，repo 链接统一用 `github.com/example/` 占位
> - 需人工知晓：`since` 日期因采集器回退逻辑可疑；README 正文残留模板原作者的站点链接与 DSH 描述，建议发布前重写
>
> 以上是否可以原样发布？需要修改、隐藏或补充的请直接说。

**人类预授权答复**：确认——统计用真实采集结果，装备按清单自拟，无隐私敏感项，继续第 5-6 步。

### 3.4 统计落入 harness.yaml

采集片段整块粘贴进 `config/harness.yaml` 的 `harness:` 块（附 `version: "2.1.235"`、`nickname: Claude`），档案弹窗实测回显（§5 截图 3）：`主会话: 284 场 / 累计 Token: 5028.6 万（非缓存）/ 缓存命中: 9.4 亿 / 入坑日期: 2026-09-27`。

**✅ 通过**（sessions/tokens/cacheTokens 三个真实数字进入站点并渲染；since/subagentSessions 带错值，见问题 2/3）。

## 4. 装备填充与 validate

3 件自拟装备（2 grid + 1 reader）+ 3 篇正文 + 1 枚自定义图标（同时覆盖 custom→kit 两条图标解析链）：

```
config/harness.yaml                      # 完整重写：采集片段 + 3 sections/3 items
config/content/tools/cc-guard.md         # grid 正文（表格/代码块）
config/content/skills/deep-dive.md       # grid 正文
config/content/tomes/subagent-rebellion.md  # reader 典籍正文（多级标题）
config/icons/cc-guard.svg                # 自定义 16×16 像素盾牌图标
```

```bash
$ pnpm validate
✓ schema 校验通过（theme=pokemon, 3 个 section）
✓ 物品 3 个，正文 3 篇
✔ validate 完成（警告不阻断，schema 错误才阻断）
```

**✅ 通过**。schema.md 的字段表与 strictObject 行为完全对应，`rarity`/`category`/`install`/`config` 等字段一次写对；`version`/`since` 加引号的提醒在 schema.md 首屏就有，有效避坑。

## 5. 本地预览（dev server + 截图）

```bash
$ pnpm dev --port 5199 --host 127.0.0.1
badge: diablo.svg 14.9KB
badge: favicon.svg (claude-code)
[harness-config] 校验通过
  VITE v8.3.0  ready in 764 ms
  ➜  Local:   http://127.0.0.1:5199/
```

用 devDependencies 里的 puppeteer-core + `/usr/bin/google-chrome` 写一次性截图脚本（`/tmp/p8-drill/.drill-shots.mjs`），截 3 张存 `/tmp/p8-drill/.drill-shots/`，随后 kill server（`ss -tlnp` 确认端口释放）：

| 截图 | 内容核验（视觉桥读图转录） |
|---|---|
| `01-inventory-grid.png` | 36 格背包网格（持有数 1/36）+ cc-guard 详情卡：超级球品质（pokemon 主题品质命名）、作者、3 条特性、Markdown 图鉴说明渲染、`#token #hooks #budget` 标签、兑换所（安装按钮的主题化命名）。HUD：`Lv.5 短裤小伙`（pokemon 等级称号）、`P 777,777` 货币。Tab：`工具 1 / 技能 1 / 典籍 1` |
| `02-tomes-reader.png` | 典籍 reader 视图：书架 + 羊皮纸渲染《子代理失控记》全文（多级标题、列表、标签），落款「收录自训练师的冒险实录」（主题化文案） |
| `03-profile-modal.png` | 档案弹窗：头像 + `Claude Code · v2.1.235` + `Lv.5 短裤小伙` + EXP 条（距 Lv.6 还差 60%）+ 真实统计行（284 场 / 5028.6 万 / 9.4 亿 / 2026-09-27）+ `EXP = 对战 8.2 + 经验 7.7 + 旅程 0.0 + 徽章 2.6` |

**✅ 通过**。附注：`旅程 0.0` 正是问题 3 的连带伤害——since 取了今天的日期，等级公式「工龄」项被清零。

## 6. 隐私自检

```bash
$ pnpm privacy:scan
privacy-scan：已扫描 97 个文本文件（生成物/依赖已豁免）
✔ 通过：未发现硬命中，也无软提醒。
```

**✅ 通过**（exit 0）。附注：作者残留的 `.privacy-allow`（7 个域名豁免）随模板一起带进了我的副本，扫描器静默接受（问题 7）；「个人路径」软规则实现只匹配 `/home/`、`/Users/`，`/root/` 路径完全不检（问题 11）。

## 7. 构建与 badge

```bash
$ pnpm build
[harness-config] 校验通过
✓ 2568 modules transformed.
✓ built in 1.16s          # exit 0

$ ls dist/badges/
diablo.svg  jrpg.svg  pokemon.svg  stardew.svg   # 四主题齐全
```

`dist/badge.svg`（10883 B）与 `dist/badges/pokemon.svg` 字节一致，确认跟随 `site.theme: pokemon`；`dist/favicon.svg`（claude-code 品牌头像）同步生成。

**✅ 通过**。

### 步骤 9 补充：workflow 与 publish.md 一致性核对（未 push）

`.github/workflows/deploy.yml`：push master/main + workflow_dispatch → pnpm/action-setup → Node 22（cache pnpm）→ `pnpm install --no-frozen-lockfile` → `pnpm build` → upload `dist/` → deploy-pages@v4。与 `references/publish.md`「推送到 main 会自动跑仓库自带的 workflow（Node 22 → pnpm build → 上传 dist/ → 部署）」**描述一致** ✅。Publish.md 的「vite base 已按仓库名自动处理」实为 `base: './'` 相对路径方案（效果等同，措辞略失准，不计问题）。

## 8. 问题清单（13 项）

### A 级：阻断或产生错误公开数据（3）

**1. init-harness.mjs 对空目录 `rmSync` 缺 recursive → EISDIR 崩溃（致命阻断）**
`scripts/init-harness.mjs:69`。原文（SKILL.md §5）：「该命令会：清空 `config/content/` 与 `config/icons/`（保留 .gitkeep）」——实际模板各分区目录内只有 .md、无 .gitkeep，清空后目录变空即触发 `ERR_FS_EISDIR` 崩溃，且崩在破坏性操作中途（半清理状态）。作者自己的仓库从未跑过 init，此路径零测试。修复：`rmSync(p, { recursive: true })`（本演练已打）。不改代码无法通过步骤 5。

**2. 采集器 subagentSessions 全量漏计，references 记载的存储路径本身错误**
`references/harnesses/claude-code.md`：「子代理：`~/.claude/projects/<project-dir>/subagents/*.jsonl`」。实际 Claude Code 布局是 `~/.claude/projects/<project-dir>/<session-uuid>/subagents/*.jsonl`（subagents 在会话 uuid 目录下）。脚本 `collectClaudeCode()` 只在 project-dir 直下找 `subagents/`，且遍历 project-dir 时遇任何子目录直接 `continue` 不递归 → 本机 13 个子代理会话全部漏计，报 0。文档与实现错在同一处，零上下文 agent 无法自查发现。

**3. 采集器 since 回退口径与文档不符，产出错误启用日期**
`references/harnesses/claude-code.md`：「`since`：`stats-cache.json` 的 `firstSessionDate`，或最早 jsonl 的 mtime」。实现（collect-stats.mjs）在 stats-cache.json 缺失时回退取 `~/.claude` **目录自身**的 birthtime/mtime——本机得 `2026-09-27`（今天），而实际最早会话 2026-08-29（目录名含 2026-08-26 会话）。错误数据进站后连锁影响等级公式「工龄」项（档案弹窗 `旅程 0.0`）。

### B 级：体验与流程缺陷（4）

**4. 多 harness 冲突检测发生在全量采集之后**
SKILL.md §2：「采集器发现多个 harness 时会 `exit 2` 呈报」——没说呈报发生在把所有已探测 harness 全量解析完之后。本机先花 2m40s 解析完 DSH 487 + Claude Code 284 个会话才报冲突退出；指定单家后 3.9s 完成。应先探测目录存在性、冲突即问，可省 98% 耗时。

**5. 采集全程零进度输出，默认超时的 agent 会被直接杀掉**
同一次裸跑在本工具 60s 默认超时下被 SIGTERM 杀死（采集器无任何阶段输出/进度提示）。大 session 目录机器上，人类与 agent 都无法区分「在跑」与「卡死」。另：冲突提示走 stderr、YAML 走 stdout，混合通道对管道捕获不友好。

**6. `--harness <id>` 参数用法与 id 命名规则文档缺失**
SKILL.md §1 说「检测到多个 harness 时，列出清单让人类选一个」，§2 说「exit 2 呈报，回到第 1 步让人类选」——但选中之后**如何把选择传给采集器**（`--harness claude-code`）只在脚本报错里出现；id 格式（kebab-case）只能从 references 文件名或脚本源码猜测。

**7. 「白板」不白：init 清理范围远小于模板私货范围**
SKILL.md §4 劝阻 fork 的理由是「fork 会带走……原站作者的全部私有内容（配置、正文、文档）」，暗示 template/degit 是干净的——实际 degit 同样带走全部私货（区别仅无 git 历史）。步骤 5 只清 `config/` 与三个标题，以下作者私货全部残留且 SKILL.md 未提示清理：`docs/`（含特性过程文档与 `baseline/` 站点截图）、`AGENTS.md`（含作者机器的开发命令与个人路径）、README **正文**（「展示个人自研的 DSH 插件」+ 原作者 Pages 链接）、`.privacy-allow`（作者域名豁免清单，会让新站的隐私扫描静默放行作者的域名）。零上下文 agent 照文档走会带着这些上线。

### C 级：文档与实际不符 / 小缺陷（6）

**8. 「保留 .gitkeep」描述失实**
SKILL.md §5：「清空 `config/content/` 与 `config/icons/`（保留 .gitkeep）」——模板里没有任何 .gitkeep（`find config -name '.gitkeep'` = 0），且实际清空时分区子目录被连锅删除（find 仅剩 `config/content` 自身），并非「保留目录」。

**9. 图标数量三处对不上**
icons.md：「内置 121 枚精选自 7Soul 496 枚」——常用 id 分组表实际列 **122** 枚，而 `isKitIcon()` 校验的是完整 manifest 的 **496** 枚。三个数字互相矛盾（121/122/496），用户不知道可用集合到底多大。

**10. example.yaml（init 后白板底稿）自带的 section 图标 id 静默兜底**
init 重置后的 `harness.yaml` 引用 `sword`（plugins）、`globe`（mcp）、注释里的 `pickaxe`（tools）——经查 manifest，`sword`/`globe`/`pickaxe`/`puzzle` **都不存在**（存在的是 `sword-1`/`book`/`scroll` 等）。白板默认配置就踩中 icons.md 自己警告的「纯 kit id 拼错则静默兜底，注意别拼错」，validate 不报错，Tab 图标全部兜底渲染。

**11. privacy.md「个人 home 路径」软规则与实现不符**
privacy.md：「软模式（域名、IP、个人 home 路径）」。实现 `HOME_RE = /(?:\/home\/|\/Users\/)([A-Za-z0-9._-]+)/g` **不含 root 家目录**——root 用户环境（agent 容器常态）下该规则形同虚设，模板 AGENTS.md 里的 root 家目录个人路径（.agents/skills/… 等）一概不提醒。

**12. 步骤 3 话术模板要求呈报 version 与昵称，但采集链路不提供**
话术模板：「昵称：`<...>`　版本：`<...>`」——采集器输出只有 brand/since/stats，version 获取方式（`claude --version`）藏在 `references/harnesses/claude-code.md` 的「版本」小节，SKILL.md 本体与话术模板处均无指引；昵称则完全无来源，只能自拟。另：init-harness 明知 `--name "Claude Code"` 却不代入 `brand: claude-code`（白板留 `generic`，需人工再改），也不清理 `version: "1.0.0"` / `since: "2026-01-01"` 占位符——忘了改就带假数据上线。

**13. 「未获确认不得继续第 5 步」编号歧义**
SKILL.md §3：「在写入任何将要公开的数据之前……未获确认不得继续第 5 步。」——第 5 步（init 白板）并不写入公开数据，写入数据的是第 6 步（填充配置）；按闸门意图应拦「5→6」，按字面则拦「4→5」（连获取代码都不许）。两读皆通，编号与意图错位。

### 次要备注（不计数）

- `schema.md` `config` 字段说明「插件给 cordis.yml 片段」是 DSH 视角，其他 harness（如 Claude Code 的 settings.json hooks）无示例指引。
- 每次 node 脚本运行都刷两条 `UNDICI-EHPA` 实验警告（环境代理变量所致，非脚本 bug，但污染所有输出摘录）。
- vite 对 `vite.config.ts` 报 `configLoader: 'native'` 不兼容警告（仓库自身配置问题，不阻断）。
- 截图脚本点同一个已选中物品无任何变化（详情卡加载即预选中首件），对「必须交互才能看详情」的预期不成立——首次截图 1、2 完全相同才发现。

## 9. 最终结论

**零上下文 agent 能否只靠 SKILL.md 独立走通？——不能无修正走通，但只需一处一行级修复即可全程走通。** 本演练验收 7 项全过，前提是给 `init-harness.mjs` 打了 `rmSync` recursive 补丁；除此之外文档驱动完成度相当高（schema/icons/privacy/publish 四份 references 都能独立支撑对应步骤，没有再需要读源码的地方）。

最容易卡住的点（按卡死概率排序）：

1. **步骤 5 init:harness 的 EISDIR 崩溃**——硬阻断。报错栈直指 `init-harness.mjs:69`，一个有调试能力的 agent 能自救（本演练 5 分钟内定位修复），纯执行型 agent 会直接失败。
2. **步骤 2 采集器的超时陷阱**——默认 60s 超时的工具环境里首跑必被杀，且无进度输出无法判断死活；加超时后又要等 2m40s 才拿到「多 harness 冲突」结论，`--harness` 用法还得从报错里挖。能自救但摩擦最大的一段。
3. **「白板不白」的清理死角**——不阻断、不报错，最阴险：README 正文卖着原作者的 DSH 插件、docs/ 带着作者的基线截图、.privacy-allow 放行着作者的域名，agent 照十步流程走完也意识不到。建议 SKILL.md 步骤 5 扩一句「README 正文/docs/AGENTS.md/.privacy-allow 需一并清理或重写」。
4. **静默错误数据**——subagentSessions（漏计）与 since（回退口径错）会带着错值进公开站，且 since 还连锁清零等级公式的工龄项。这两个字段采集器与 references 各错一半，只有交叉验证（如 ccusage）才能发现。

文档本身的十步结构、话术模板、references 快速索引设计都是高质量可执行的；核心病灶是**文档/脚本/模板实发状态三者漂移**——SKILL.md 描述的是理想模板（有 .gitkeep、图标 id 有效、degit 即干净），而实发模板与脚本行为已经走在了文档前面（或落后于文档）。

---

## 附录 A：演练对 /tmp/p8-drill 的全部改动

- `scripts/init-harness.mjs`：问题 1 的一行修复（唯一代码改动）
- `config/harness.yaml`：白板重置后整块重写（采集片段 + 3 sections / 3 items）
- `config/content/{tools,skills,tomes}/{cc-guard,deep-dive,subagent-rebellion}.md`：新增 3 篇正文
- `config/icons/cc-guard.svg`：新增自定义图标
- `public/{badges/*, badge.svg, favicon.svg}`：predev/prebuild 生成物
- `dist/`：构建产物
- `.drill-shots/`：截图 3 张 + 一次性截图脚本 2 个
- git：init 基线提交 1 个（723 files），工作区改动 113 files（+281/−2993）
- 演练后状态：dev server 已关闭，未做任何 push

## 附录 B：init-harness.mjs 修复 diff

```diff
--- a/scripts/init-harness.mjs
+++ b/scripts/init-harness.mjs
@@ -66,7 +66,7 @@
       const p = path.join(d, e.name);
       if (e.isDirectory()) {
         walk(p);
-        if (readdirSync(p).length === 0) rmSync(p);
+        if (readdirSync(p).length === 0) rmSync(p, { recursive: true });
       } else if (e.name !== '.gitkeep') {
```

---

## §10 回修记录（2026-09-27，演练后当日回修）

13 项问题全部处置，模板与主仓同步修复：

| # | 级别 | 修复 |
|---|---|---|
| 1 | A | `init-harness.mjs` 重写：空目录 `rmSync(p, { recursive: true, force: true })` |
| 2 | A | `collect-stats.mjs`：`scanClaudeProjects()` 按 `<session-uuid>/subagents/`（+旧版直挂）计数；`references/harnesses/claude-code.md` 路径同步修正 |
| 3 | A | `collect-stats.mjs`：claude-code since 回退改为最早主会话 jsonl mtime（stats-cache 缺失时）；codex since 改取 rollout 文件名最早日期 |
| 4 | B | 主流程重构为「先快速探测（只数文件）→ 多家 exit 2 立即呈报 → 指定后才全量解析」 |
| 5 | B | 采集全程进度走 stderr（起始行 + 每 25/50 文件心跳）；SKILL.md 写明 stdout/stderr 通道约定 |
| 6 | B | SKILL.md 步骤 2 补 `--harness <id>` 用法、id 命名规则与退出码 |
| 7 | B | `init-harness` 白板范围扩为六件事：+ README/AGENTS ← `scripts/templates/*.tpl`、删 `docs/` 作者文档目录、`.privacy-allow` ← 空模板；SKILL.md 步骤 5 如实描述 |
| 8 | C | 模板 `config/content/<section>/` 与 `config/icons/` 补 6 个 `.gitkeep`，「保留 .gitkeep 与目录结构」由失实变为真实 |
| 9 | C | icons.md / SKILL.md 统一表述：套件 496 枚全量（`#/icons` 可检索），表内精选 121 枚（表实为 121 枚，演练者误数 122） |
| 10 | C | `harness.example.yaml` 图标换真实 kit id：`sword`→`sword-1`、`book`→`book-1`、`globe`→`crystal-1`、`pickaxe`→`metal-1` |
| 11 | C | `privacy-scan.mjs` 新增 `ROOT_RE`：root 家目录下非通用首段（`.agents` 等）软提醒（`projects` 等通用段豁免）；主仓 3 处相应脱敏 |
| 12 | C | `init-harness` 由 `--name` 自动映射 `brand`；SKILL.md 写明 version 获取位置与昵称来源；步骤 5/6 提示占位符替换 |
| 13 | C | 闸门措辞改为「未获确认不得进入第 6 步（填充配置）」 |

次要备注处置：schema.md `config` 字段措辞去 DSH 视角（cordis.yml / settings.json hooks / mcpServers 并列）；UNDICI 代理警告与 vite native configLoader 警告为环境/构建配置问题，留 P9/P10 处理。
