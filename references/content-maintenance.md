# 内容扩展与维护规范 (Content Maintenance Guide)

向背包新增插件、技能、MCP、工具、典籍条目的标准流程。fork 全流程（采集/发布/badge）见 [skills/harness-inventory/SKILL.md](../skills/harness-inventory/SKILL.md)；字段文档见 [skills/harness-inventory/references/schema.md](../skills/harness-inventory/references/schema.md)。

## 1. 新增一件装备（三步）

```bash
# ① config/harness.yaml 对应 section 的 items 末尾加条目（字段见 schema.md）
# ② 写正文：config/content/<section>/<id>.md（Markdown 全支持）
# ③ 图标（可选）：引用内置套件 id（本站全部图腾统一走套件，config/icons/ 留空）
pnpm validate && pnpm dev   # 校验 + 预览
```

要点：

- `id` 在 section 内唯一，且**决定正文文件名** `config/content/<section>/<id>.md`
- `category` 必须先在本 section 的 `categories` 中定义，否则 validate 报错
- `install` 只给插件 / MCP / 有仓库的 skill 填（详情卡渲染命令块 + 复制按钮）；纯技能类条目留空
- `rarity` 决定品质边框与星级：`common` / `rare` / `epic` / `legendary`
- `section.label` 缺省时用主题词汇表默认名（四主题各自本地化），需要特殊命名时才显式填

## 2. 新增一个 Tab（section）

`sections` 数组加一项：`id`（唯一）+ `icon` + `view: grid | reader`。grid = 背包格子；reader = 典籍书架（适合长文/规则）。Tab 顺序即数组顺序。

## 3. 图标

解析链 `config/icons/<icon>.svg → .png → 内置套件 id → 兜底`：

- **内置套件**（496 枚，7Soul CC0）：站内 `#/icons` 图鉴页检索；常用 121 枚速查表见 [references/icons.md](../skills/harness-inventory/references/icons.md)。**本站全部图腾都用它，`config/icons/` 留空**
- **自定义**（当前未使用）：`config/icons/<name>.svg`，16×16 手绘像素风（禁止引入 Lucide/FontAwesome 等矢量库）
- ⚠ kit id 拼错**静默兜底不报错**；引用了不存在的自定义文件名才会被 validate 抓住

## 3a. 正文同步（从本机文件复制，勿手抄）

```bash
pnpm sync:content            # dry run：列出每个文件将发生的字节变化
pnpm sync:content -- --write # 落盘
```

源：`~/.agents/skills/<name>/SKILL.md`、`~/projects/<plugin>/README.md`、`~/.dsh/AGENTS.md`（按小节切分入 tomes）。
脱敏规则分两层：**通用形态**（内网段、home 绝对路径、UUID）写死在 `scripts/sync-content.mjs`，可安全入库；**本机专属值**（真实域名、口令、隧道 ID 前缀）放仓库根目录 `sync-redactions.json`（已 gitignore，格式见 `sync-redactions.example.json`）。新增敏感形态时按这个分界决定放哪层——放进库文件就等于公开。改完跑 `pnpm privacy:scan` 确认零命中。
隐私条目的**加锁**是 UI 层开关（`private: true`），不等于从仓库移除内容——真要保密必须靠脱敏或不入库。

## 3b. 正文链接与图片（相对路径必须改写）

正文从各仓 README 原样同步，里面的图片/链接多是相对路径；站内渲染没有 base 重写，相对路径会解析到本站域名下 → 图片全挂、链接 404。规则：**凡条目在 harness.yaml 里有 `repo` 字段，其正文中的相对引用一律改写为源仓绝对地址**——图片 → `raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>`，链接 → `github.com/<owner>/<repo>/blob/HEAD/<path>`（用 HEAD 免维护各仓默认分支名）。

```bash
pnpm content-urls:fix    # 改写 config/content 里所有源仓正文的相对引用（幂等）
pnpm content-urls:check  # 只检查：有残留相对引用 exit 1（已进 CI 与部署质检，拦得住）
```

每次 `pnpm sync:content -- --write` 之后必跑一次 `fix`（sync 脚本结尾也会提醒）。没有 `repo` 字段的正文（典籍、本地 skill）不在处理范围；正文里的示例假路径（以 `/` 开头、含 `< >`）脚本会跳过。

## 3c. 工具 inputSchema（tools section 专属）

`config/schemas/<id>.json` 存标准 JSON Schema（`type: object` + `properties`），详情卡自动渲染参数表（参数/类型/必填/说明）+ 原始 JSON 折叠块 + 复制按钮。由本机 DSH 安装自动生成，不手写：

```bash
pnpm collect:schemas           # 重出全部（幂等，未变的文件不动）
pnpm collect:schemas -- --check  # 只校验覆盖不写文件
```

新增工具条目后跑一次即可；`pnpm validate` 会校验 tools section 每个 id 的 schema 覆盖与形态。

## 4. harness 档案与统计

- 档案字段（昵称/版本/since/brand）直接改 `config/harness.yaml` 的 `harness:` 块
- 统计重测：`node skills/harness-inventory/scripts/collect-stats.mjs --harness dsh` → 输出片段回填 `stats:`
- 等级由公式自动计算（锚点表见 README）；不认可时 `harness.level` 显式覆盖
- 新增主题无需改代码：`site.theme` 四选一，词汇表在 `src/theme/vocab.ts`

## 5. 校验与构建

```bash
pnpm validate   # schema + id 唯一性 + category 引用 + 正文/图标完整性（缺正文是警告不阻断）
pnpm build      # 类型检查 + 配置校验 + badge/favicon 再生成（public/badges/）
pnpm test       # 等级锚点 / 图标解析链 / 词汇表 / badge 布局
pnpm privacy:scan  # 新内容涉及域名/路径时必跑
```

badge 与 favicon 是构建产物（`predev`/`prebuild` 钩子自动生成），不要手改 `public/badges/`。

## 6. 提交

```bash
git add config/harness.yaml config/content/<section>/<id>.md
git commit -m "feat(content): add <name>"
```

发布（push）前跑一次 `pnpm privacy:scan`；涉及外部链接的条目优先用占位符或公共域名。
