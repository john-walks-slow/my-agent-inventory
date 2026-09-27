# 检视报告

## 概要

本轮检视针对 my-harness-inventory v2 全量改造工作，涵盖配置驱动重构（YAML + Content Markdown + 图标解析链）、7Soul 496 像素图标套件及 `#/icons` 图鉴、四主题系统（stardew/pokemon/jrpg/diablo）、harness 档案与等级公式（纯函数锚点校准）、四主题 SVG badge（字体子集内嵌）、配置校验器、配套 agent skill（白板初始化、隐私扫描、统计采集）以及近期 P10 E2E 响应式与对比度修复和通配符域名隐私扫描增强。
整体评价：系统架构高度清晰解耦，模块边界与数据流严格单向，配置验证与隐私扫描为开源安全提供了坚固护栏；通过白板演练与 E2E 走查形成的质量闭环扎实，已达到优秀的工程交付质量。

## 需求对齐

- **计划满足度**：全面满足 `docs/features/260927-my-harness-inventory/260927-my-harness-inventory.plan.md` 的核心愿景与 §11 阶段验收要求。星露谷原版视觉与操作体验保持基线一致；引擎（`src/`）与业务数据彻底解耦，实现了 100% 配置化；四套主题的世界观、词汇表、色彩与音效高度自洽；配套 Agent Skill 的十步流程自包含且支持零上下文 Agent 独立走通。
- **与计划/验收文档的差异说明**：
  - `docs/features/260927-my-harness-inventory/260927-my-harness-inventory.validation.md` 第 14 行预期结果中仍保留「外层不滚动；详情/正文各自内滚」，与 P10 E2E 报告中的裁定（移动端因小屏可读性采用整页堆叠滚动，仅 PC 端限制外层 `overflow: hidden`）存在文档未同步情况，需在验证文档中同步修正口径。

## 阻塞问题

无

## 建议修改

| ID  | 位置 | 问题 | 建议 |
| --- | ---- | ---- | ---- |
| S-01 | `scripts/validate.ts:72` | **正文存在性检查对 reader 视图缺正文反向放行**：代码中检查正文存在性时写为 `else if (sec.view !== 'reader') push('warn', ...)`。导致 reader 视图（如 tomes 秘籍卷）如果缺少对应的 `.md` 正文文件时，既不报错也不发警告被静默跳过。而在 reader 视图下正文是展示核心，缺失会导致阅读器呈现空白羊皮纸。 | 将判定逻辑修正为：普通 grid 视图缺正文给出 warn 提示（「详情卡将只显示摘要」）；而 `sec.view === 'reader'` 缺正文时给出更明确的警告或错误（例如 `push('warn', 缺少典籍正文: ${p}（阅读器中将呈现空白正文））`）。 |
| S-02 | `docs/features/260927-my-harness-inventory/260927-my-harness-inventory.validation.md:14` | **用户验收文档移动端视口预期未同步既定设计裁定**：文档写着「外层不滚动；详情/正文各自内滚」，但 E2E 阶段已明确裁定移动端内容堆叠 + 整页滚动为既定设计（小屏强行内滚严重伤害可读性）。验收文档滞后会导致人工测试时误判为缺陷。 | 更新 `validation.md` 第 14 行预期为「PC 端固定视口且内滚；移动端 6 列严格正方形，内容自然堆叠、页面纵向滚动顺畅且无横向溢出」。 |
| S-03 | `src/components/BooksView.tsx:25-29` | **状态受控与非受控混合模式导致 React Compiler warning**：组件内部通过 `useState(activeBookId || books[0]?.id || null)` 拷贝 prop 初始化状态，同时又计算 `currentBookId = activeBookId !== undefined ? activeBookId : internalSelectedId;`，引发 React Compiler 衍生状态 warning。 | 统一为完全受控模式（由外部 `App.tsx` 传入 `activeBookId` 与更新回调，去掉内部冗余 state），或者在内部完全托管，消除编译器告警并精简数据流。 |

## 非阻塞问题

| ID  | 位置 | 问题 | 建议 |
| --- | ---- | ---- | ---- |
| N-01 | `src/components/BadgeView.tsx:72, 88, 128`<br>`src/components/IconsCodex.tsx:71, 85` | **部分次级页面硬编码中文未接入主题词汇表**：「返回背包」、「当前主题」、「搜索 id...」、「已复制！」等文案直接写死在 JSX 中，未从 `src/theme/vocab.ts` 读取。 | 后续迭代可在 `vocab.hud` 中扩充返回与通用操作词（如 `backToInventory`、`currentTheme`），保持全站主题词汇提取的极致完整性。 |
| N-02 | `src/components/DetailPanel.tsx:151`<br>`src/components/BooksView.tsx:162` | **Markdown HTML 渲染未引入轻量净化层**：直接使用 `dangerouslySetInnerHTML` 渲染 `marked.parse()` 产物。当前虽然数据均来自本地受信 Markdown，但若作为通用模板开源分发，存在用户注入含 script/iframe 外部内容的隐患。 | 备忘：后续如涉及外部数据注入或开放导入，可引入极简 DOMPurify 或使用 marked 的文本过滤，增强模板对恶意 Markdown 脚本的防御能力。 |
| N-03 | `src/components/InventoryGrid.tsx:135-139` | **快捷栏 1-9, 0 数字角标存在可供性未闭环**：背包前 10 格印有星露谷标志性的数字角标，但页面目前未监听键盘热键（E2E 报告已记为 backlog）。 | 备忘保留在 backlog 中，后续可在全局或网格挂载键盘快捷键监听，按数字键直接切换选中的装备，强化游戏代入感。 |

## 准入结论

**结论**：`条件准入`

**说明**：改造范围内的架构解耦、配置驱动、四套主题、Badge 生成、白板初始化、隐私防护与测试验证全部高质量完成，无阻塞性缺陷；建议在合并前或发布准备阶段顺手修正 `scripts/validate.ts` 的 reader 检查漏洞并同步更新 `validation.md` 口径。

---

## 处置记录（2026-09-27，检视后当日回修）

- **S-01** ✅ `scripts/validate.ts`：reader 视图缺正文改为专属警告「缺少典籍正文: …（阅读器将呈现空白正文）」，grid 保持原摘要警告。
- **S-02** ✅ `validation.md:14`：移动端预期同步为「PC 固定视口内滚；移动端自然堆叠、纵向滚动顺畅无横向溢出」，并注明 e2e 裁定。
- **S-03** ✅ `BooksView.tsx`：删除内部 selectedId 状态与受控/非受控混合分支，统一为完全受控 + 派生回退（`find(activeBookId) ?? books[0]`）——React Compiler warning 归零（lint 0 警告），顺带修复跨 reader section 残留选中与初始空白羊皮纸（现自动选中首册，与网格预选首件一致；实测零 console 错误）。
- **N-01/02/03** 留存备忘，随 backlog 跟进。

检视后追加的发布前隐私加固（一并说明）：真实自持隧道域名在 3 处文档/配置中占位化（`*.example.com`）；`privacy-scan.mjs` 新增通配符域名软规则（`*.` 前缀 + NOT_TLD 文件 glob 豁免），堵住「无 http 前缀域名」漏检面。
