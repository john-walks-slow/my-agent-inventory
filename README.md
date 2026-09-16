# 我的 DSH 背包 (My DSH Inventory) 🎒

> 模仿《星露谷物语》(Stardew Valley) 背包系统，展示个人自研的 DSH 插件、全域 Agent 技能、MCP 服务器和实战避坑经验典籍。

🌐 **在线体验 (GitHub Pages)**: [https://john-walks-slow.github.io/my-dsh-inventory/](https://john-walks-slow.github.io/my-dsh-inventory/)

---

## ✨ 核心特性

- 🎨 **纯正星露谷像素美学**：
  - 提取自原版实机截屏的暖木调色板（`#4a2113`, `#e6a763`, `#fff6e0` 等）；
  - 沉稳细腻的 1-2px 像素点阵边框与凹陷格子质感；
  - 离线打包 DotGothic16 / Silkscreen 像素点阵字体。
- 🖌️ **16×16 原生手绘像素图腾**：
  - 时光沙漏、纯净心灵水晶、黄金圣盾密钥、霹雳电弧、矮人极客终端等专属道具；
  - 严格还原银星、金星与**紫辉铱星（Iridium ★）**品质星标。
- 🎒 **36 格标准背包网格**：
  - PC 端 12 列、移动端 6 列自适应，强制保持严格 1:1 几何正方形；
  - 支持多级子类别筛选胶囊与实时全文检索；
  - 格子紧凑置顶对齐。
- 📜 **双向联动详情面板**：
  - 痛点背景、核心亮点、深度解析与配置示例；
  - 一键复制安装命令；
  - 一键跳转至关联实战典籍。
- 📖 **Books 实战典籍阅览器**：
  - 专属书架目录 + 羊皮纸（Parchment）Markdown 阅读器；
  - 包含多篇真实踩坑长文（如孤儿进程 80% CPU 排查、Devfs 架构避坑等）。
- 🎵 **8-bit Web Audio 原生声效引擎**：
  - 格子悬停轻击、拾取清脆声、Tab 切换和弦、金币双重铃声与翻书白噪声。

---

## 🛠️ 本地开发与构建

```bash
# 安装依赖
pnpm install

# 启动本地开发服务 (支持 HMR)
pnpm dev

# 生产环境编译构建
pnpm build

# 本地预览产物
pnpm preview
```

---

## 📖 扩展与维护

新增插件、技能、MCP、典籍或像素图标，请参阅：
- [项目指引 (AGENTS.md)](./AGENTS.md)
- [内容扩展规范 (references/content-maintenance.md)](./references/content-maintenance.md)
