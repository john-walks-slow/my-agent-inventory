# 多主题游戏风格 Web 项目中英文开源像素与展示字体深度调研报告

**报告归档路径**：`docs/features/260927-my-harness-inventory/260927-pixel-fonts.research.md`  
**调研时间**：2026-09-27  
**调研目标**：为多主题（星露谷 / 宝可梦 / JRPG / Diablo 暗黑）游戏风格 Web 项目提供合规、可自托管、渲染锐利的中文字体及配套西文大标题展示字体全套选型与工程化方案。

---

## 目录

1. [执行摘要与选型矩阵](#1-执行摘要与选型矩阵)
2. [支持简体中文的开源像素字体全景调研](#2-支持简体中文的开源像素字体全景调研)
   - 2.1 [缝合像素字体 (Fusion Pixel Font)](#21-缝合像素字体-fusion-pixel-font)
   - 2.2 [方舟像素字体 (Ark Pixel Font)](#22-方舟像素字体-ark-pixel-font)
   - 2.3 [俐方體11號 (Cubic 11)](#23-俐方體11號-cubic-11)
   - 2.4 [精品点阵体系列 (BoutiqueBitmap 7×7 / 9×9)](#24-精品点阵体系列-boutiquebitmap-77--99)
   - 2.5 [寒蝉点阵体 (Chill Bitmap 7px / 16px)](#25-寒蝉点阵体-chill-bitmap-7px--16px)
   - 2.6 [LanaPixel](#26-lanapixel)
   - 2.7 [全小素 (QuanPixel) 与 目哉像素 (MuzaiPixel)](#27-全小素-quanpixel-与-目哉像素-muzaipixel)
   - 2.8 [GNU Unifont 与 文泉驿点阵宋体](#28-gnu-unifont-与-文泉驿点阵宋体)
   - 2.9 [【高危版权避坑】非开源/侵权风险字体专题 (Zpix / IPix / 凤凰点阵体 / Silver)](#29-高危版权避坑非开源侵权风险字体专题-zpix--ipix--凤凰点阵体--silver)
3. [字重、网格尺寸与排版规格解析](#3-字重网格尺寸与排版规格解析)
   - 3.1 [基准网格尺寸定义](#31-基准网格尺寸定义)
   - 3.2 [比例模式 vs 等宽模式](#32-比例模式-vs-等宽模式)
   - 3.3 [整倍数缩放（Integer Scaling）原理](#33-整倍数缩放integer-scaling原理)
4. [WOFF2 Web 自托管与性能优化方案](#4-woff2-web-自托管与性能优化方案)
   - 4.1 [中文字体体积现状](#41-中文字体体积现状)
   - 4.2 [静态按需子集化：pyftsubset (fonttools)](#42-静态按需子集化pyftsubset-fonttools)
   - 4.3 [现代动态分包切片：cn-font-split 与 vite-plugin-font](#43-现代动态分包切片cn-font-split-与-vite-plugin-font)
   - 4.4 [Web 缓存与 CDN 部署策略](#44-web-缓存与-cdn-部署策略)
5. [Web 浏览器像素字体渲染质量与防模糊避坑指南](#5-web-浏览器像素字体渲染质量与防模糊避坑指南)
   - 5.1 [浏览器渲染机制与模糊根因](#51-浏览器渲染机制与模糊根因)
   - 5.2 [CSS 属性实测避坑与误区澄清](#52-css-属性实测避坑与误区澄清)
   - 5.3 [工程落地“四保锐利”铁律](#53-工程落地四保锐利铁律)
   - 5.4 [兜底防护：高清字体 (HD Font) 切换机制](#54-兜底防护高清字体-hd-font-切换机制)
6. [西文游戏 UI 大标题开源展示字体推荐（四大核心主题）](#6-西文游戏-ui-大标题开源展示字体推荐四大核心主题)
   - 6.1 [Diablo 暗黑破坏神风格（哥特 / 黑体 / 刺刃石刻）](#61-diablo-暗黑破坏神风格哥特--黑体--刺刃石刻)
   - 6.2 [星露谷物语风格（厚实像素 / 乡村田园木牌）](#62-星露谷物语风格厚实像素--乡村田园木牌)
   - 6.3 [经典 JRPG 奇幻冒险风格（古典衬线 / 史诗雕刻）](#63-经典-jrpg-奇幻冒险风格古典衬线--史诗雕刻)
   - 6.4 [宝可梦风格（经典 Game Boy 8-bit / 掌机像素）](#64-宝可梦风格经典-game-boy-8-bit--掌机像素)
7. [本项目多主题集成架构与落地实施方案](#7-本项目多主题集成架构与落地实施方案)

---

## 1. 执行摘要与选型矩阵

在开发以简体中文为主的多主题游戏风格 Web 项目时，字体选型面临三大矛盾：
1. **字符集覆盖与体积的矛盾**：标准中文常用汉字多达 3,500～7,000 字，完整矢量/点阵中文字体体积在 2MB～18MB，直接全量加载会严重阻塞首屏；
2. **像素网格与现代浏览器抗锯齿的矛盾**：现代浏览器默认会对字体应用灰度或次像素抗锯齿（Subpixel AA），非整数倍尺寸或带小数的容器位移会使像素文字彻底糊成一片；
3. **开源许可合规陷阱**：网络流传甚广的像素字体（如 Zpix、IPix、凤凰点阵体）很多存在闭源商用收费（Zpix 商业授权 1000 美元/7000 元人民币）或上游字模涉 DOS 时代中易版权争议。

### 综合选型决策矩阵

| 字体分类 | 推荐方案 | 许可证 | 基准尺寸 | 适用场景 | 优势与关键考量 |
|---|---|---|---|---|---|
| **中文主像素字体 (首选)** | **缝合像素字体 (Fusion Pixel)** | SIL OFL 1.1 | 12px (兼有 8/10px) | 正文、物品说明、界面对话 | 简繁中日英韩全覆盖，有比例/等宽模式，版权绝对干净（纯开源字模缝合） |
| **中文主像素字体 (次选)** | **俐方體11號 (Cubic 11)** | SIL OFL 1.1 | 11px (占 12px 格) | 紧凑型 UI、背包格位数值 | 11×11 点阵精雕细琢，通用规范汉字一级全覆盖，繁体极佳 |
| **小号紧凑点阵** | **精品点阵体 9×9** | SIL OFL 1.1 | 9px (加1格=10px) | 极小标签、状态角标、按键提示 | 自带 JC/XB/PS 游戏主机手柄按键符号，支持简繁 |
| **Diablo 风格西文大标题** | **Pirata One** | SIL OFL 1.1 | 任意矢量 (建议 ≥24px) | 暗黑风格装备标题、BOSS血条大字 | 融合 Blackletter 哥特与古典罗马，自带骨刺感，配红黑渐变即暗黑风 |
| **星露谷风格西文大标题** | **Press Start 2P / Jersey 25** | SIL OFL 1.1 | 8px 基准 (乘倍放大) | 农场名、金币数字、主菜单标题 | 经典 8-bit 厚实积木像素质感，与星露谷标题风格完全一致 |
| **JRPG 风格西文大标题** | **Cinzel / Cinzel Decorative** | SIL OFL 1.1 | 任意矢量 (建议 ≥20px) | 任务标题、奇幻篇章名、史诗掉落 | 基于公元 1 世纪罗马古典碑刻，比例优雅、史诗感极强 |
| **宝可梦风格西文展示** | **PKMN (nue-of-k) / Johto Font** | MIT / SIL OFL 1.1 | 8px 基准 (乘倍放大) | 掌机状态行、战斗对话框、精灵属性 | 复刻 GB 红/绿/蓝/黄/金/银原版字形与连字特性 |

---

## 2. 支持简体中文的开源像素字体全景调研

### 2.1 缝合像素字体 (Fusion Pixel Font)
- **GitHub 仓库**：[TakWolf/fusion-pixel-font](https://github.com/TakWolf/fusion-pixel-font)
- **在线预览/官网**：[fusion-pixel-font.takwolf.com](http://fusion-pixel-font.takwolf.com/)
- **最新版本**：持续滚动更新（2024~2026）
- **许可证**：字体本身遵循 **SIL Open Font License 1.1**（可完全免费商用、允许捆绑再分发、不可单独售卖字体文件）；构建程序使用 MIT。
- **字形规格与尺寸**：
  - 支持 **8px**、**10px**、**12px** 三种基准尺寸。
  - 支持 **等宽 (Monospaced)** 与 **比例 (Proportional)** 两种排版模式。
  - 语言字形包：`latin`（泛拉丁）、`zh_hans`（简体中文）、`zh_hant`（繁体中文）、`ja`（日文）、`ko`（韩文）。
- **字模来源**：
  - 10px、12px 基础汉字来自「方舟像素字体」；
  - 12px 繁体与生僻汉字补充来自「俐方體11號」；
  - 10px 补充来自「精品點陣體9×9」；
  - 8px 简体汉字补充来自「美績点陣體 (MisekiBitmap)」；
  - 8px 日文来自「美咲フォント」；
  - 韩文来自「Galmuri」。
- **渲染质量与表现**：
  - 12px 比例模式是目前中文 Web 游戏界观感最好的像素字体之一，基线协调，标点规范，中西文混排视觉重心稳定。
- **自托管可行性**：
  - 官方 Release 直接提供 `woff2` 格式！单个语言包（如 `zh_hans` 12px）转成 woff2 后约 300KB～700KB，完全可以单文件直传自托管，也可配合 `cn-font-split` 拆成 30KB～50KB 的按需分片。

### 2.2 方舟像素字体 (Ark Pixel Font)
- **GitHub 仓库**：[TakWolf/ark-pixel-font](https://github.com/TakWolf/ark-pixel-font)
- **在线预览/官网**：[ark-pixel-font.takwolf.com](http://ark-pixel-font.takwolf.com/)
- **许可证**：字体遵循 **SIL Open Font License 1.1**，构建脚本 MIT。
- **字形规格与尺寸**：
  - 基准尺寸：**10px**、**12px**、**16px**。
  - 覆盖区域：遵循《通用规范汉字表》（zh_cn）、香港《常用字字形表》（zh_hk）、台湾《国字标准字体》（zh_tw）、传统印刷体（zh_tr）及日韩字集。
  - 模式：等宽 (Monospaced) 与比例 (Proportional)。
- **现状与评价**：
  - 这是 TakWolf 团队全手工逐点绘制的纯正开源像素字库，字形骨架极规整。
  - **注意**：作者在 README 中明确标注，由于手工造字工程巨大，10px 和 12px 仍处于积极补充阶段；在汉字尚未 100% 穷尽前，作者官方推荐先使用其衍生过渡方案 **缝合像素字体 (Fusion Pixel Font)**。

### 2.3 俐方體11號 (Cubic 11)
- **GitHub 仓库**：[ACh-K/Cubic-11](https://github.com/ACh-K/Cubic-11)
- **最新版本**：v1.013+
- **许可证**：**SIL Open Font License 1.1**（保留名称 Cubic、俐方體，免费商用）。
- **字形规格与尺寸**：
  - 设计基准为 **11×11 像素**（外框通常置于 12px 容器内，留出 1px 行距/字距）。
  - 基于日文字体 `M⁺ gothic 12r` 衍生改造。
  - 收录规范：常用國字標準字體 4808 字、Big5 第一字面 5401 字、GB 2312 Level-1、通用规范汉字表一级字，甚至收录了元素周期表全部元素字。
- **渲染质量与表现**：
  - 结构非常紧凑利落，在 11px/12px 显示时辨识度极高，适合用于 RPG 背包物品名称、属性面板小字。简体支持基本满足常用 UI，偶有生僻字缺失。

### 2.4 精品点阵体系列 (BoutiqueBitmap 7×7 / 9×9)
- **GitHub 仓库**：
  - 7×7：[scott0107000/BoutiqueBitmap7x7](https://github.com/scott0107000/BoutiqueBitmap7x7)
  - 9×9：[scott0107000/BoutiqueBitmap9x9](https://github.com/scott0107000/BoutiqueBitmap9x9)
- **作者**：Luke Liu（字言字语 / Cen-cyun, Liu）
- **最新版本**：1.93 版（持续维护更新至 2026 年）
- **许可证**：**SIL Open Font License 1.1**（可免费商用、可再分发）。
- **字形规格与尺寸**：
  - **7×7**：基准 7 像素（占 8px 高），基于美咲フォント大幅增补繁简字库。
  - **9×9**：基准 9 像素（加 1 格 padding 适合 10px 渲染），基于 M+ BITMAP FONTS 与 BestTen-DOT，融合缝合像素字体补充。收录多达 12,858 个字符。
  - 提供常规体 (Regular) 与粗体 (Bold)。
- **杀手级特性**：
  - 内置主流游戏主机手柄按键符号（**Nintendo Switch Joy-Con、Xbox、PlayStation** 专用手柄键位图腾，配有独立私有区 Unicode 码点），非常适合游戏 HUD 提示。

### 2.5 寒蝉点阵体 (Chill Bitmap 7px / 16px)
- **GitHub 仓库**：[Warren2060/ChillBitmap](https://github.com/Warren2060/ChillBitmap)
- **作者**：程训天 (Warren2060)
- **最新版本**：v2.502
- **许可证**：**SIL Open Font License 1.1**（字体文件）；注：其 16px 衍生自 Unifont，标注双许可 OFL 与 GPL with Font Exception。
- **字形规格与尺寸**：
  - **7px 版**：基于美咲フォント与精品点阵体修改，重设英文与标点，筛选优化 GB2312 字符，总收录约 13,600 字符。
  - **16px 版**：基于开源 Unifont 修改，重新设计 16px 英文和标点，优化竖排排版。

### 2.6 LanaPixel
- **开源发布主页**：[OpenGameArt - LanaPixel](https://opengameart.org/content/lanapixel-localization-friendly-pixel-font)
- **作者**：eishiya
- **许可证**：**SIL Open Font License 1.1** / **CC-BY 4.0** 双许可（自由商用，捆绑再分发合规）。
- **字形规格**：
  - 基准尺寸 **11px**。
  - 收录约 19,400 个字符，专为多语言像素游戏本地化设计，覆盖现代欧洲语言、西里尔、希腊、韩文（Hangul）、日文假名及常用简体中文（及部分繁体）。
  - 提供三种版本：完整版（3MB）、无韩文版（1.3MB）、纯位图版（585KB）。

### 2.7 全小素 (QuanPixel) 与 目哉像素 (MuzaiPixel)
- **GitHub 仓库**：[DWNfonts/MuzaiPixel](https://github.com/DWNfonts/MuzaiPixel) / [itch.io diaowinner](https://diaowinner.itch.io/)
- **作者**：diaowinner
- **许可证**：**SIL Open Font License 1.1**
- **字形规格**：
  - **全小素 (QuanPixel)**：8×8 极小点阵字体，融合 Galmuri 与寒蝉点阵体，追求极限小尺寸下的中日英韩覆盖。
  - **目哉像素 (MuzaiPixel)**：8×12 尺寸，针对日文点阵 `k8x12` 进行的简体中文补全项目。

### 2.8 GNU Unifont 与 文泉驿点阵宋体
- **GNU Unifont** ([unifoundry.com](https://unifoundry.com/unifont/index.html))：
  - 16×16 点阵字，全 Unicode 字符集覆盖。
  - **许可证警惕**：遵循 **GNU GPL v2+ with Font Embedding Exception**。在 Web 中通过 `@font-face` 加载字体通常属于 embedding，享有豁免，但如果对字体做二次修改衍生或打包到二进制分发中，需仔细审查 GPL 约束。
- **文泉驿点阵宋体** ([AmusementClub/WenQuanYi-Bitmap-Song-TTF](https://github.com/AmusementClub/WenQuanYi-Bitmap-Song-TTF))：
  - 12px～16px，完整收录 GB18030。
  - **许可证警惕**：纯 **GNU GPL v2** 协议（未带明确的 Font Exception），在闭源或非 GPL 商业开源项目中集成时存在法务传染争议，不建议作为 Web 前端首选。

---

### 2.9 【高危版权避坑】非开源/侵权风险字体专题 (Zpix / IPix / 凤凰点阵体 / Silver)

在中文像素字体调研中，大量国内文章、自媒体或第三方资源站存在严重的“免费商用”误传，若在正式开源项目或商业化项目中使用，极易引发索赔纠纷。

#### 1. Zpix (最像素) —— ⚠️ 并非开源，商业授权收费 1000 美元！
- **上游仓库**：`SolidZORO/zpix-pixel-font`
- **真相澄清**：许多人看到 GitHub 仓库就以为是开源免费字体。实际上其官方 `README.md` 与版权声明中白纸黑字写明：
  > - **for Commercial/Business Product: USD $1000（约合人民币 7,000 元）**
  > - **for Personal/Education: FREE**
  > - “同时禁止对本字体进行修改、反编译、转换、拆分等反向操作（所有授权版本均不允许），及非法传播、出售、出租或以其它方式从中牟利。SolidZORO 对上述行为者保留起诉权利。”
- **结论**：**严禁在开源 Web 仓库中直接集成或再分发 Zpix！** 否则一旦项目有商业化倾向或被第三方使用，将直接构成侵权。

#### 2. IPix (中文像素字体) —— ⚠️ 零授权凭证，涉 DOS 中易版权侵权！
- **上游地址**：`purestudio.itch.io/ipix`
- **真相澄清**：该字体在 itch.io 上声称免费，但作者从未出具任何标准的开源协议（无 OFL、无 MIT、无 CC0）。经过开源字体社区深度溯源，其字模完全是从 90 年代 DOS/Windows 系统中通过工具直接提取出的点阵数据（主要为北京中易中标电子制作的 12/16 点阵）。
- **结论**：**不可商用，不可开源分发**，法律权属处于灰色地带。

#### 3. 凤凰点阵体 (VonwaonBitmap) —— ⚠️ 声称 CC0 但上游字模版权存疑
- **上游地址**：`timothyqiu.itch.io/vonwaon-bitmap`
- **真相澄清**：作者 Timothy Qiu 虽声明以 CC0 1.0 发布，但其字模直接提取自旧开源项目 `aguegu/BitmapFont`。而该项目实质是解析早期 DOS/UCDOS 的 `HZK12/HZK16` 汉字库。中易公司对该批字模保留著作权。
- **结论**：存在潜在连带版权瑕疵，对于追求 100% 知识产权干净的现代化项目，建议回避。

#### 4. Silver (Poppy Works) —— ⚠️ CC BY 4.0 但附带 10 万美元营收限制，且简中不全
- **上游地址**：`poppyworks.itch.io/silver`
- **真相澄清**：Silver 是西方极其知名的独立游戏像素字体，内置主机手柄按键，声称支持多语言。但仔细阅读其协议条款：
  > “However, if the budget of your production exceeds $100,000 USD in total spend or earnings... please contact hello@poppy.works to license this font.”
  它并非无条件自由开源，带有营收硬顶限制；且其 CJK 字库主要基于日文 Kanji 与繁体汉字补丁，官方 Issues 反映**简体中文缺字率依然较高**。

---

## 3. 字重、网格尺寸与排版规格解析

像素字体的本质是**离散网格的对齐呈现**。现代操作系统与浏览器中使用的 `.ttf` / `.otf` / `.woff2` 虽然是矢量贝塞尔曲线封装，但其轮廓内部包裹的是一个个由 4 个直角锚点构成的 1×1 方块。

### 3.1 基准网格尺寸定义
任何一套像素字体在设计之初都有一个不可撼动的**原生网格设计基准（Base Grid Size）**：

| 设计尺寸 | 常见字体代表 | 汉字点阵面积 | 排版可读性与特征 |
|---|---|---|---|
| **7px / 8px** | 寒蝉点阵 7px、全小素 8px、美咲 8px | 7×7 或 8×8 | 汉字极限压缩，繁复偏旁（如“囊”、“镶”、“繁”）需要抽象简写变形；适合做 HUD 小标、复古 Game Boy 掌机观感。 |
| **9px / 10px** | 精品点阵 9×9、方舟 10px、缝合像素 10px | 9×9 或 10×10 | 勉强看清汉字结构，辨识度较 8px 大幅提升，非常适合低分辨率像素背包数值展示。 |
| **11px / 12px** | **俐方體 11px、缝合像素 12px、方舟 12px** | 11×11 或 12×12 | **中文黄金基准点阵！** 汉字笔画结构完全舒展清晰，既保留浓烈 16-bit 黄金年代主机游戏质感，又具备极高的长时间阅读舒适度。 |
| **16px** | 寒蝉点阵 16px、Unifont 16px、方舟 16px | 16×16 | 传统 PC-98 / DOS / SFC 时代标准大字，笔画细节充沛，但信息密度较低。 |

### 3.2 比例模式 vs 等宽模式
在缝合像素字体（Fusion Pixel）与方舟像素字体中，官方均提供了两种模式：
- **等宽模式 (Monospaced)**：
  - 英文、数字占半宽（如 6px），汉字占全宽（如 12px）。
  - **优势**：字符间距严格对齐，适合用于游戏对话框（打字机逐字输出动画）、属性对齐表格、背包槽位快捷键编号。
  - **劣势**：西文阅读体验生硬，空格过宽。
- **比例模式 (Proportional) [推荐主用]**：
  - 每个西文字母和标点拥有独立的物理宽度与 Kerning 字距调整（如 `i` 占 2px，`w` 占 7px）。
  - **优势**：中西文混排视觉重心极其和谐自然，阅读流畅。适合用于长篇物品描述、剧情对话、系统提示。

### 3.3 整倍数缩放（Integer Scaling）原理
在 CSS 中使用像素字体，最致命的错误就是随意使用非基准尺寸（如对 12px 字体设置 `font-size: 14px` 或 `font-size: 1.1rem`）。
- **必须遵循 $N \times \text{Base}$ 原则**：
  - 若使用 12px 基准字体：合法字号为 **12px (1×), 24px (2×), 36px (3×), 48px (4×)**；
  - 若使用 10px 基准字体：合法字号为 **10px, 20px, 30px, 40px**；
  - 若使用 8px 基准字体：合法字号为 **8px, 16px, 24px, 32px**。
- 一旦出现非整数倍缩放（例如 12px 放大到 15px），浏览器光栅化引擎必须对像素块进行线性插值，导致部分像素宽度变成 1px、部分变成 2px，字体边缘瞬间毛糙、断裂、严重发虚。

---

## 4. WOFF2 Web 自托管与性能优化方案

### 4.1 中文字体体积现状
像素字体转为矢量字体后，由于汉字笔画的每个像素方块由 4 个顶点构成，笔画繁杂的汉字顶点数量远多于平滑曲线，导致未经压缩的 `.ttf` 往往在 **2MB ～ 5MB** 之间。
- 若直接转为单文件 `.woff2`，Brotli 压缩后通常在 **350KB ～ 900KB** 之间。
- 对于现代 Web 应用（宽带/4G/5G），一个 400KB 的 WOFF2 已经完全属于首屏可接受范围。但如果在移动端或低网速环境下，仍推荐采用成熟的**动态切片分包**或**静态子集化**方案。

### 4.2 静态按需子集化：pyftsubset (fonttools)
如果项目中仅特定标题、按钮文案、菜单需要使用该字体，文案固定，可使用 Python 官方 `fonttools` 的 `pyftsubset` 进行极限制备：

```bash
# 安装 fonttools 与 brotli
pip install fonttools brotli

# 提取代码仓库中使用的所有中文和常用符号
python3 -c "
import glob, re
chars = set()
for f in glob.glob('src/**/*.{ts,tsx,html,json}', recursive=True):
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        chars.update(re.findall(r'[\u4e00-\u9fff\w\.,!?;:\"\'\(\)\[\]\-+*/=]', fp.read()))
with open('used_chars.txt', 'w', encoding='utf-8') as out:
    out.write(''.join(sorted(chars)))
"

# 针对 FusionPixel 12px 进行精准裁剪并输出 woff2
pyftsubset "fusion-pixel-12px-proportional-zh_hans.otf" \
  --text-file=used_chars.txt \
  --flavor=woff2 \
  --no-hinting \
  --desubroutinize \
  --layout-features='*' \
  --output-file="fusion-pixel-subset.woff2"
```
- **压缩成效**：提取 1,000 个常用汉字及西文符号后，WOFF2 体积通常仅为 **35KB ～ 65KB**，毫秒级秒开。

### 4.3 现代动态分包切片：cn-font-split 与 vite-plugin-font
对于包含大量动态数据、物品字典、玩家自定义输入的游戏项目，文案不可预知，不能使用死子集。当前中文前端工业界的最佳实践是**中文网字计划**出品的 `cn-font-split`（Google Fonts 中文字体同款分包算法）：
- **工具仓库**：[KonghaYao/cn-font-split](https://github.com/KonghaYao/cn-font-split)
- **Vite 插件**：`vite-plugin-font`

#### 方案 A：构建期一键 CLI 切片（静态生成）
```bash
# 安装并切片
npx cn-font-split -i ./fonts/fusion-pixel-12px-proportional-zh_hans.ttf -o ./public/fonts/fusion-pixel/
```
- 输出目录包含：数十个 20KB～40KB 的小 `.woff2` 分片文件，以及一个由大量带 `unicode-range` 的 `@font-face` 规则组成的 `result.css`。
- **加载逻辑**：浏览器在渲染页面时，根据屏幕上实际出现的文字字符，只发起对应 Unicode 区间的 1～3 个分包网络请求（首屏往往仅需下载 40KB～80KB），剩余汉字在滚动浏览到相关词汇时动态异步加载，彻底消除大字库首屏白屏问题。

#### 方案 B：CSS `@font-face` 标准本地配置范例
若采用单文件 WOFF2 自托管方案（适合直接丢在 `public/fonts/` 目录）：
```css
@font-face {
  font-family: 'FusionPixel12';
  src: url('/fonts/fusion-pixel-12px-proportional-zh_hans.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* 优先显示后备字体，字体就绪后平滑替换，避免 FOIT 白屏 */
  unicode-range: U+4E00-9FFF, U+3000-303F, U+FF00-FFEF; /* 可选：仅拦截汉字与中文全角符号 */
}
```

---

## 5. Web 浏览器像素字体渲染质量与防模糊避坑指南

### 5.1 浏览器渲染机制与模糊根因
现代浏览器（尤其是基于 Chromium 的 Chrome/Edge 及 WebKit 的 Safari）的字体排版引擎是针对高分辨率矢量平滑优化的。它们在将文字光栅化为屏幕像素时，会自动进行：
1. **次像素抗锯齿 (Subpixel Antialiasing / ClearType)**：在笔画边缘混入红蓝彩色半透明次像素；
2. **亚像素网格对齐 (Subpixel Positioning)**：当文字坐标或容器宽度处于 `0.5px` 等浮点数时，强行在两个硬件物理像素之间进行线性加权混合。

这两项技术对矢量圆角字体（如 Arial、思源黑体）能让文字更圆润，但对**设计在离散点阵上的像素字体**则是毁灭性打击，直接导致像素块边缘发虚、出现灰晕或重影。

### 5.2 CSS 属性实测避坑与误区澄清

| CSS 属性 / 做法 | 真实有效性 | 避坑分析与真相澄清 |
|---|---|---|
| `image-rendering: pixelated;` | ❌ **对文字完全无效** | 该属性在所有浏览器中仅对 `<img>`、`<canvas>`、CSS 背景图生效，对 DOM 文本节点不起任何作用！写在 `body` 或 `p` 上是无效代码。 |
| `-webkit-font-smoothing: none;` | ⚠️ **仅 macOS WebKit 有效** | 在 macOS 上的 Safari/Chrome 能关掉平滑。但 **Windows 与 Linux 下的 Chrome/Edge 早已废弃该属性**，强行忽略，依旧按系统 ClearType 渲染。 |
| `font-smooth: never;` | ❌ **非标准废弃属性** | 早期非标草案，现代任何主流浏览器均不识别。 |
| `text-rendering: geometricPrecision;` | 💡 **建议开启** | 强制排版引擎优先几何精度而非文字连字微调，能减少 Chromium 引擎在部分字号下的字偶间距变形。 |

### 5.3 工程落地“四保锐利”铁律

为了在 Chrome、Edge、Firefox、Safari 全平台获得刀削般锋利的像素字体观感，必须严格执行以下四条工程准则：

#### 铁律一：字号与行高必须严格锁定为基准网格的整数倍
```css
/* 错误范例：随意使用 rem 或非倍数 px */
.bad-title {
  font-family: 'FusionPixel12', monospace;
  font-size: 15px;      /* 致命！非 12 的倍数，必糊 */
  line-height: 1.5;     /* 致命！产生 22.5px 的半像素行高 */
}

/* 正确范例：整数倍锁定 */
.pixel-text-1x {
  font-family: 'FusionPixel12', monospace;
  font-size: 12px;
  line-height: 12px;    /* 或 line-height: 1; 单行严丝合缝 */
}

.pixel-text-2x {
  font-family: 'FusionPixel12', monospace;
  font-size: 24px;
  line-height: 24px;    /* 2x 缩放 */
}
```

#### 铁律二：排查并消灭浮点布局导致的“半像素位移 (Subpixel Offset)”
当包含文字的容器发生浮点位移时，文字栅格化会偏移到物理像素之间。最典型的三大诱因：
1. **奇数视口宽度下的 `margin: 0 auto;`**：如果屏幕宽度为 1921px，居中计算为 `(1921 - 800) / 2 = 560.5px`，整页像素文字瞬间全糊！
   - *解法*：在根布局上将居中容器宽度或外边距向下取偶，或采用脚本/微调：
     ```css
     /* 保持容器宽度与屏幕对齐，或使用 flex 替代 auto margin */
     ```
2. **Flex / Grid 居中对齐**：`justify-content: center` 在剩余空间为奇数像素时同样产生 0.5px 偏移。
3. **CSS Transform 动画**：`transform: translate(-50%, -50%)` 是半像素重灾区。
   - *解法*：对于像素风格 UI，弹窗居中建议使用绝对定位 + 确定偶数像素的 `top/left/margin`，杜绝 `translate(-50%, -50%)`；或对运动容器加上 `-webkit-transform: translateZ(0);` 强制提升为复合图层硬件加速光栅化。

#### 铁律三：全局像素文字通用样式混入 (Reset)
在项目全局样式中统一定义像素文本基类：
```css
/* 像素文本基类 */
.pixel-font {
  font-family: 'FusionPixel12', 'Press Start 2P', monospace;
  font-size: 12px;
  line-height: 1;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: none;       /* macOS WebKit 禁用平滑 */
  -moz-osx-font-smoothing: grayscale; /* Firefox 灰度 */
}
```

### 5.4 兜底防护：高清字体 (HD Font) 切换机制
正如 2026 年现代复古游戏 UI 的行业共识（如《CS 1.6》复古网页版、各类独立游戏设置面板）：**永远给用户提供一个“HD 字体”切换开关**。
在极少数低 DPI 或特殊 Linux 字体渲染环境下，小尺寸像素汉字可能因系统强制渲染器差异造成个别用户眼部疲劳。通过在 UI 顶栏或设置中提供一个 `[ 像素字体 / 高清矢量 ]` 开关，不仅具备浓厚的主机游戏配置情怀，而且是万无一失的体验兜底方案：
```css
/* 用户切换为 HD 模式时优雅降级 */
html.hd-font-mode {
  --app-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', sans-serif;
}
```

---

## 6. 西文游戏 UI 大标题开源展示字体推荐（四大核心主题）

多主题游戏中，大标题、Logo、章节名、掉落装备品级头条通常采用富有表现力的西文字体。以下全部精选自 **SIL OFL 1.1** 协议，允许无限制商业使用与开源再分发。

### 6.1 Diablo 暗黑破坏神风格（哥特 / 黑体 / 刺刃石刻）
《暗黑破坏神》官方经典 Logo 字体是著名字体设计师 Jonathan Barnbrook 设计的 **Exocet**（由 Emigre 公司发行，**商业闭源高额收费**）。开源领域有数款完美的替代方案：

#### 1. Pirata One (首选推荐 ⭐⭐⭐⭐⭐)
- **获取渠道**：[Google Fonts - Pirata One](https://fonts.google.com/specimen/Pirata+One) / [GitHub google/fonts](https://github.com/google/fonts/tree/main/ofl/pirataone)
- **许可证**：**SIL Open Font License 1.1**
- **设计特征**：哥特黑体（Gothic Textura）的简化现代诠释，带有尖锐有力的倒钩刺角与紧凑的罗马碑刻骨架。
- **Diablo 氛围烘托技巧**：
  ```css
  .diablo-title {
    font-family: 'Pirata One', cursive;
    font-size: 36px;
    letter-spacing: 2px;
    color: #e6c587; /* 暗金装备色 */
    text-shadow: 0 0 10px rgba(180, 20, 10, 0.8), 2px 2px 2px #000;
  }
  ```

#### 2. MedievalSharp (中世纪石刻风格)
- **获取渠道**：[Google Fonts - MedievalSharp](https://fonts.google.com/specimen/MedievalSharp)
- **许可证**：**SIL Open Font License 1.1**
- **特征**：石刻哥特手书风，笔画略粗旷古朴，适合暗黑地下城碑文、羊皮纸任务书信。

#### 3. UnifrakturCook & UnifrakturMaguntia (正统德式哥特 Fraktur)
- **获取渠道**：[Google Fonts - UnifrakturCook](https://fonts.google.com/specimen/UnifrakturCook)
- **许可证**：**SIL Open Font License 1.1**
- **特征**：极度华丽繁复的中世纪黑体花体字，适合暗黑大教堂、恶魔契约的大号展示首字母（Drop Caps）。

---

### 6.2 星露谷物语风格（厚实像素 / 乡村田园木牌）
《星露谷物语》的 Logo 与 UI 大字是 ConcernedApe 手绘的 16-bit 像素字体，质感圆润厚重，带有木质招牌雕刻感。

#### 1. Press Start 2P (首选推荐 ⭐⭐⭐⭐⭐)
- **获取渠道**：[Google Fonts - Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
- **许可证**：**SIL Open Font License 1.1**
- **设计特征**：经典的 Namco 街机 8×8 粗像素字，字符饱满粗壮，极具复古街机与掌机主角感。
- **适用场景**：农场主姓名、金币金额、等级数字、主菜单核心 TAB 按钮。

#### 2. Silkscreen
- **获取渠道**：[Google Fonts - Silkscreen](https://fonts.google.com/specimen/Silkscreen)
- **许可证**：**SIL Open Font License 1.1**
- **设计特征**：小尺寸紧凑型像素字体，比 Press Start 2P 更纤巧，包含 Regular 与 Bold 两种字重，极其适合背包二级分类小标题。

#### 3. Jersey 25 / Jersey 15
- **获取渠道**：[Google Fonts - Jersey 25](https://fonts.google.com/specimen/Jersey+25)
- **许可证**：**SIL Open Font License 1.1**
- **设计特征**：大号复古方块像素粗体，带有浓郁的复古运动与美式乡村广告牌风格，适合农场活动广告板。

---

### 6.3 经典 JRPG 奇幻冒险风格（古典衬线 / 史诗雕刻）
适合勇者斗恶龙、最终幻想、八方旅人式的史诗奇幻 UI 标题与篇章过渡。

#### 1. Cinzel & Cinzel Decorative (首选推荐 ⭐⭐⭐⭐⭐)
- **获取渠道**：[Google Fonts - Cinzel Decorative](https://fonts.google.com/specimen/Cinzel+Decorative)
- **许可证**：**SIL Open Font License 1.1**
- **设计特征**：基于公元 1 世纪古典罗马帝国纪念碑石刻比例，字母端庄威严；`Cinzel Decorative` 变体增加了极其华丽的花体涡卷饰线。
- **适用场景**：JRPG 装备神器全名、转职界面大标题、过场章节标题。

#### 2. Almendra & Almendra SC
- **获取渠道**：[Google Fonts - Almendra](https://fonts.google.com/specimen/Almendra)
- **许可证**：**SIL Open Font License 1.1**
- **设计特征**：融合了大法官手书（Chancery）与哥特体书法的奇幻衬线体，笔触犹如羽毛笔蘸墨挥毫，奇幻魔法书与炼金配方感浓郁。

---

### 6.4 宝可梦风格（经典 Game Boy 8-bit / 掌机像素）
复刻初代 Game Boy 与 GBA 世代宝可梦红/绿/蓝/黄及金/银的独特掌机观感。

#### 1. PKMN (nue-of-k) (首选推荐 ⭐⭐⭐⭐⭐)
- **GitHub 仓库**：[nue-of-k/pkmn](https://github.com/nue-of-k/pkmn)
- **许可证**：**MIT License**
- **设计特征**：完美复刻 GB 原版《口袋妖怪 赤·绿·青·皮卡丘》与《金·银·水晶》的英文字母、符号、数字，并提供了 Regular、Strict、Western 三种微调变体。

#### 2. Johto Font (原 pokemon-font)
- **GitHub 仓库**：[cooljeanius/pokemon-font](https://github.com/cooljeanius/pokemon-font) / [npm `pokemon-font`](https://www.npmjs.com/package/pokemon-font)
- **许可证**：**SIL Open Font License 1.1**
- **设计特征**：带有现代 Unicode 扩展，收录了原版游戏中的专属合字（如 `PKMN` 单字符图腾、`'d`、`'l`、`'s` 紧凑连字）。

---

## 7. 本项目多主题集成架构与落地实施方案

针对当前项目（包含星露谷背包、宝可梦图鉴、JRPG 技能树、暗黑装备等多主题切换）的具体场景，推荐采用**CSS 变量 + Font-Stack + Unicode-Range 级联**的分层架构：

### 7.1 字体资源配置表 (Assets Inventory)

建议在项目的 `public/fonts/` 目录组织以下轻量级自托管字体包：

```text
public/fonts/
├── pixel-cjk/
│   ├── fusion-pixel-12px-proportional-zh_hans.woff2   (~450KB，主正文与通用中文)
│   └── boutique-bitmap-9x9.woff2                     (~280KB，小标与手柄按键备用)
└── display/
    ├── pirata-one-latin.woff2                         (~25KB，暗黑 Diablo 大标题)
    ├── press-start-2p-latin.woff2                     (~18KB，星露谷 8-bit 大标题)
    ├── cinzel-decorative-latin.woff2                  (~35KB，JRPG 奇幻衬线大标题)
    └── pkmn-regular.woff2                             (~15KB，宝可梦掌机展示)
```
> **总网络载荷**：全部 5 个 WOFF2 字体加起来仅约 **800KB**，在现代 Web 环境下一次性完整自托管毫无压力，无需复杂的第三方 CDN 依赖。

### 7.2 现代 CSS 变量级联实现范例

```css
/* ==========================================================================
   1. 字体定义 (@font-face)
   ========================================================================== */

/* 中文核心像素字体：缝合像素 12px 比例版 */
@font-face {
  font-family: 'FusionPixel12';
  src: url('/fonts/pixel-cjk/fusion-pixel-12px-proportional-zh_hans.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* 西文展示字体：Diablo 风格 */
@font-face {
  font-family: 'PirataOne';
  src: url('/fonts/display/pirata-one-latin.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153; /* 仅作用于拉丁字符 */
}

/* 西文展示字体：星露谷 / 街机 8-bit 风格 */
@font-face {
  font-family: 'PressStart2P';
  src: url('/fonts/display/press-start-2p-latin.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF;
}

/* 西文展示字体：JRPG 奇幻衬线风格 */
@font-face {
  font-family: 'CinzelDeco';
  src: url('/fonts/display/cinzel-decorative-latin.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF;
}

/* ==========================================================================
   2. 主题变量分发
   ========================================================================== */

:root {
  /* 全局统一正文字体栈：西文优先匹配原生像素，中文由 FusionPixel 接管 */
  --font-pixel-body: 'FusionPixel12', monospace;

  /* 默认主题大标题 */
  --font-theme-title: 'PressStart2P', 'FusionPixel12', monospace;
}

/* 星露谷主题 (Stardew Valley) */
[data-theme='stardew'] {
  --font-theme-title: 'PressStart2P', 'FusionPixel12', monospace;
}

/* 暗黑破坏神主题 (Diablo) */
[data-theme='diablo'] {
  --font-theme-title: 'PirataOne', 'FusionPixel12', serif;
}

/* JRPG 奇幻冒险主题 */
[data-theme='jrpg'] {
  --font-theme-title: 'CinzelDeco', 'FusionPixel12', serif;
}

/* 宝可梦主题 (Pokemon) */
[data-theme='pokemon'] {
  --font-theme-title: 'PKMN', 'FusionPixel12', monospace;
}

/* ==========================================================================
   3. 像素渲染保真类
   ========================================================================== */

.pixel-body-text {
  font-family: var(--font-pixel-body);
  font-size: 12px;
  line-height: 14px;
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
}

.pixel-header-title {
  font-family: var(--font-theme-title);
  font-size: 24px;   /* 严格锁定为 12px 的 2 倍 */
  line-height: 28px;
  text-rendering: geometricPrecision;
}
```

### 7.3 总结建议与下一步
1. **立即采用方案**：主字体直接采纳 **缝合像素字体 (Fusion Pixel Font) 12px 比例版**，直接在项目内自托管 `.woff2` 文件（约 450KB），无需外部依赖即可完美支持所有中文文案与英文道具名。
2. **主题大标题切分**：为星露谷、暗黑、JRPG、宝可梦四个主题分别配置 15KB～35KB 的极小西文展示字体，利用 `unicode-range` 实现西文走艺术字头牌、中文走像素黑体的无缝拼配。
3. **严格禁止引入**：由于严苛的授权与侵权风险，在本项目代码与文档中**严禁引用 Zpix、IPix、文泉驿及未经商业授权的 Exocet**。
