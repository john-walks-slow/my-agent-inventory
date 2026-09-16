# DSH 资产与经验展示站（DSH Inventory）深度调研报告

**日期**：2026-09-16  
**特性名称**：`dsh-inventory`  
**定位**：将个人开发的 DeepSeek Harness 插件、MCP 服务器、全局技能（Skills）和实战避坑技巧（Books）以游戏背包（Inventory）形态呈现的致敬向像素暖色风格展示站。

---

## 一、 需求理解与痛点剖析

### 1.1 背景与目标
在 DSH（DeepSeek Harness）及 AI Agent 生态下，开发者积累了大量高价值资产：
- 自研的核心插件（如解决长时间后台挂起的 `dsh-wait-subagent`、解决模型自主减负的 `dsh-clear-mind`、支持多渠道的 `@xmanrui/dsh-im`、防沉迷的 `dsh-anti-addiction`、主动跟进的 `dsh-proactive` 等）；
- 丰富的 Agent Skills（如 `coding`、`workflow-*` 系列、`container-ops`、`dev-dsh-plugin`、`camoufox-cli`、`gemini-imagegen` 等）；
- 核心 MCP 服务器与图腾工具（如本地元搜索 `degoog`、抓取工具 `fetch`、长文研读 `notebooklm`、神经网络搜索 `exa`）；
- 极为宝贵的实战调试与架构踩坑笔记（如 DSH 孤儿进程 80% CPU 扫描修复、远程特权解锁鉴权机制、容器 devfs 规范等）。

**传统展示形式的痛点**：
普通的 GitHub 列表或平铺文档站（如 Docusaurus、VitePress）枯燥冰冷，缺乏个性、趣味性与探索欲，不能体现开发者在这些插件与架构上的匠心。

**破局方案**：
借用玩家最熟悉的 **游戏 Inventory（背包）隐喻**，致敬《星露谷物语》（Stardew Valley）的经典像素、暖木与羊皮纸风格。将每一个插件、每一个技能、每一个 MCP 工具作为一件**“装备”或“收集品”**放置在背包槽位中；书籍（Books）则作为专属展开的古籍日记本呈现，配合像素音效和品质星级，让用户在如同探索游戏农场背包的乐趣中了解所有资产。

---

## 二、 本地资产盘点与数据建模

经过对本机实地扫描，梳理出真实饱满的数据集，绝非空洞 demo：

### 2.1 插件背包（Plugins）—— 共 12+ 个核心资产
按功能定位划分 4 个子类别：
1. **Dev & Tooling（开发与调试基建）**：
   - `dsh-wait-subagent` (v1.0.0)：模型级工具，主动阻塞等待后台连续子代理完成，弥补 fire-and-return 与异步通知之间的鸿沟。
   - `dsh-set-model` (v0.1.0)：运行时动态切换模型与思考深度（off/low/high/max），无缝进入 plan 模式。
   - `dsh-patch` (v1.0.0)：针对上游 dsh 的热补丁集（如 0001 孤儿进程退避补丁，解决 CPU 80% 占用）。
   - `linux` (v1.0.0)：底层系统支持扩展与 arm64 架构优化。
2. **Context & Mind（心智与上下文工程）**：
   - `dsh-clear-mind` (v0.1.0)：模型自主上下文压缩引擎，包含 `mind_map` 全局勘测与 `clear_mind` 节点替换。
   - `dsh-mini-memory` (v1.0.0)：超轻量级热记忆持久化与快速投影。
   - `dsh-message-datetime` (v0.1.0)：每轮对话首尾注入高精度时钟，赋予模型物理时间感知与跨轮间隔感知。
3. **Automation & Life（自主跟进与生活演化）**：
   - `dsh-proactive` (v1.0.0)：Host 级定时闹钟与周期性任务唤醒系统，支持静默休眠与 quiet-hours。
   - `dsh-simulated-life` (v0.1.0)：生活上下文与虚拟世界每日因果演化，提供 `life_react` 工具。
   - `dsh-anti-addiction` (v0.1.0)：防沉迷守护系统，限制前台每日使用时长，超额时弹出像素鲸鱼少女遮罩。
   - `dsh-whip` (v1.0.0)：定时注入鼓励与鞭策，保持 Agent 任务推进动能。
4. **Integration & Web（通道集成与网络增强）**：
   - `@xmanrui/dsh-im` (v4.13.0)：连接 9 种 IM 渠道（微信、QQ、Telegram、Discord、Slack等）及公网 AI Office。
   - `dsh-web-transport-trust` (v0.1.0)：注入 host 信任，让 DSH Web 设置在公网域名/隧道下完全可写。
   - `dsh-hybrid-notify` (v0.1.0)：多渠道通知集成，含网页 Toast、PWA 系统通知与音效合成。
   - `dsh-stickers` (v0.2.0)：表情包/Stickers 提示词注入与设置管理。
   - `dsh-mobile-qol` (v0.1.0)：移动端手势滑动、IME 输入法适配、触控反馈等体验优化。
   - `dsh-remote-unlock` (v1.0.0)：DSH 远程配置面安全解锁补丁管理器。

### 2.2 技能图鉴（Skills）—— 共 40+ 个全局特技
划分为 4 大流派：
- **Workflows（标准工作流）**：`workflow-research-plan`, `workflow-implement-review`, `workflow-troubleshoot`, `workflow-manage-tasks`, `workflow-leader`
- **Engineering（极限工程实战）**：`coding`, `commit-own-changes`, `dev-dsh-plugin`, `container-ops`, `restart-dsh`, `chroot-devfs-pitfall`, `dev-tunnel`, `named-cf-tunnel`
- **Agent Intelligence（智能体心智进阶）**：`deep-auto`, `cross-check`, `clear-mind`, `grilling`, `spawn-deep-researcher`, `spawn-reviewer`, `bad-smell`, `unstuck`, `try`
- **Multi-Modal & Tools（多模态与外部神器）**：`gemini-imagegen`, `seedream-imagegen`, `camoufox-cli`, `officecli`, `create-simulated-events`, `update-ive-learned`, `update-yaagb`

### 2.3 神器/图腾（MCP Servers）
- `degoog` (HTTP / 本地混合): 本地元搜索与去重聚合，保护隐私与规避限流。
- `fetch` (Stdio / npx): 大体量单页纯文本与正文智能提纯，突破单行 token 预算。
- `notebooklm` (Stdio / uvx): 深度长文献研读与双向引文对照。
- `exa` (Stdio / 云端): 基于语义嵌入的现代神经网络 Web 搜索与深抓。

### 2.4 遗失之书/经验秘籍（Books / Lost Books）
独具特色的排版呈现，包含以下主题文档：
1. **《DSH 插件开发万全秘法》**（Link 依赖陷阱、Ctx 服务 Inject 声明、Web Client 构建产物）
2. **《深入 80% CPU 孤儿进程排查与退避修复实录》**（针对 Linux `/proc` 扫描导致的系统级卡顿根因与代码级解决）
3. **《容器 Devfs 与虚拟节点安全铁律》**（红米 K30S 手机 chroot 容器环境下 `/dev`、`/proc`、`/sys` 挂载规范）
4. **《Agent 心智模型自主压缩原理》**（`mind_map` 拓扑探测与 `clear_mind` 自我收敛方案）
5. **《DSH Web 远程权限与回环地址伪装秘籍》**（从网络层突破 localhost 限制，安全开启全网配置控制面）
6. **《从零构建即时通信九合一拟人网关》**（长连接、状态同步、消息分段与拟人延迟设计）

---

## 三、 游戏化背包（Inventory）设计与视觉模式

### 3.1 星露谷物语核心美学参数
通过调研官方与社区开源像素艺术资源，梳理如下视觉基准：

| 视觉维度 | 设计参数 | 对应配色与表现 |
| :--- | :--- | :--- |
| **主框架（Frame）** | 双重木纹包边 | 外轮廓深橡木色 `#4A2C11`，内高光棕 `#8F4D20`，内阴影 `#311A0A` |
| **背包背景（Canvas）** | 暖调木板/羊皮纸 | 主背景 `#ECB06C` 或 `#F4BA76`，内衬布/纸底 `#FFEED6` |
| **物品插槽（Slots）** | 凹陷像素框 (Inset Box) | 边框：深色上/左 `#723B18`，高光下/右 `#F7D399`；内底色 `#D89254` |
| **选中高亮（Select）** | 动态浮动金框 | 金光外框 `#FFE74C` / `#FFA500`，4 隅向外跳动的 1px 呼吸光标 |
| **品质星级（Quality）** | 星露谷星级系统 | 无星（Normal）、银星 `#D1D5DB`（Well-tested）、金星 `#F59E0B`（Production）、铱星（紫星）`#A855F7`（SOTA / Legendary） |
| **悬停浮窗（Tooltip）** | 羊皮纸像素气泡 | 背景 `#FCF4E3`，双层边框 `#4A2C11` + `#DDA15E`，文本深巧克力色 `#3D200E` |
| **分类标签页（Tabs）** | 顶部木质书签 | 活动 Tab 凸起并向上连接面板，非活动 Tab 下沉带暗木纹与微灰滤镜 |

### 3.2 布局架构设计
背包分为两大展示模式：

#### 模式 A：经典物品背包（用于 Plugins, Skills, MCP Servers）
- **左侧/上方：背包网格主区（Inventory Matrix）**
  - 分类 Tab 切换栏（🎒 Plugins / ⚡ Skills / 🔮 MCP Servers / 📖 Books）
  - 子分类筛选药水瓶/标签（Filter Chips，如 [全部] [Dev] [Context] [Automation] [Web]）
  - 搜索栏（带有像素放大镜图标的输入框）
  - 经典网格（4 行 × 9 列 或自适应响应式网格），每格放置物品像素图标、角标（版本或能力数）与品质星标。包含未解锁/空槽凹陷位。
- **右侧/下方：物品鉴赏台（Item Inspection Altar）**
  - 选中物品的 2x-4x 像素大图（带微悬浮呼吸动效）
  - 物品全名与稀有度徽章
  - 物品简述与风味文本（Flavor Text，如游戏道具说明）
  - 属性卡（属性值：能力数、依赖环境、运行模式）
  - 装备快捷指令卡（一键复制 `pnpm add ...` / `npm install ...`）
  - 外链按钮（传送门：GitHub 源码、关联文档、演示页面）

#### 模式 B：失落之书与日志视图（Books & Secret Notes）
- 用户特别指出：**“（书籍类别可能和其他类别布局不同）”**。
- **外观**：展开的厚重精装古籍（Ancient Tome）。
- **左页（Contents & Bookmarks）**：
  - 侧边皮革书签条（Bookmark Ribbons），点击直接翻到指定秘籍；
  - 章节列表、阅读预计时长、知识难度等级（初级农夫 / 资深工匠 / 巫师级）。
- **右页（The Parchment Page）**：
  - 逼真的羊皮纸底纹、墨迹手写风格标题、清晰舒适的阅读正文；
  - 像素化代码高亮块（支持一键复制代码与微复古暗色代码背景）；
  - 底部翻页键（[< 上一篇]、[下一篇 >]）与回程书签。

### 3.3 纯原生 Web Audio 像素音效系统
无需网络加载任何 `.wav`/`.mp3`，利用 `window.AudioContext` 合成原汁原味的 8-bit 复古游戏音效：
1. `playSlotHover()`: 极轻柔短促的 600Hz 正弦波微音（15ms）。
2. `playSlotSelect()`: 清脆木质打击声（带频率快速跳变的方波，800Hz → 1200Hz，30ms）。
3. `playTabSwitch()`: 纸张/皮革翻转感（带通滤波白噪声快速扫频）。
4. `playCoinCollect()`: 复制成功时触发的经典双音阶金币叮当声（1046Hz [C6] → 1318Hz [E6]）。
5. `playBookFlip()`: 翻动羊皮纸的沙沙声。
6. 支持右上角全局音效静音按钮（LocalStorage 记忆）。

---

## 四、 技术架构与选型结论

1. **构建与运行环境**：
   - Vite 5 + React 18 + TypeScript；
   - 保证极快构建、热更新以及零外部服务器依赖；
   - 可以通过 `pnpm build` 直接打包出高质量静态单页产物，支持部署到任何静态托管平台（GitHub Pages, Cloudflare Pages, 本机 DSH 静态挂载）。
2. **样式方案**：
   - Tailwind CSS 用于现代响应式布局、Flexbox/Grid 排版与微调；
   - 配合专有的 `pixel-craft.css` 核心样式库：
     - 实现星露谷原版 9-slice 效果或纯 CSS 盒阴影多层像素边框（无需复杂切图，缩放不失真）；
     - `image-rendering: pixelated` 确保所有像素图标在任意 DPI 屏幕下绝对锐利；
     - 自带 Google Pixel 字体与系统复古等宽备用字体回退栈。
3. **数据管理**：
   - 声明式强类型数据中心（`src/data/`），分离数据与表现；
   - 包含完整的插件数据、技能数据、MCP 数据与书籍 Markdown/HTML 内容；
   - 提供搜索过滤、多标签组合筛选纯函数，保证极致流畅（0 卡顿响应）。
4. **移动端与自适应支持**：
   - 考虑用户通过手机（如红米 K30S）或平板查看，支持桌面端双栏/宽背包与移动端自适应抽屉式查看。

---

## 五、 调研结论
方案完备，素材丰沛，视觉基调与游戏隐喻高度契合，技术路线清晰稳健。立即进入下一步，产出详细的 Plan 实施方案。
