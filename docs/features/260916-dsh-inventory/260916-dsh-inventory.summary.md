# 需求交付总结：星露谷物语风格 DSH 装备背包与经验库

## 1. 业务背景与用户意图
用户希望开发一个展示个人开发的 DSH 插件、Agent 技能、MCP 服务器和实战避坑技巧的个人展示网站。
整体视觉与交互要求深度致敬《星露谷物语》(Stardew Valley) 的游戏背包（Inventory）系统：
- 暖色木质调色板、9-slice 像素边框、凹陷质感物品槽位；
- 支持父分类（DSH 插件 / Agent 技能 / MCP / 实战秘籍）与子分类多维度筛选；
- 物品详情面板：版本、品质星级（普通/银/金/铱星）、核心亮点、一键复制安装指令、配置示例；
- Books 专属书卷/羊皮纸阅览器：沉浸式 Markdown 长文展示，代码高亮与元数据导航；
- 原生 8-bit Web Audio 声效交互；
- 农场主个人档案与收成金币彩蛋。

---

## 2. 核心架构与落地细节

1. **视觉系统 (Pixel UI Engine)**:
   - 提取自星露谷实机截图的原生调色板（`#5b2b2a`, `#853605`, `#d68f54`, `#ffc376`, `#ffe4a1` 等）；
   - 采用 SVG 九宫格矢量图切片实现的 `.sdv-box` 像素相框；
   - 纯 CSS `box-shadow` 内嵌阴影模拟出的 36 槽位凹陷格子（.sdv-slot）与高光边；
   - 内置 DotGothic16 / Silkscreen / VT323 离线像素字体。

2. **原生复古声效合成器 (`retroAudio`)**:
   - 纯浏览器原生 Web Audio API 合成，零外部音频体积依赖；
   - 悬停木击声、物品抓取清脆音、Tab 切换和弦、金币双重清脆铃声、翻书白噪声。

3. **全量生产级数据接入**:
   - **8 个 DSH 核心插件**：`dsh-wait-subagent`, `dsh-clear-mind`, `dsh-web-transport-trust`, `dsh-proactive`, `dsh-set-model`, `dsh-simulated-life` 等；
   - **6 个旗舰级技能**：`container-ops` (Devfs 铁律), `workflow-implement-review`, `dev-dsh-plugin`, `camoufox-cli`, `code-deep-dive` 等；
   - **3 个主流 MCP 服务器**：`degoog` 聚合元搜索、`exa` 神经语义搜索、`notebooklm` 百万知识库；
   - **4 篇万字级实战避坑秘籍**：孤儿进程 80% CPU 排查、容器 Devfs 架构避坑、Agent 上下文自主蒸馏心法、Cloudflare 命名隧道打通方案。

4. **代码质量与审查**:
   - 通过 `reviewer` 子代理进行专业代码审查，根据建议彻底修复了文字选择、HTTP 剪贴板复制降级、Tailwind 样式类等问题。
   - 静态 TypeScript 严格类型检查通过，Puppeteer 端到端交互与无头渲染测试 100% 通过。

---

## 3. 主要产出文件

- 主体界面：`src/App.tsx`
- 网格组件：`src/components/InventoryGrid.tsx`
- 详情面板：`src/components/DetailPanel.tsx`
- 书架与羊皮纸阅览器：`src/components/BooksView.tsx`
- 像素图标与星级徽章：`src/components/PixelIcon.tsx`
- 8-bit 声效引擎：`src/audio/retroAudio.ts`
- 像素 UI 样式核心：`src/index.css`
- 核心数据库：`src/data/inventoryData.ts`
- 审查报告：`docs/features/260916-dsh-inventory/260916-dsh-inventory.review.md`
