# 检视报告

## 概要

本次检视覆盖星露谷风格 DSH 装备背包展示站全部源码（9 个源文件 + 构建配置），包含 React 组件、Web Audio 音效引擎、数据模型与样式系统。整体实现完整度高、视觉还原到位、构建无报错，代码结构清晰。主要问题集中在全局 `user-select: none` 导致内容不可选中、剪贴板复制缺乏错误处理、`dangerouslySetInnerHTML` 未做 XSS 防护、以及若干无效 Tailwind 类名与死依赖。

## 需求对齐

需求描述的星露谷背包视觉系统（暖色木质调色板、9-slice 像素边框、36 槽位凹陷格子、金银铱星品质徽章）均已实现。父分类 Tab 分页、子分类 Pill 筛选、实时搜索、右侧详情面板（介绍、亮点、安装命令一键复制、配置示例、深度解析、关联书籍跳转）全部到位。Books 视图书架索引 + Markdown 渲染器已实现。Web Audio 8-bit 音效引擎覆盖 hover/select/tab/coin/pageTurn 五种声效。农场主档案弹窗与金币彩蛋已实现。

**与需求的差异：**
- Context 声称"经过 Puppeteer 端到端交互与无头渲染测试"，但项目内无任何测试文件（无 `tests/`、`e2e/` 或 `*.test.*` / `*.spec.*` 文件）。`puppeteer-core` 在 devDependencies 中但无测试脚本引用。此声明缺乏代码佐证，需确认。
- Context 提到"代码高亮"，但 BooksView 的 Markdown 渲染器仅使用 `marked` 做 HTML 转换，从未导入或调用 `prismjs`。代码块无语法高亮，与描述不符。
- `McpSubCategory` 类型定义了 `'browser'` 和 `'system'` 两个子分类，但 MCP 数据中无任何条目使用它们，App.tsx 的子分类筛选选项也未提供。属于类型定义与实际使用的脱节。

## 阻塞问题

无。

## 建议修改

| ID | 位置 | 问题 | 建议 |
| --- | ---- | ---- | ---- |
| S1 | `src/index.css:50` | 全局 `* { user-select: none; }` 禁止了整站文本选中。对于知识展示站，用户无法选中、复制书架文档正文与配置示例。DetailPanel 的 `selection:bg-[#ffc376]` 选中高亮样式也因此成为死 CSS。 | 移除全局 `user-select: none`，或将其限制在交互控件（`.sdv-btn`、`.sdv-tab`、`.sdv-slot`）上，正文内容区域允许正常选中。 |
| S2 | `src/components/DetailPanel.tsx:27-32` | `navigator.clipboard.writeText(text)` 返回 Promise，但未 `.catch()`。在非安全上下文（HTTP）或浏览器禁用 clipboard API 时会抛出未捕获的 Promise rejection，同时 `copied` 状态仍被设为 `true`，向用户显示"已复制"但实际失败。 | 使用 `navigator.clipboard.writeText(text).then(() => { ... }).catch(() => { /* fallback: textarea + execCommand 或显示错误提示 */ })`，在失败时给出明确反馈。 |
| S3 | `src/components/BooksView.tsx:42-49,150` | `marked.parse()` 的输出通过 `dangerouslySetInnerHTML` 直接注入 DOM，未做 HTML 消毒。虽然当前内容来自本地硬编码数据文件，无即时 XSS 风险，但若未来内容来源改为 API 或用户输入，将产生安全漏洞。 | 引入 `DOMPurify`（或 `isomorphic-dompurify`）对 `marked.parse()` 输出做 `sanitize()` 后再注入，形成纵深防御。 |
| S4 | `src/components/BooksView.tsx:91` | `border-3` 不是 Tailwind CSS v4 的有效工具类（标准宽度为 `border`、`border-2`、`border-4`、`border-8`，任意值需写 `border-[3px]`）。书架列表项因此无可见边框，与全站厚边框视觉风格不一致。 | 将 `border-3` 改为 `border-2` 或 `border-[3px]`。 |
| S5 | `src/components/BooksView.tsx:44-47` | `marked.setOptions()` 在 `useMemo` 内部调用，修改了 `marked` 的全局配置状态。若项目其他位置也使用 `marked`（或未来扩展），全局副作用会造成难以追踪的行为差异。 | 改用 `marked.parse(content, { gfm: true, breaks: true })` 传参方式，避免修改全局状态。 |
| S6 | `src/components/BooksView.tsx:140` | `prose prose-stone` 类来自 `@tailwindcss/typography` 插件，但该插件未在 `package.json` 中声明、也未在 `vite.config.ts` 中注册。这两个类名不产生任何 CSS，属于死代码。当前 Markdown 样式完全依赖下方的 `[&_h1]:...` 任意选择器实现（覆盖较完整），但 `prose` 类名会误导读者以为有排版框架支撑。 | 移除 `prose prose-stone` 类名（既然已有完整的 `[&_tag]:...` 覆盖），或安装 `@tailwindcss/typography` 并在 Vite 配置中启用。 |
| S7 | `src/App.tsx:231-293` | 模态弹窗缺少无障碍属性：无 `role="dialog"`、`aria-modal="true"`，不支持 Escape 键关闭，不支持点击遮罩关闭。屏幕阅读器用户和键盘用户无法有效操作。 | 为模态根 `div` 添加 `role="dialog" aria-modal="true" aria-labelledby`；添加 `onKeyDown` 监听 Escape 关闭；遮罩层添加 `onClick` 关闭（阻止内容区冒泡）。 |
| S8 | `src/App.tsx:123-133` | 金币计数器使用 `<div onClick>` 而非 `<button>`，不可通过 Tab 键聚焦，键盘用户无法触金币彩蛋。 | 将 `<div>` 改为 `<button>`，保留现有样式类。 |
| S9 | `package.json` devDependencies | `clsx`、`tailwind-merge`、`prismjs`、`@types/prismjs`、`puppeteer-core` 已声明但项目中未导入或使用（无测试文件）。这些死依赖增加了 `node_modules` 体积和 `pnpm install` 时间，也会误导检视者。 | 移除未使用的 devDependencies；若计划后续添加测试与代码高亮，在引入时再安装。 |
| S10 | `src/components/BooksView.tsx:19-24` | 双重状态管理（`activeBookId` props + `internalSelectedId` internal state）中，`internalSelectedId` 实际是死代码——App.tsx 总是传递 `activeBookId`（即使为 `null`），`onSelectBook` 回调也始终存在，因此 `internalSelectedId` 永远不会被使用。增加认知负担。 | 移除 `internalSelectedId` 内部状态和 `activeBookId !== undefined` 分支判断，直接使用 `activeBookId` props；由父组件完全控制选中状态（controlled component 模式）。 |
| S11 | `src/App.css`（全文） | `App.css` 是 Vite 模板残留文件，引用了 `--accent`、`--accent-bg` 等 CSS 变量（项目中未定义），且 `App.tsx` 未导入此文件。`src/assets/react.svg`、`vite.svg`、`hero.png` 同为模板残留。 | 删除 `App.css` 和未使用的模板资源文件。 |

## 非阻塞问题

| ID | 位置 | 问题 | 建议 |
| --- | ---- | ---- | ---- |
| N1 | 所有组件文件 | 所有组件使用 `React.FC` 类型标注（如 `export const App: React.FC`）。React 官方已不推荐 `React.FC`，它隐式添加了 `children` prop 类型且不支持泛型组件。现代写法是直接定义函数并让 TypeScript 推断返回类型。 | 后续迭代中可逐步移除 `React.FC`，改为 `export function App() { ... }` 或 `const App = () => { ... }`。同时可移除不必要的 `import React`（`react-jsx` 模式下不需要）。 |
| N2 | `src/types/inventory.ts:5` | `McpSubCategory` 定义了 `'browser'` 和 `'system'`，但数据与 UI 中均未使用。`SubCategory` 联合类型也过于宽泛——在 plugins 分类下设置 `subCategory: 'ops'` 不会有类型错误，但过滤结果为空。 | 可考虑为每个分类定义独立的 props 类型（如 `PluginGridProps` 的 `subCategory: PluginSubCategory \| 'all'`），收窄类型空间。移除未使用的 McpSubCategory 成员。 |
| N3 | `src/components/InventoryGrid.tsx:111-114` | 热栏编号 `(idx + 1) % 10` 在第 10 格显示 `0`、第 11 格显示 `1`（与第 1 格重复）、第 12 格显示 `2`（与第 2 格重复）。在无键盘快捷键功能的情况下，这些编号无实际用途且可能造成视觉混淆。 | 若仅为装饰，可考虑移除编号或改为 `idx + 1` 直接显示 1-12。若计划支持键盘快捷键，则需实现对应功能。 |
| N4 | `src/audio/retroAudio.ts:8` | `AudioContext` 在 `init()` 中创建后永不关闭。虽然单例模式下不会反复创建，但在页面长时间不活跃时 AudioContext 仍占用资源。 | 可考虑在 `visibilitychange` 事件中 `close()` 并置 `ctx = null`，或添加 `destroy()` 方法。非关键问题，当前不影响功能。 |
| N5 | `src/components/InventoryGrid.tsx:92-97` | 鼠标快速划过 36 个槽位时，每个槽位的 `onMouseEnter` 都会触发 `retroAudio.playHover()`，在极短时间内创建大量 oscillator 节点。虽然每个音效仅 0.04s 且音量极低，但在低端设备上可能产生音频堆积。 | 可加入简单的防抖（如 50ms 内不重复播放 hover 音效），或仅在 `item` 非空时播放（当前已如此，但快速移动仍可触发多次）。 |
| N6 | `src/components/BooksView.tsx:42-49` | `marked.parse()` 在 marked v18 中返回类型为 `string \| Promise<string>`（取决于是否注册了异步扩展），代码用 `as string` 强制断言。当前同步模式下安全，但断言掩盖了潜在的类型不确定性。 | 若确认不使用异步扩展，可通过 `marked.parse(currentBook.content, { async: false })` 明确返回 `string`，或使用 `marked.parseInline` 等保证同步返回的 API。 |
| N7 | `src/App.tsx:97` | `totalItemCount` 每次渲染重新计算四个数组的 `.length` 之和。数据量极小，无性能影响，但从代码整洁角度可提取为 `useMemo` 或在数据文件中预计算。 | 非必要修改，仅记录备忘。 |
| N8 | `src/components/InventoryGrid.tsx:91` | 槽位 `key={idx}` 使用数组索引作为 React key。由于槽位数组长度固定为 36 且不涉及重排，此场景下可接受，但通常应避免。 | 如未来网格支持拖拽重排，需改为使用 item.id 作为 key。 |
| N9 | `src/components/BooksView.tsx:58-63` | 书架子分类标签的 id 与 label 映射硬编码在组件内部（如 `'architecture'` → `'网络隧道'`），且 `BookSubCategory` 类型名为 `'architecture'` 而语义实为网络隧道，命名与含义不匹配。 | 可考虑将 `BookSubCategory` 的 `'architecture'` 重命名为 `'tunnel'` 或 `'network'`，或在数据文件中导出统一的标签映射，减少散落。 |
| N10 | `src/components/DetailPanel.tsx:132` | 安装命令 `<pre>` 使用 `whitespace-pre-wrap break-all`，长命令会强制断行。对于 shell 命令，逐字符断行可能影响可读性（如 `pnpm` 被拆为 `pn\npm`）。 | 考虑使用 `overflow-x-auto` 允许水平滚动而非强制断行，或使用 `break-all` 仅对极长无空格 token 生效的更精细方案。 |
| N11 | `src/index.css:46-52` | `*` 选择器设置了 `image-rendering: pixelated`、`-moz-crisp-edges`、`crisp-edges`。这会影响所有图片（包括未来可能引入的照片或截图），使其强制像素化渲染。 | 将 `image-rendering` 限制在特定的像素艺术元素上（如 `.sdv-slot img`、`.pixel-art`），而非全局 `*`。 |

## 准入结论

**结论**：`条件准入`

**说明**：无阻塞问题，构建无报错，功能完整度满足需求。但存在全局 `user-select: none` 导致正文不可选中、剪贴板复制无错误处理、`dangerouslySetInnerHTML` 未消毒、无效 Tailwind 类名导致视觉缺失等建议修改项，建议在合并前或紧接的迭代中处理 S1-S4 项（直接影响用户体验与正确性），其余可在后续迭代逐步清理。
