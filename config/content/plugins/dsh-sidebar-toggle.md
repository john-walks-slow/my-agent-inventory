# dsh-sidebar-toggle

<p align="center">
  <a href="./README.md"><strong>简体中文</strong></a> ·
  <a href="./README.en.md"><strong>English</strong></a>
</p>

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web GUI 提供侧边栏分组模式的快捷切换：无需展开视图选项菜单，通过 **`Alt+R` 快捷键**或**直接点击侧边栏分组标题**（`会话` / `工作区` / `Sessions` / `Workspaces`），即可在**按工作区分组**（`workspace`）与**平铺会话列表**（`flat`）之间一键来回切换。

## 功能与交互

1. **全局快捷键 `Alt+R`**：
   - 在页面任意位置按下 `Alt+R` 即可切换侧边栏分组模式（`workspace` ↔ `flat`）。
   - 自动避让输入法组合输入状态（`e.isComposing || e.keyCode === 229`），不影响中文等 IME 选词。
2. **点击侧边栏分组标题**：
   - 为侧边栏顶部标题文本（`[class*="sectionHeader"] [class*="sectionLabel"]`，即中文界面的「会话」/「工作区」或英文界面的 `Sessions` / `Workspaces`）注入手型指针（`cursor: pointer`）与悬停透明度反馈（`hover: opacity: 0.8`）。
   - 单击标题文本即刻切换分组视图（若标题处于隐藏态 `sectionLabelHidden` 则忽略点击）。

每次切换时，插件调用宿主 `sidebar.workspaces` 槽位的原生 `setGroupBy` action，并在浏览器控制台输出一行状态日志：

```text
[dsh-sidebar-toggle] groupBy: workspace -> flat
[dsh-sidebar-toggle] groupBy: flat -> workspace
```

## 安装

从 npm 安装（预构建，免额外配置）：

```bash
dsh plugin --profile web add dsh-sidebar-toggle
```

安装后无需手动修改配置文件，插件自带的 `cordis.patch.yml` 会自动挂载生效；刷新 Web 页面即可使用。

从 GitHub 直装（源码安装，包内含 `prepare` 构建脚本，pnpm ≥ 10 首次安装需放行构建）：

```bash
dsh plugin --profile web add github:john-walks-slow/dsh-sidebar-toggle
# 若 pnpm 拦截构建脚本，按提示执行 pnpm approve-builds 或将 dsh-sidebar-toggle
# 加入 ~/.dsh/profiles/web/pnpm-workspace.yaml 的 allowBuilds / onlyBuiltDependencies 后重跑
```

## 权限与兼容

- **纯客户端插件**：Host 侧 `apply` 为空实现，**零 npm 运行时依赖**；全部交互逻辑在浏览器端（`lib/client.js`）运行。
- **零外部权限**：无外部服务、无网络请求、无本地文件系统读写、不读取任何会话内容。
- **复用宿主原生状态**：通过 Cordis `slots` 服务解析 `sidebar.workspaces` 槽位的 `WorkspaceViewStoreHandle`，直接调用宿主原生的 `getSnapshot().groupBy` 与 `actions.setGroupBy()`，与侧边栏自带的视图切换菜单完全同步。
- **卸载与热重载干净**：通过 `ctx.effect` 与 `window.__dshSidebarToggle.dispose()` 管理生命周期，插件停用或重载时自动移除键盘/点击事件监听与注入的 `<style>` 节点。
- **降级安全**：所有 store 解析均由 `try/catch` 保护；若宿主侧边栏尚未挂载或结构变化，操作静默空转，绝不阻断页面。

## 本地开发

```bash
npm run build     # 由 src/client.js 包装生成 lib/client.js 并对 lib/index.js、lib/client.js 执行语法校验
```

本地以 `link:` 方式接入 web profile 调试：

```bash
dsh plugin --profile web add link:/path/to/dsh-sidebar-toggle
```

## 发新版

改动入库后一条命令完成版本号递增与打包（`npm version` 会自动 commit 并打 tag）：

```bash
npm run release        # patch；较大更新改用：npm version minor 或 major
```

然后指纹发布并推送：

```bash
node ~/.agents/skills/npm-publish/scripts/publish-webauthn.cjs /tmp/dsh-sidebar-toggle-<新版>.tgz
git push --follow-tags
```

发布后用 `npm view dsh-sidebar-toggle version` 复验。

## License

MIT

## 社区

- 感谢 [LINUX DO](https://linux.do/) 社区提供的交流环境。
