# 我的 DSH 背包 (My DSH Inventory) AGENTS.md

## 目标

模仿《星露谷物语》(Stardew Valley) 背包（Inventory）系统，展示个人自研的 DSH 插件、全域 Agent 技能、MCP 服务器和踩坑经验典籍。
坚持轻量级、零外部重库、纯手绘 16×16 原生像素艺术与 Web Audio 8-bit 声效。

## 地图

- `config/harness.yaml`: 站点唯一事实源（站点信息、harness 档案、sections/物品全量数据），schema 见 `src/config/schema.ts`；`config/harness.example.yaml`: 白板模板（全注释，init-harness 的替换源）
- `config/schemas/<id>.json`: tools section 物品的 inputSchema（标准 JSON Schema，详情卡参数表数据源），由 `scripts/collect-dsh-tools.mjs` 从本机 DSH 安装自动生成
- `tools/`: 字体与品牌资产生成脚本（Python：`prep-pkmn-font.py` 修复 PKMN 字体表+剥空映射；`subset-badge-fonts.py` 重出 badge 子集；`gen-brands.mjs` 品牌头像：simple-icons CC0 像素化 + 手绘字符画）
- `config/content/<section>/<id>.md`: 物品深度解析正文（Markdown）；`config/icons/*.svg`: 自定义 16×16 像素图腾
- `skills/harness-inventory/`: 配套 agent skill（SKILL.md 十步流程 + references/ 配置·隐私·图标·发布·各家 harness 采集指南 + scripts/collect-stats.mjs 统一采集器（dsh/claude-code/codex 全量，其余探测指引；重测后回填 harness.yaml））
- `docs/essays/`: 已归档的长文典籍（不在站内展示）
- `references/content-maintenance.md`: 内容扩展与维护规范（新增装备/Tab/图标的标准流程）
- `LICENSE` / `NOTICE` / `CREDITS.md`: 代码 MIT 许可与第三方资产归属（字体 OFL/MIT 随仓分发、7Soul 图标 CC0，声明位置见 NOTICE）
- `src/config/loader.ts`: 浏览器侧装载（YAML + 正文 glob + IconRef 解析链 custom-svg → custom-img → kit → fallback + harness 档案派生）
- `src/components/ItemIcon.tsx`: 统一图腾渲染器与品质星级徽章
- `src/components/InventoryGrid.tsx`: 36 格豪华背包凹陷槽位网格、筛选栏与悬停预览条
- `src/components/DetailPanel.tsx`: 独立滚动的装备属性卡片、Markdown 深度解析、一键复制安装/配置/schema、工具参数表（object+properties → 行式参数列表 + `<details>` 原始 JSON）
- `src/components/BooksView.tsx`: 秘籍书架与羊皮纸（Parchment）Markdown 阅览器（reader 型 section）
- `src/components/HarnessProfileModal.tsx`: harness 档案弹窗（头像/昵称/Lv/EXP 条/职业/安装日期/统计行 + 分享名片复制）
- `src/components/BadgeView.tsx`: `#/badge` 名片页（四主题预览 + URL/Markdown/HTML 嵌入片段复制）
- `src/theme/vocab.ts`: 主题词汇表（section 展示名、等级称号、品质命名、详情卡章节标题、HUD/空态、阅读器用语全量按主题变化；`fmt()` 占位插值）
- `src/iconkit/`: 内置 7Soul 496 枚 CC0 像素图标套件（`registry.ts` id→文件 + 分组速查；`#/icons` 图鉴页）
- `src/assets/fonts/`: 主题像素字体（DotGothic16/PKMN/Fusion Pixel/Cinzel/Pirata One，许可文本与清单见其 README.md）
- `src/badge/`: 游戏名片纯函数与四主题规格（480×160 SVG；fonts/ 为 ASCII 拉丁字体子集，data-URI 内嵌进 badge）
- `scripts/gen-badges.ts`: badge/favicon 生成器（predev/prebuild 钩子 → `public/badges/*.svg` + `badge.svg`（随 site.theme）+ `favicon.svg`（品牌头像））
- `src/stats/level.ts`: 等级与经验纯函数（对数压缩公式，5 锚点校准，`tests/level.test.ts`）；`src/stats/job.ts`: 职业派生（主导 section → 主题化职业名，平票取配置顺序前，`tests/job.test.ts`）
- `src/brands/`: 品牌 16×16 像素头像（simple-icons CC0 像素化 5 枚 + 手绘字符画 6 枚，`tools/gen-brands.mjs` 生成；generic 兜底）
- `src/audio/retroAudio.ts`: 纯原生 Web Audio API 8-bit 声效合成器（木击、拾取、金币、翻书）
- `src/index.css`: 星露谷调色板、像素微阴影系统与独立滚动条样式
- `src/App.tsx`: 顶层 HUD 框架（左上角色 status：头像/昵称/Lv/称号/迷你 EXP 条，点击开档案；金币/音效/Tab 导航（由 sections 驱动）与 hash 路由）
- `scripts/validate.ts` / `pnpm validate`: 配置校验（schema + 正文/图标引用完整性 + tools inputSchema 覆盖）
- `scripts/collect-dsh-tools.mjs` / `pnpm collect:schemas`: 从本机 DSH 安装（核心包 + 宿主 profile 插件，mock cordis ctx 捕获 defineTool 定义）提取工具 inputSchema → `config/schemas/*.json`；`--check` 只校验覆盖
- `scripts/init-harness.mjs` / `pnpm init:harness`: 白板初始化（清空 config 内容、重置 harness.yaml/package.json name/index.html/README 标题）
- `scripts/privacy-scan.mjs` / `pnpm privacy:scan`: 全仓隐私扫描（硬模式密钥阻断 exit 1，软模式域名/IP/路径警告；豁免清单 `.privacy-allow`）

## 开发与调试

```bash
# 启动本地开发服务 (支持 HMR，配置改动热校验)
pnpm dev --host 0.0.0.0 --port 5180

# 配置校验（改 harness.yaml / content / icons 后必跑；build 也会跑）
pnpm validate

# 从本机 DSH 安装重出工具 inputSchema（tools section 新增/变更工具后跑）
pnpm collect:schemas

# 生产级编译构建与静态类型校验 (新增内容后必跑)
pnpm build

# 预览构建产物
pnpm preview --host 0.0.0.0 --port 5180

# 单测（等级锚点/图标链/词汇表/badge 布局）与 lint
pnpm test && pnpm lint

# 临时公网穿透演示 (开隧道给用户体验)
bash ~/.agents/skills/dev-tunnel/scripts/dev-tunnel.sh 5180
```

## 规范

1. **内容扩展准则**：新增插件/技能/物品 = 在 `config/harness.yaml` 对应 section 加条目 + `config/content/<section>/<id>.md` 写正文 + 需要新图腾时在 `config/icons/` 放 16×16 SVG（或引用 `src/iconkit/` 内置套件 id）。
2. **像素一致性**：杜绝引入外部矢量图标库（如 Lucide、FontAwesome）作为物品道具图腾，一律使用 16×16 像素 SVG 或内置套件。
3. **视口与响应式约束**：
   - PC 端必须保持外层视口固定（`overflow: hidden`），详情与长文各自独立滚动；
   - 移动端格子自适应 6 列，必须保持严格 1:1 几何正方形（`aspect-square`）。
