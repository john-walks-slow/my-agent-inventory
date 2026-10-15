# My Agent Inventory

以游戏背包形式展示你的 Agent 配置，并获取 profile badge。

**演示**：

[![harness badge](https://john-walks-slow.github.io/my-agent-inventory/badges/stardew.svg)](https://john-walks-slow.github.io/my-agent-inventory/)

---

## 🤖 制作你的背包

将以下提示词复制给你的 Agent 即可完成全部配置：

```
请使用 npx degit john-walks-slow/my-agent-inventory my-agent-inventory 获取模板并进入目录。
完整阅读仓库自带的 skills/harness-inventory/SKILL.md，按其中的规范流程为我们搭建专属的装备背包展示站：
1. 自动采集本机的真实使用统计与技能/插件装备；
2. 与我汇报并确认后，完成白板初始化与配置填充；
3. 启动本地开发预览供我验收。
```

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
