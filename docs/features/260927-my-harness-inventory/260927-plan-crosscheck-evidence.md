# 开源项目计划外部事实断言核查报告 (R1 ~ R5 取证证据集)

> 报告生成时间：2026-09-27  
> 核查方式：实际网络抓取（通过 HTTP 代理 127.0.0.1:7890）、文件下载与本地二进制/元数据取证（Python struct 解析 PNG IHDR、unzip 检查、Node.js 运行实例检验）。  
> 证据层级标注：【一手证据】（作者原始声明、官方仓库源码、官方发售页、本地二进制实测） / 【二手说法】（社区评论、整理者转述、第三方博客）。

---

## 目录

1. [R1. OpenGameArt 496 Pixel Art Icons 套件核查](#r1-opengameart-496-pixel-art-icons-套件核查)
2. [R2. 其他候选像素图标套件许可及红线规则核查](#r2-其他候选像素图标套件许可及红线规则核查)
3. [R3. 字体许可、字身体积与版权合规性核查](#r3-字体许可字身体积与版权合规性核查)
4. [R4. 浏览器 SVG 渲染上下文与 GitHub 徽章加载限制](#r4-浏览器-svg-渲染上下文与-github-徽章加载限制)
5. [R5. 浏览器端 YAML 解析、Zod 校验与构建期替代方案](#r5-浏览器端-yaml-解析zod-校验与构建期替代方案)
6. [核查结论速查总表](#核查结论速查总表)

---

## R1. OpenGameArt 496 Pixel Art Icons 套件核查

- **目标条目**：OpenGameArt.org "496 Pixel Art Icons for Medieval/Fantasy RPG"（Node 39455，作者 Henrique Lazarini / 7soul1，整理者 gnola14）
- **条目链接**：https://opengameart.org/node/39455 (规范 URL: https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg)
- **下载直链**：https://opengameart.org/sites/default/files/496_RPG_icons.zip

### (a) 页面标注许可证与文字取证
- **结论**：**成立（纯 CC0 1.0）**。
- **页面原始文字摘录**【一手证据】：
  - 页面结构化字段 `License(s)` 仅包含单个分类标签：
    ```html
    <div class="field field-name-field-art-licenses field-type-taxonomy-term-reference field-label-above">
      <div class="field-label">License(s):&nbsp;</div>
      <div class="field-items">
        <div class="field-item even"><a href="/licenses/cc0">CC0</a></div>
      </div>
    </div>
    ```
  - 页面**未列出** CC-BY 3.0 或其他并列许可证。
  - 页面没有专门命名的 "Permissions" 区块，但在正文 `Body` 区域中，整理者 gnola14 详细记录了授权清洗过程：
    > "This set is a combination of the original 420 pixel art icons for RPG, plus two expansions that the author did at a later point. I renamed some of the icons, so that the whole set has the same naming convention. I had to remove some icons that were not compatible with the Public Domain license, since they were derivative works from copyrighted games. Everything has been repacked as .zip..."

### (b) 计划断言"作者 7Soul 亲自在 DeviantArt 宣布将全部作品置于公有领域"
- **结论**：**部分成立（存在表述泛化，实际是针对该系列免费图标套件声明公有领域）**。
- **一手出处取证**【一手证据】：
  1. **DeviantArt 原始发布页 1**：`420 -Pixel Art- Icons for RPG` (发布于 2009-07-17，后续更新)  
     链接：https://www.deviantart.com/7soul1/art/420-Pixel-Art-Icons-for-RPG-129892453  
     作者 7Soul1 在正文 Markup 中明确声明：
     ```text
     Set of 420 RPG icons, free for commercial use
     You can download a pack with them all in individual .png files here: ...
     ---
     EDIT 2:
     I removed any icon where I used an icon from another game as a base. Someone pointed out to me that using something from a commercial game as a base and making it public is a bad move, even when unintentional. Sorry for the inconvenience.
     ---
     Public Domain
     This work is free of known copyright restrictions.
     ```
  2. **DeviantArt 原始发布页 2**：`Extra 98 Free RPG Icons`  
     链接：https://www.deviantart.com/7soul1/art/Extra-98-Free-RPG-Icons-389778011  
     作者 7Soul1 在正文 Markup 中同样声明：
     ```text
     Set of 98 RPG icons, free for commercial use
     ...
     Public Domain
     This work is free of known copyright restrictions.
     ```
  3. **OGA 评论区作者私信记录**【一手转述/社区确认】：  
     在 OGA node 39455 评论区 Comment 2，用户 capbros 与原作者确认：
     > `@MedicineStorm Yep, the three original sets have that license stated in their DA pages. Also, @capbros contacted the author and he said: "Sorry, the stuff on opengameart.org was submitted by someone else so it's outdated by 2 years :/. The correct licence is the one on deviantart, which is Public Domain. I changed the licence because all I wanted was to make the icons free, and the CC-BY 3.0 licence was causing too much of a hassle".`
- **修正说明**：作者 7Soul1 并非将个人画廊中的"全部作品"（其 itch.io 上仍有 1400 icons 等商业付费售卖包）置于公有领域，而是专门将这批发布在 DeviantArt 上的 RPG 像素图标套件（420 + Extra 98 + Gold 系列）明确标记为 "Public Domain / free for commercial use"。

### (c) 下载直链状态、文件大小与图片尺寸实测
- **结论**：**成立**。
- **本地实测命令与结果**【一手证据】：
  ```bash
  # HTTP HEAD 请求验证
  curl -s -x http://127.0.0.1:7890 -I "https://opengameart.org/sites/default/files/496_RPG_icons.zip"
  # 输出：
  # HTTP/2 200 
  # content-type: application/zip
  # content-length: 1541171
  # last-modified: Tue, 24 Mar 2015 20:00:49 GMT
  ```
  - **HTTP 状态码**：`200 OK`
  - **文件大小**：`1,541,171` 字节（约 `1.47 MB`）
  
  解压并使用 Python `struct` 解析全部 PNG 二进制 IHDR：
  ```python
  # 实测脚本统计
  Counter({'.png': 496})
  Counter({(34, 34): 496})
  ```
  - **PNG 文件数量**：刚好 `496` 个文件，全为 `.png`。
  - **实际尺寸分布**：**全部 496 个图标的尺寸 100% 均为 34×34 像素**（无任何 32×32，无任何混合尺寸）。
  - **大精灵图 Sheet**：压缩包内**没有**任何合并的大精灵图 sheet 文件，全为独立单图。

### (d) zip 内部 README / License 文件检查
- **结论**：**不包含**。
- **实测结果**：解压出来的 496 个条目全部为纯 PNG 图片文件（命名前缀如 `icon001.png` ~ `icon496.png`），内部没有任何 `.txt`、`.md`、`README` 或 `LICENSE` 文本文件。

### (e) 商用/再分发完全自由的依据评定
- **结论**：**依据充分且清晰**。
  1. 整理者在 OpenGameArt 平台以 CC0 1.0 Universal 协议分发。
  2. 原作者 Henrique Lazarini (7Soul1) 在 DeviantArt 原始发布页中明文赋予 "free for commercial use" 与 "Public Domain"。
  3. 整理者主动对原作者早期画作进行了合规审查，剔除了少量借鉴自商业游戏的衍生图形，规避了潜在衍生侵权。
  4. 原作者通过私信明确确认原先的 CC-BY 3.0 已变更为 Public Domain。

---

## R2. 其他候选像素图标套件许可及红线规则核查

针对计划中各候选套件的许可协议、是否允许随开源仓库再分发进行核实：

| 候选套件 | 标称许可 | 实际许可证 | 是否允许随开源仓库再分发 | 权威证据链接 | 关键说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Shade / merchant-shade 免费 RPG 图标** | CC0 | **CC0 1.0 Universal** | **允许** | [merchant-shade.itch.io](https://merchant-shade.itch.io/16x16-mixed-rpg-icons) | itch.io 页面元数据明确标为 `Creative Commons Zero`，作者在评论区明确确认："yep all my free assets are licensed CC0 ^^" |
| **Kenney (Roguelike, Generic, 1-Bit, Tiny Dungeon)** | CC0 | **CC0 1.0 Universal** | **允许** | [kenney.nl/assets/1-bit-pack](https://kenney.nl/assets/1-bit-pack) | 页面明示 "for free, CC0 licensed!"，官方统一采用 CC0 1.0，商业再分发完全自由 |
| **DCSS (Dungeon Crawl Stone Soup) 官方 tiles** | CC0 | **大部分 CC0 1.0，存量含复杂许可** | **允许（需选用 CC0 子集）** | [crawl/crawl LICENSE](https://raw.githubusercontent.com/crawl/crawl/master/LICENSE) 及 [crawl/tiles](https://github.com/crawl/tiles) | LICENSE 明确写道："The majority of Crawl's tiles and artwork are released under the CC0 license... however, the licensing situation may be complex, especially for older pieces." 仓库有专门的 `TILES_UNDER_UNKNOWN_LICENSE.md` 排除未知许可。计划若全量引用需警惕，仅可引用其分离出的 CC0 导出集 |
| **josehzz Farming Crops 16×16** | CC0 | **CC0 1.0 Universal** | **允许** | [opengameart.org/content/farming-crops-16x16](https://opengameart.org/content/farming-crops-16x16) | OpenGameArt 原创发布，结构化 `License(s)` 字段为 `CC0`，包含 20 种作物生长期及肖像图 |
| **Nikoichu 1-bit Pixel Icons** | CC0 | **CC0 1.0 Universal** | **允许** | [nikoichu.itch.io/pixel-icons](https://nikoichu.itch.io/pixel-icons) | itch.io 页面 Asset license 明确标为 `Creative Commons Zero v1.0 Universal`，作者在 Devlog 中明确声明 "All completely free under a CC0 license!" |
| **Kyrise's Free 16×16 RPG Icons** | CC-BY 4.0 | **CC-BY 4.0** | **允许（必须保留署名）** | [opengameart.org/content/kyrises-free-16x16-rpg-icon-pack](https://opengameart.org/content/kyrises-free-16x16-rpg-icon-pack) | 页面许可证为 `CC-BY 4.0`，允许商用与开源再分发，但非 CC0，必须在项目致谢/文档中附带 Kyrise 的署名链接 |
| **Liberated Pixel Cup / LPC items** | CC-BY-SA 3.0 | **CC-BY-SA 3.0 + GPL v3.0 双许可** | **严禁（具强传染性）** | [lpc.opengameart.org/content/lpc-rules](https://lpc.opengameart.org/content/lpc-rules) 及 [OGA Guide](https://opengameart.org/content/properly-licensing-your-liberated-pixel-cup-game-entry) | 官方规定美术资产必须以 CC-BY-SA 3.0 / GPL 3.0 双协议发布。CC-BY-SA 的 ShareAlike 条款强制要求衍生作品必须相同协议开源，属于强 copyleft 传染 |

### 计划红线结论检验
- **计划断言「红线：禁 LPC（CC-BY-SA 传染）」**：**完全成立**。CC-BY-SA 3.0 的 ShareAlike 条款具有法律约束力，一旦对图标进行拼接、修改或与自研资产混编，极易造成项目资产库被整体强制要求以 CC-BY-SA 传染开源。
- **计划断言「禁 itch.io 受限免费包」**：**部分成立（需作精准界定）**。itch.io 平台上大量免费素材包采用作者自定义的 Restrictive EULA（例如"禁止作为素材随开源仓库分发"、"禁止商业用途"），此类受限包确实绝对禁止引入；但对于明确声明为 `CC0 1.0 Universal` 的 itch.io 素材（如 Shade 和 Nikoichu），法律属性上与公共领域完全一致，不存在再分发限制。

---

## R3. 字体许可、字身体积与版权合规性核查

### (a) TakWolf/fusion-pixel-font（缝合像素字体）
- **许可证**：**SIL OFL 1.1**（成立）。
  - 源码仓库 `LICENSE-OFL` 明确声明：`SIL Open Font License, Version 1.1`。
- **最新 Release 是否直接提供 woff2**：**成立**。
  - 最新版本 `v2026.09.25` 的 Release Assets 中提供了 `fusion-pixel-font-12px-proportional-otf.woff2-v2026.09.25.zip` 等预编译压缩包。
- **12px 比例模式 zh_hans 实际文件大小实测**【一手证据】：
  - 解压 `fusion-pixel-font-12px-proportional-otf.woff2-v2026.09.25.zip` 得到：
    - `fusion-pixel-12px-proportional-zh_hans.otf.woff2`：**`666,264` 字节（约 `650.65 KB`）**
  - 解压 `fusion-pixel-font-12px-proportional-ttf.woff2-v2026.09.25.zip` 得到：
    - `fusion-pixel-12px-proportional-zh_hans.ttf.woff2`：**`928,148` 字节（约 `906.40 KB`）**
- **计划中"约 450KB 单文件"断言检验**：**不成立（低估约 45%~100%）**。
  - 修正建议：在规划网页端加载预算时，应按 `651 KB`（OTF-woff2）或 `906 KB`（TTF-woff2）核算，若需控制在 450KB 以内必须自行对字库做汉字常用字子集化（subsetting）。

### (b) 宝可梦字体（nue-of-k / pokemon-font / Johto Font）
- **nue-of-k/pkmn**：
  - **仓库链接**：https://github.com/nue-of-k/pkmn
  - **实际许可证**：**MIT License**（成立，非 OFL）。该仓库于 2024-05-05 移管并明确采用 MIT License。
- **npm 上的 pokemon-font / Johto Font**：
  - **历史与商业现状**：作者 Pascal Pixel (Superpencil) 早期在 npm 发布过 `pokemon-font`，后续将字体升级重构为 `Johto Font` / `Johto Mono`（https://superpencil.com/work/johto-mono ），并在 MyFonts 等平台上架。
  - **许可**：**商业闭源收费**（个人非商用免费，商业单个桌面授权 $32~$42，Web 端按月 PV 阶梯收费）。
  - **结论**：若开源项目需集成正规开源协议的 GameBoy 宝可梦风字体，只能选用 `nue-of-k/pkmn`（MIT），严禁使用商业化的 `Johto Font`。

### (c) Cinzel 与 Pirata One
- **Google Fonts 官方许可**：两者均为 **SIL OFL 1.1**（完全成立）。
  - Cinzel 仓库：https://github.com/NDISCOVER/Cinzel
  - Pirata One 仓库：https://github.com/google/fonts/tree/main/ofl/pirataone
- **中文字形与回退必要性**：两者均为纯西文字体（仅包含 Latin / Latin-ext 字符集，完全不包含 CJK 汉字）。计划中提出"中文回退系统 serif"的判断**完全必要且准确**，否则在遇到中文字符时，浏览器会跳过该字体直接回退到系统默认无衬线字体，破坏排版风格一致性。

### (d) Zpix、IPix、VonwaonBitmap（凤凰点阵体）合规性核查
- **Zpix（最像素）**：
  - **断言"商业收费"**：**完全成立**。
  - **收费标准**【一手证据】：作者 SolidZORO 在 GitHub 官方仓库 `SolidZORO/zpix-pixel-font` 的 README 中明文规定：
    - 单个商业产品（Single Product）：**`RMB ￥7000` / `USD $1000`**；
    - 多个商业产品：需发邮件洽谈；
    - 个人及教育用途：免费；
    - 协议明文禁止对字体进行反编译、修改或拆分。
- **IPix 与 VonwaonBitmap 授权被判为"不合格"的断言**：**完全成立（存在严重上游字模侵权争议）**。
  - **取证事实**：
    1. **字模来源**：两者的汉字点阵字模（moulds）均直接抽取自远古开源项目 `aguegu/BitmapFont` 中的 `HZK16`（汉字库 16×16 点阵）。
    2. **版权归属溯源**：经 TakWolf（`TakWolf-Deprecated/hzk-pixel-font`）及多位开源字库开发者溯源确认，该批 HZK 点阵字库系 1990 年代「北京中易中标电子信息技术有限公司」为 DOS 及 Windows 3.2 系统开发的专有字库。中易中标公司至今存续且经营字体业务，从未将其汉字点阵放弃为公共领域。
    3. **授权效力缺陷**：`BitmapFont` 及衍生作者仅编写了解析提取脚本，其本身并不享有汉字字形版权，因此后续作者在 itch.io 上声明的 "CC0" 或 "GPLv3" 属于**无权处分**。猫啃网、今日境等开源字体平台均将其标为「争议字体，严禁商业使用」。
  - **结论**：计划将其定性为"不合格并剔除"是极其正确的技术合规决策。

---

## R4. 浏览器 SVG 渲染上下文与 GitHub 徽章加载限制

### (a) `<img src="...svg">` 是否无法加载外部字体（@font-face / `<link>`）？
- **结论**：**完全成立（浏览器安全规范强制限制）**。
- **技术规范依据**：
  - 根据 W3C SVG 规范以及浏览器安全模型，当 SVG 通过 `<img>` 标签、CSS `background-image` 或 CSS `content: url(...)` 作为图像上下文（Image Context / secure animated image context）加载时：
    1. **禁用所有脚本**：`<script>` 标签与内联事件监听器均被忽略；
    2. **阻断所有网络外部资源（External Resource Requests）**：包括 `<link rel="stylesheet">`、`@import url(...)` 以及 `@font-face { src: url('http...') }`。任何指向外部网络 URL 的字体或图像均被静默拦截，以防止利用嵌入图片发起跨站追踪（Fingerprinting / Tracking Pixel）或 CSRF 攻击。
- **可行替代方案**：
  - **内嵌 Data-URI**：如果将字体文件通过 base64 编码为 Data-URI（例如 `@font-face { src: url('data:font/woff2;base64,...'); }`），由于不需要发起外部网络请求，数据完全内联在 SVG 内部，主流浏览器（Chrome/Firefox/Safari）在 `<img>` 上下文中均能正常解析和渲染该内嵌字体。
  - **文字转路径（Glyph-to-Path）**：直接在构建期将文字转换为 `<path d="...">` 矢量轮廓。

### (b) GitHub README 引用外部 SVG 与 Camo 代理行为
- **结论**：**可正常渲染，但受 Camo 与 CSP 严格约束**。
- **取证细节**：
  1. **Camo 代理机制**：GitHub 在渲染 Markdown 时，会将外部图片 URL（如 `<img src="https://user.github.io/repo/badges/x.svg">`）统一重写为 `https://camo.githubusercontent.com/<hash>`。
  2. **Camo 转发逻辑**：Camo 服务端向源站发起 GET 请求，验证上游返回合法的图片 MIME 类型后，将二进制内容原样缓存并代理给用户。
  3. **CSP 响应头限制**：Camo 代理返回时会附带极端严格的响应头：
     ```http
     Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox
     ```
  4. **对外部资源的影响**：Camo 仅代理 SVG 文件本体。当用户的浏览器在 README 页面通过 `<img>` 渲染 Camo 代理的 SVG 时，浏览器会叠加两层防护（浏览器自身的 SVG Image Context 封锁 + Camo 的 sandbox/CSP），任何在 SVG 内部试图请求外部字体的行为均绝对失败；而内嵌 base64 Data-URI 的字体不受 Camo 拦截，可在前端正常显示。

### (c) GitHub Pages 托管 .svg 的 Content-Type 实测
- **结论**：**成立（确为 `image/svg+xml`）**。
- **本地实测命令与响应头**【一手证据】：
  ```bash
  curl -s -x http://127.0.0.1:7890 -I "https://material-icons.github.io/material-icons/svg/favorite/baseline.svg"
  # 输出节选：
  # HTTP/2 200 
  # server: GitHub.com
  # content-type: image/svg+xml
  # access-control-allow-origin: *
  # etag: "62f74aee-113"
  ```
  GitHub Pages 静态服务器能够正确识别 `.svg` 后缀并返回标准 MIME 类型 `image/svg+xml`，不会因 Content-Type 错误导致浏览器拒收。

---

## R5. 浏览器端 YAML 解析、Zod 校验与构建期替代方案

### (a) js-yaml 的 "Norway Problem" 与 Timestamp 类型机制
- **结论**：**官方行为依据确凿，未加引号的日期必然被解析为 JS `Date` 实例**。
- **源码与运行时实测验证**【一手证据】：
  - 针对 Node.js 环境实测 `js-yaml@4.3.2`：
    ```javascript
    const yaml = require("js-yaml");
    const doc = yaml.load("date: 2026-05-01\ncountry: NO");
    console.log(doc.date instanceof Date); // 输出: true
    console.log(typeof doc.country);       // 输出: string
    ```
  - **关于 Norway Problem**：js-yaml 在 v4 版本后将基底迁移至 YAML 1.2 规范，移除了 YAML 1.1 中将 `NO`/`no` 识别为布尔值 `false` 的缺陷，因此 `country: NO` 解析为字符串 `"NO"`。
  - **关于 Timestamp 官方依据**：
    在 `js-yaml/lib/schema/default.js` 源码中明确声明：
    ```javascript
    module.exports = require('./core').extend({
      implicit: [
        require('../type/timestamp'),
        require('../type/merge')
      ], ...
    })
    ```
    js-yaml 的默认 Schema（`DEFAULT_SCHEMA`）在 Core Schema 基础之上**隐式扩展了 `type/timestamp`**。只要匹配 `YYYY-MM-DD` 格式的未加引号标量，均会被自动转换为原生 `Date` 对象。
- **对 Zod 校验的影响**：
  若在数据校验中使用 `z.object({ date: z.string() })`，js-yaml 传入的将是 `Date` 对象而非 `string`，会导致运行时直接抛出报错：
  `ZodError: [ { "expected": "string", "received": "date", "path": ["date"], "message": "Expected string, received date" } ]`。
  这要求开发者必须防御性地使用 `z.coerce.string()` 或 `z.union([z.string(), z.date()])`，或者在 YAML 中对日期强制加双引号 `"2026-05-01"`。

### (b) Zod v4 与 Zod Mini 的浏览器体积取证
- **结论**：**官方基准数据明确，Zod 4 核心较 v3 缩减 57%，Zod Mini 缩减 85%**。
- **官方数据出处**【一手证据】：
  参考 `zod.dev/v4` 官方发布文档及源码文档 `packages/docs/content/packages/mini.mdx`：
  
  | 场景 / 包版本 | Zod 3 (gzip) | Zod 4 Regular (gzip) | Zod 4 Mini (`zod/mini`) (gzip) | 缩减比例 |
  | :--- | :--- | :--- | :--- | :--- |
  | **基础类型（如 `z.boolean()`）** | `12.47 KB` | `5.36 KB` | **`1.88 KB` ~ `2.12 KB`** | 较 v3 缩减 85%（6.6x） |
  | **对象复合结构（3-5 个字段 object）** | ~`15 KB` | `13.1 KB` | **`4.0 KB`** | 较常规版缩减 69% |
  | **未 Tree-Shake 的全功能包** | ~`20 KB` | ~`17 KB` | ~`10 KB` | 整体高度可压缩 |

- **注意事项**：Zod 4 将国际化（Locales）打包在主命名空间中，在特定打包工具（如 Next.js / 未配置的 Webpack）下使用 `import { z } from 'zod'` 可能导致全量语言包被打入；而在 Vite / Rollup 环境下，只要遵循 `import * as z from 'zod/mini'`，Tree-shaking 即可完美工作，产物体积仅在 `2KB~4KB` (gzip) 之间。

### (c) 构建期把 YAML 转换为 JSON 的 Vite 插件生态
- **结论**：**生态极其成熟且处于主流维护状态，推荐直接使用 `@rollup/plugin-yaml` 或 `@modyfi/vite-plugin-yaml`**。
- **主流方案选型对比**：
  1. **方案 A：`@rollup/plugin-yaml`（Rollup 官方维护，最高推荐度）**
     - **周下载量**：约 148 万次/周；
     - **维护状态**：由 Rollup 官方核心团队维护（最新版本 5.0.0，最近持续更新）；
     - **兼容性**：Vite 基于 Rollup 构建管线，原生完美支持直接在 `vite.config.ts` 中以 `plugins: [yaml()]` 引入；
     - **构建产物**：在编译打包阶段将 `.yaml` 解析并内嵌为 ES Module 导出的原生静态 JS/JSON 对象，运行时零体积引入。
  2. **方案 B：`@modyfi/vite-plugin-yaml`（社区成熟 Vite 专用插件）**
     - **周下载量**：约 10 万次/周；
     - **维护状态**：原 Modyfi 团队开发，后团队被 Figma 收购，现仓库镜像为 `figma/vite-plugin-yaml`，npm 仍在正常分发（v1.1.1）；
     - **工作机制**：同样在构建期使用 `js-yaml` 转换，直接输出结构化对象。
- **工程价值总结**：
  采用构建期 YAML 插件完全替代浏览器运行时解析是业界 Best Practice，既免去了前端打包 `js-yaml` 的数十 KB 运行时体积开销，又在编译期即时拦截了 YAML 语法错误，并彻底消除了浏览器端运行时解析 Date 导致的 Zod 类型歧义。

---

## 核查结论速查总表

| 编号 | 核查事项 | 结论 | 核心事实摘要 | 修正建议 / 落地策略 |
| :--- | :--- | :---: | :--- | :--- |
| **R1(a)** | OGA 39455 许可证 | **成立** | 页面字段原文为 `License(s): CC0`，为纯 CC0，无 CC-BY 3.0 并列 | 按 CC0 无限制商用处理 |
| **R1(b)** | 7Soul 宣布公有领域一手来源 | **部分成立** | 找到了 DeviantArt 原始作品描述及 OGA 私信一手证据，但系针对该套件而非全部个人作品 | 修正文案："作者对其 DA 上发布的 RPG 图标集声明为公有领域" |
| **R1(c)** | 496 图标实际尺寸与数量 | **成立** | 实测共 496 个 PNG，尺寸 100% 均为 34×34 像素，无 32×32，无合并 Sheet | 涉及网格对齐时需按 34×34 处理或通过样式裁切为 32×32 |
| **R1(d)** | zip 内是否含 README/License | **不成立** | 压缩包内只有 496 个 PNG，完全无任何文本或许可证文件 | 仓库内若需保留授权追溯，应由我们自建 CREDITS 文件 |
| **R1(e)** | 商用/再分发自由依据 | **成立** | OGA 登记 CC0 + DA 作者声明 Public Domain + 剔除商业同人图 | 合规证据链完整可靠 |
| **R2** | 候选套件许可与红线判定 | **成立** | Kenney、josehzz、Nikoichu、Shade 均为 CC0；Kyrise 为 CC-BY 4.0；LPC 确实为 CC-BY-SA 强传染 | 严格维持"禁 LPC"红线；允许引入 Shade 与 Nikoichu 的 CC0 素材 |
| **R3(a)** | fusion-pixel-font 许可与体积 | **部分成立** | 许可确为 SIL OFL 1.1 且提供 woff2，但 12px zh_hans 大小为 651KB(OTF)/906KB(TTF) | 修正"约 450KB"断言（低估 45%），规划预算需按 651KB 核算 |
| **R3(b)** | 宝可梦字体许可与仓库 | **成立** | nue-of-k/pkmn 为 MIT License；npm 的 Johto Font 已闭源商业收费 | 必须锁定使用 `nue-of-k/pkmn`，严禁引入 Johto Font |
| **R3(c)** | Cinzel / Pirata One 中文回退 | **成立** | 两者确为 Google Fonts SIL OFL 1.1，仅含拉丁字符，中文回退 serif 极为必要 | 在 CSS font-family 显式指定系统 serif 回退 |
| **R3(d)** | Zpix 收费与 IPix/Vonwaon 瑕疵 | **成立** | Zpix 单品商用需 ￥7000；IPix 与凤凰点阵体底层字模侵权中易中标，属于争议字体 | 坚决剔除 Zpix、IPix 与凤凰点阵体，选用合法开源字体 |
| **R4** | `<img>` SVG 外部资源与 GitHub 限制 | **成立** | 浏览器规范禁止 `<img>` SVG 发起外部网络请求；内嵌 base64 字体可在 Camo 下正常显示；GH Pages MIME 确为 `image/svg+xml` | 动态徽章中的自定义像素字体必须以 base64 Data-URI 内联到 SVG |
| **R5** | js-yaml 日期解析与 Zod 影响、插件替代 | **成立** | js-yaml 默认隐式带 timestamp 将未加引号日期转为 Date，导致 Zod string 校验失败；Zod Mini 仅 2KB；构建期推荐 `@rollup/plugin-yaml` | 前端禁止运行时解析 YAML，改在构建期用 `@rollup/plugin-yaml` 转为静态 JSON |
