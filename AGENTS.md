# 我的 DSH 背包 (My DSH Inventory) AGENTS.md

## 目标

模仿《星露谷物语》(Stardew Valley) 背包（Inventory）系统，展示个人自研的 DSH 插件、全域 Agent 技能、MCP 服务器和踩坑经验典籍。
坚持轻量级、零外部重库、纯手绘 16×16 原生像素艺术与 Web Audio 8-bit 声效。

## 地图

- `src/data/inventoryData.ts`: 核心静态数据源（插件、技能、MCP、典籍全量数据）
- `src/components/PixelArtIcon.tsx`: 16×16 纯手绘 SVG 像素道具图腾库与品质星级徽章
- `src/components/InventoryGrid.tsx`: 36 格豪华背包凹陷槽位网格、筛选栏与悬停预览条
- `src/components/DetailPanel.tsx`: 独立滚动的装备属性卡片、痛点亮点、一键复制安装命令
- `src/components/BooksView.tsx`: 书架与羊皮纸（Parchment）Markdown 深度长文阅览器
- `src/audio/retroAudio.ts`: 纯原生 Web Audio API 8-bit 声效合成器（木击、拾取、金币、翻书）
- `src/index.css`: 星露谷调色板、像素微阴影系统与独立滚动条样式
- `src/App.tsx`: 顶层 HUD 框架、Tab 导航与农场主档案彩蛋
- `references/content-maintenance.md`: 以后新增插件/技能/典籍/图标的规范指南

## 开发与调试

```bash
# 启动本地开发服务 (支持 HMR)
pnpm dev --host 0.0.0.0 --port 5180

# 生产级编译构建与静态类型校验 (新增内容后必跑)
pnpm build

# 预览构建产物
pnpm preview --host 0.0.0.0 --port 5180

# 临时公网穿透演示 (开隧道给用户体验)
bash /root/.agents/skills/dev-tunnel/scripts/dev-tunnel.sh 5180
```

## 规范

1. **内容扩展准则**：任何新增插件、技能或文章，必须遵循 `references/content-maintenance.md`。
2. **像素一致性**：杜绝引入外部矢量图标库（如 Lucide、FontAwesome）作为物品道具图腾，一律在 `PixelArtIcon.tsx` 编写 16×16 纯像素图形。
3. **视口与响应式约束**：
   - PC 端必须保持外层视口固定（`overflow: hidden`），详情与长文各自独立滚动；
   - 移动端格子自适应 6 列，必须保持严格 1:1 几何正方形（`aspect-square`）。
