# My Harness Inventory 🎒

> 为你的 AI Agent 打造的复古像素风装备背包与能力档案库。
> 任何 AI Agent / Coding Harness（DeepSeek Harness、Claude Code、Codex CLI、Gemini CLI 等）均可一键搭建属于自己的专属背包。

🌐 **在线演示**：[https://john-walks-slow.github.io/my-harness-inventory/](https://john-walks-slow.github.io/my-harness-inventory/)

---

## ✨ 核心特性

- 🎒 **36 格经典背包系统**：高辨识度像素槽位、品质边框与星级、分类胶囊过滤、全文检索与悬停预览。
- 📜 **能力与装备属性卡**：支持完整 Markdown 正文、配置代码块一键复制、工具参数表结构化解析。
- 👤 **Harness 档案与等级体系**：记录启用日期、会话数与 Token 吞吐，内置对数压缩的平滑等级公式与称号阶梯。
- 🎨 **四套风格主题**：
  - `stardew`（像素田园）
  - `pokemon`（复古掌机）
  - `jrpg`（经典奇幻）
  - `diablo`（暗黑地牢）
  配色、像素字体、音色及全套展示文案均随主题动态切换。
- 🪪 **矢量游戏名片 Badge**：自动生成 480×160 纯 SVG 游戏名片，站内 `#/badge` 提供 Markdown / HTML 嵌入代码，随时贴入 GitHub 个人主页与项目文档。
- 🖼️ **全链路头像与 496 枚 CC0 图标**：
  - 官方内置 4 款精美娘化像素头像（`deepseek` / `claude` / `codex` / `gemini`）；
  - 支持放入自备 SVG 与 PNG 图片，亦可通过 `pnpm gen:avatar` 快速转换导入；
  - 缺省未指定时，自动根据 Harness 名字生成专属 16×16 点阵像素字头像兜底；
  - 内置 496 枚 7Soul CC0 经典像素道具图腾，站内 `#/icons` 支持全量图鉴在线速查。
- 🎵 **纯原生 8-bit 声效**：采用 Web Audio API 即时合成木击、拾取、翻书、金币音效，零额外音频资源消耗。
- 🔒 **内置隐私护栏**：随仓附带 `pnpm privacy:scan`，多层防护检测敏感凭据、私有路径与密钥，避免误带私货入库。

---

## 🚀 5 分钟制作属于你的背包

本仓库已作为开箱即用的白板模板，推荐直接使用模版或 `degit` 初始化：

```bash
# 1. 抓取干净白板（无历史 Git 提交记录）
npx degit john-walks-slow/my-harness-inventory my-harness-inventory

# 2. 进入项目并安装依赖
cd my-harness-inventory
pnpm install

# 3. 初始化你的专属背包（自动生成基础配置）
pnpm init:harness --name "Claude Code" --title "我的 Agent 背包" --theme pokemon --yes

# 4. 启动本地开发预览
pnpm dev
```

启动后在浏览器打开 `http://localhost:5180` 即可实时预览。

---

## ⚙️ 配置说明

整站由 `config/harness.yaml` 作为唯一事实源驱动，修改后由 Vite 即时热更新与类型校验。

### 1. 站点基础设置 (`site`)

```yaml
site:
  title: 我的 Agent 背包       # 页面标题 / 浏览器标签
  subtitle: Agent 技能与能力库  # 页面副标题
  theme: stardew              # 主题：stardew | pokemon | jrpg | diablo
```

### 2. 档案与头像 (`harness`)

```yaml
harness:
  name: Claude Code           # 必填，Harness 全名
  nickname: 智能助理           # 可选昵称，用于 HUD 与名片展示
  # 头像支持三种模式：
  # 1. 官方预置：deepseek / claude / codex / gemini
  # 2. 自定义图片：config/icons/<name>.(svg|png)，填对应名字即可
  # 3. 缺省或未命中：系统自动提取 name 生成 16×16 点阵像素字头像
  avatar: claude
  version: '1.0.0'            # 版本号（建议加引号）
  since: '2026-01-01'         # 启用日期 YYYY-MM-DD（参与工龄计算）
  stats:
    sessions: 120             # 主会话总数
    tokens: 58000000          # 累计 Token 消耗
  # level: 15                 # 可选显式锁定等级；缺省由公式自动换算
```

> **小提示**：如果想导入自己的 PNG / SVG 作为头像，运行 `pnpm gen:avatar ./my-avatar.png`，它会自动放置在 `config/icons/` 并提示配置方法。

### 3. 分区与装备 (`sections` & `items`)

```yaml
sections:
  - id: plugins               # 分区唯一标识
    label: 扩展插件            # Tab 标签名（缺省使用主题词汇）
    icon: metal-1             # 对应 iconkit 套件 id 或 config/icons 自定义图标
    categories:               # 可选筛选胶囊
      - { id: core, label: 核心能力 }
    items:
      - id: web-search        # 装备唯一 ID，对应正文 config/content/plugins/web-search.md
        name: Web Search      # 显示名称
        title: 深度网络搜索器  # 中文副标题/称号
        icon: crystal-1       # 道具图标
        rarity: gold          # 品质星级：common | silver | gold | iridium
        category: core        # 所属分类
        description: 实时联网检索信息能力
        highlights:           # 亮点要点
          - 多引擎智能聚合
          - 隐私脱敏过滤
        install: |            # 安装/启用命令（可选）
          npm install -g agent-plugin-search
        config: |             # 配置示例（可选）
          search:
            engine: auto
```

---

## 🛠️ 常用开发命令

| 命令 | 用途 |
|---|---|
| `pnpm dev` | 启动本地开发服务器（支持 HMR 与配置即时校验） |
| `pnpm build` | 静态编译构建（含 TypeScript 类型检查、配置校验、名片生成） |
| `pnpm preview` | 预览生产打包产物 |
| `pnpm test` | 执行全套轻量单元测试（等级算法、图标解析链、词汇表） |
| `pnpm validate` | 独立校验 `config/harness.yaml` 与正文、图标引用的完整性 |
| `pnpm gen:avatar` | 快速导入或生成 16×16 像素头像（支持 PNG / SVG / 字符排版） |
| `pnpm privacy:scan` | 全仓隐私敏感信息扫描（发布前硬命中安全阻断） |

---

## 🚢 部署到 GitHub Pages

1. 将仓库推送到你的 GitHub：
   ```bash
   git remote set-url origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin master
   ```
2. 进入 GitHub 仓库设置：**Settings** → **Pages** → **Build and deployment** → **Source** 选择 **GitHub Actions**。
3. 推送 `master` 分支后，内置工作流将自动执行质检、静态编译并发布。
4. 部署成功后，即可在 `https://<your-username>.github.io/<your-repo>/` 访问你的背包，或在 `#/badge` 页面获取可在任何地方嵌入的个人专属名片！

---

## 📄 许可与开源致谢

- 核心代码遵循 [MIT 许可证](./LICENSE)。
- 像素图腾资产取自 **7Soul** 经典像素图标套件，遵循 **CC0 1.0 Universal** 公共领域许可。
- 像素字体清单与开源许可详情见 [src/assets/fonts/README.md](./src/assets/fonts/README.md)。
- 第三方归属声明见 [NOTICE](./NOTICE) 与 [CREDITS.md](./CREDITS.md)。
