# 内容扩展与维护规范 (Content Maintenance Guide)

向背包新增插件、技能、MCP、工具、典籍条目的标准流程。fork 全流程（采集/发布/badge）见 [skills/harness-inventory/SKILL.md](../skills/harness-inventory/SKILL.md)；字段文档见 [skills/harness-inventory/references/schema.md](../skills/harness-inventory/references/schema.md)。

## 1. 新增一件装备（三步）

```bash
# ① config/harness.yaml 对应 section 的 items 末尾加条目（字段见 schema.md）
# ② 写正文：config/content/<section>/<id>.md（Markdown 全支持）
# ③ 图标（可选）：引用内置套件 id，或 config/icons/ 放 16×16 SVG
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

- **内置套件**（496 枚，7Soul CC0）：站内 `#/icons` 图鉴页检索；常用 121 枚速查表见 [references/icons.md](../skills/harness-inventory/references/icons.md)
- **自定义**：`config/icons/<name>.svg`，16×16 手绘像素风（禁止引入 Lucide/FontAwesome 等矢量库）
- ⚠ kit id 拼错**静默兜底不报错**；引用了不存在的自定义文件名才会被 validate 抓住

## 3b. 工具 inputSchema（tools section 专属）

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
