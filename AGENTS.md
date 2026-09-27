# 我的 DSH 背包 (My DSH Inventory) AGENTS.md

## 目标

模仿《星露谷物语》(Stardew Valley) 背包（Inventory）系统，展示个人自研的 DSH 插件、全域 Agent 技能、MCP 服务器和踩坑经验典籍。
坚持轻量级、零外部重库、纯手绘 16×16 原生像素艺术与 Web Audio 8-bit 声效。

## 地图

- `config/harness.yaml`: 站点唯一事实源（站点信息、harness 档案、sections/物品全量数据），schema 见 `src/config/schema.ts`
- `config/content/<section>/<id>.md`: 物品深度解析正文（Markdown）；`config/icons/*.svg`: 自定义 16×16 像素图腾
- `docs/essays/`: 已归档的长文典籍（不在站内展示）
- `src/config/loader.ts`: 浏览器侧装载（YAML + 正文 glob + IconRef 解析链 custom-svg → custom-img → kit → fallback + harness 档案派生）
- `src/components/ItemIcon.tsx`: 统一图腾渲染器与品质星级徽章
- `src/components/InventoryGrid.tsx`: 36 格豪华背包凹陷槽位网格、筛选栏与悬停预览条
- `src/components/DetailPanel.tsx`: 独立滚动的装备属性卡片、Markdown 深度解析、一键复制安装/配置
- `src/components/BooksView.tsx`: 秘籍书架与羊皮纸（Parchment）Markdown 阅览器（reader 型 section）
- `src/components/HarnessProfileModal.tsx`: harness 档案弹窗（头像/昵称/Lv/EXP 条/统计行）
- `src/theme/vocab.ts`: 主题词汇表（section 展示名、等级称号、品质命名、详情卡章节标题、HUD/空态、阅读器用语全量按主题变化；`fmt()` 占位插值）
- `src/iconkit/`: 内置 7Soul 496 枚 CC0 像素图标套件（`registry.ts` id→文件 + 分组速查；`#/icons` 图鉴页）
- `src/assets/fonts/`: 主题像素字体（DotGothic16/PKMN/Fusion Pixel/Cinzel/Pirata One，许可文本与清单见其 README.md）
- `src/stats/level.ts`: 等级与经验纯函数（对数压缩公式，5 锚点校准，`tests/level.test.ts`）
- `src/brands/`: 品牌 16×16 像素头像（`tools/gen-brands.mjs` 字符画生成；dsh/claude-code/... /generic 兜底）
- `src/audio/retroAudio.ts`: 纯原生 Web Audio API 8-bit 声效合成器（木击、拾取、金币、翻书）
- `src/index.css`: 星露谷调色板、像素微阴影系统与独立滚动条样式
- `src/App.tsx`: 顶层 HUD 框架（Lv 徽章/金币/音效/档案入口）、Tab 导航（由 sections 驱动）与 hash 路由
- `scripts/validate.ts` / `pnpm validate`: 配置校验（schema + 正文/图标引用完整性）
- `scripts/collect-dsh-stats.mjs`: DSH 会话统计采集器（root/subagent 会话数、非缓存 Token、since 核实；重测后回填 harness.yaml）

## 开发与调试

```bash
# 启动本地开发服务 (支持 HMR，配置改动热校验)
pnpm dev --host 0.0.0.0 --port 5180

# 配置校验（改 harness.yaml / content / icons 后必跑；build 也会跑）
pnpm validate

# 生产级编译构建与静态类型校验 (新增内容后必跑)
pnpm build

# 预览构建产物
pnpm preview --host 0.0.0.0 --port 5180

# 临时公网穿透演示 (开隧道给用户体验)
bash /root/.agents/skills/dev-tunnel/scripts/dev-tunnel.sh 5180
```

## 规范

1. **内容扩展准则**：新增插件/技能/物品 = 在 `config/harness.yaml` 对应 section 加条目 + `config/content/<section>/<id>.md` 写正文 + 需要新图腾时在 `config/icons/` 放 16×16 SVG（或引用 `src/iconkit/` 内置套件 id）。
2. **像素一致性**：杜绝引入外部矢量图标库（如 Lucide、FontAwesome）作为物品道具图腾，一律使用 16×16 像素 SVG 或内置套件。
3. **视口与响应式约束**：
   - PC 端必须保持外层视口固定（`overflow: hidden`），详情与长文各自独立滚动；
   - 移动端格子自适应 6 列，必须保持严格 1:1 几何正方形（`aspect-square`）。
