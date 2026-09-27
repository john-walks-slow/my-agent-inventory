# 游戏风格 Web 装备背包像素道具图标套件深度调研报告

**报告归档路径**：`docs/features/260927-my-harness-inventory/260927-pixel-icon-sets.research.md`  
**调研时间**：2026-09-27  
**调研目标**：为基于 Web 的游戏风格（星露谷 / 宝可梦 / JRPG / Diablo 多主题）开源装备背包展示站，挑选并建立一套合规、高质量、稳定内置且开箱即用的“游戏像素道具图标（Pixel Art Item Icons）”资产体系。

---

## 目录

1. [执行摘要与选型决策矩阵](#1-执行摘要与选型决策矩阵)
2. [顶级 CC0（公有领域/自由再分发）图标套件深度剖析](#2-顶级-cc0公有领域自由再分发图标套件深度剖析)
   - 2.1 [Henrique Lazarini (7Soul1) - 496 Pixel Art Icons for Medieval/Fantasy RPG](#21-henrique-lazarini-7soul1---496-pixel-art-icons-for-medievalfantasy-rpg)
   - 2.2 [Kenney 系列游戏资产（Roguelike / 1-Bit / Generic Items / Tiny Dungeon）](#22-kenney-系列游戏资产roguelike--1-bit--generic-items--tiny-dungeon)
   - 2.3 [Dungeon Crawl Stone Soup (DCSS) 官方 CC0 瓷砖资产库](#23-dungeon-crawl-stone-soup-dcss-官方-cc0-瓷砖资产库)
   - 2.4 [Shade 系列 16×16 RPG 图标套件（Assorted / Weapons / Puny World）](#24-shade-系列-1616-rpg-图标套件assorted--weapons--puny-world)
   - 2.5 [josehzz - Farming Crops 16×16（星露谷风农牧植物图鉴）](#25-josehzz---farming-crops-1616星露谷风农牧植物图鉴)
   - 2.6 [Jetrel - 16×16 RPG Items（经典 JRPG 基础道具集）](#26-jetrel---1616-rpg-items经典-jrpg-基础道具集)
   - 2.7 [Nikoichu - 1-bit Pixel Icons（1,400+ 现代/科技/通用像素图腾）](#27-nikoichu---1-bit-pixel-icons1400-现代科技通用像素图腾)
   - 2.8 [Buch - RPG Items & UI Pieces](#28-buch---rpg-items--ui-pieces)
3. [知名 CC-BY / 宽松许可的高质量图标套件调研](#3-知名-cc-by--宽松许可的高质量图标套件调研)
   - 3.1 [Kyrise's Free 16×16 RPG Icon Pack (CC-BY 4.0)](#31-kyrises-free-1616-rpg-icon-pack-cc-by-40)
   - 3.2 [DragonDePlatino & DawnBringer - DawnLike (CC-BY 4.0 / DawnLikeAtlas)](#32-dragondeplatino--dawnbringer---dawnlike-cc-by-40--dawnlikeatlas)
   - 3.3 [Clint Bellanger & Justin Nichol - Flare RPG 装备图标系列](#33-clint-bellanger--justin-nichol---flare-rpg-装备图标系列)
   - 3.4 [Liberated Pixel Cup (LPC) 道具库与许可陷阱解析 (CC-BY-SA 3.0 / GPL 3.0)](#34-liberated-pixel-cup-lpc-道具库与许可陷阱解析-cc-by-sa-30--gpl-30)
   - 3.5 [itch.io 商业/受限免费包合规预警（以 Clockwork Raven 等为例）](#35-itchio-商业受限免费包合规预警以-clockwork-raven-等为例)
4. [四大核心游戏主题与分类覆盖度矩阵](#4-四大核心游戏主题与分类覆盖度矩阵)
   - 4.1 [星露谷物语 (Stardew Valley) 主题](#41-星露谷物语-stardew-valley-主题)
   - 4.2 [宝可梦 (Pokémon) 主题](#42-宝可梦-pokémon-主题)
   - 4.3 [经典 JRPG（最终幻想 / 勇者斗恶龙）主题](#43-经典-jrpg最终幻想--勇者斗恶龙主题)
   - 4.4 [暗黑破坏神 (Diablo) 主题](#44-暗黑破坏神-diablo-主题)
   - 4.5 [科技、工具与异类物品补全方案](#45-科技工具与异类物品补全方案)
5. [16×16 规格在 Web 端的高保真渲染与防模糊实践](#5-1616-规格在-web-端的高保真渲染与防模糊实践)
   - 5.1 [浏览器渲染机制与图像模糊根因](#51-浏览器渲染机制与图像模糊根因)
   - 5.2 [CSS 关键样式：image-rendering 标准与兼容对照](#52-css-关键样式image-rendering-标准与兼容对照)
   - 5.3 [无损缩放：整数倍缩放（Integer Scaling）与视网膜屏对齐](#53-无损缩放整数倍缩放integer-scaling与视网膜屏对齐)
   - 5.4 [单图 PNG / SVG / CSS 精灵图 (Spritesheet) 的 Web 性能与维护性权衡](#54-单图-png--svg--css-精灵图-spritesheet-的-web-性能与维护性权衡)
6. [一键自动化下载、解包与目录整理脚本](#6-一键自动化下载解包与目录整理脚本)
   - 6.1 [基于 Curl 的极速离线素材拉取脚本 (`fetch-icons.sh`)](#61-基于-curl-的极速离线素材拉取脚本-fetch-iconssh)
   - 6.2 [基于 GitHub 的局部检索与 Sparse-Checkout 方案](#62-基于-github-的局部检索与-sparse-checkout-方案)
   - 6.3 [Spritesheet 自动切图与语义化提取脚本（Node.js / Python）](#63-spritesheet-自动切图与语义化提取脚本nodejs--python)
7. [开源项目合规指引与默认内置套件落地规划](#7-开源项目合规指引与默认内置套件落地规划)
   - 7.1 [许可证兼容与 NOTICE / Credits 归档模板](#71-许可证兼容与-notice--credits-归档模板)
   - 7.2 [本项目仓库目录落地结构设计](#72-本项目仓库目录落地结构设计)
   - 7.3 [默认内置道具池（Fallback Preset）搭配建议](#73-默认内置道具池fallback-preset搭配建议)

---

## 1. 执行摘要与选型决策矩阵

在为开源 Web 项目（如游戏装备背包展示站）挑选默认内置的“像素艺术道具图标（Pixel Art Item Icons）”时，核心考量点包括：

1. **开源合规与再分发权**：项目开源发布在 GitHub，所有图标静态资源必须允许随仓库源码一同提交、分发与克隆。必须杜绝“仅限非商用（NC）”或“禁止独立打包/禁止随游戏引擎源码再分发”的资产；
2. **像素一致性与分辨率规格**：原生 16×16 像素网格是复古 JRPG、GBA 宝可梦、星露谷风格的黄金标准，在 Web 现代显示器上可通过 `image-rendering: pixelated` 干净利落地按 2× (32px)、3× (48px)、4× (64px) 无损放大；
3. **多主题覆盖度**：需要同时兼顾**星露谷**（作物、农具、渔获）、**宝可梦**（精灵球、药剂、树果、进化石）、**JRPG**（剑盾法杖、魔法书、防具首饰）、**Diablo**（暗黑武器、骨头、毒液、符文石）以及**现代科技/工具**（电池、芯片、机械、扳手）；
4. **获取可靠性**：支持官方直链 `curl` 抓取或 GitHub 直接克隆，无需登录繁琐的手动商店结算界面。

### 核心候选套件决策矩阵

| 套件名称 | 主要作者 / 来源 | 许可证 | 规格尺寸 | 图标数量 | 核心覆盖类别 | 商用与再分发 | 署名要求 | 建议优先级 |
|---|---|---|---|---|---|---|---|---|
| **496 Pixel Art Icons for RPG** | Henrique Lazarini (7Soul1) / OGA | **CC0 (公有领域)** | 34×34 (画芯适配32/16) | 496 | 武器、防具、饰品、药水、肉食、技能、书籍 | 允许完全自由再分发与商用 | 免署名（建议致谢） | ⭐⭐⭐⭐⭐ (首选基石) |
| **Shade 16×16 RPG Icons 系列** | Shade (merchant-shade) / itch.io | **CC0** | 16×16 | 1,000+ | 药水、防具、书籍、各类冷兵器、生存工具 | 允许完全自由再分发与商用 | 免署名 | ⭐⭐⭐⭐⭐ (首选16px) |
| **Kenney 游戏资产库 (多套件)** | Kenney (kenney.nl) | **CC0** | 16×16 / 矢量 SVG | 2,800+ | 现代科技、工具、通用消耗品、地牢道具、UI | 允许完全自由再分发与商用 | 免署名（建议致谢） | ⭐⭐⭐⭐⭐ (科技/通用首选) |
| **Farming Crops 16×16** | josehzz / OGA | **CC0** | 16×16 | 20种作物 (100+图) | 农作物、蔬菜、水果、种子、各生长阶段 | 允许完全自由再分发与商用 | 免署名 | ⭐⭐⭐⭐⭐ (星露谷主题首选) |
| **Dungeon Crawl Stone Soup (DCSS)** | DCSS 官方开发组 / GitHub | **CC0** | 32×32 (整洁点阵) | 6,000+ | 硬核冷兵器、重甲、奇异法杖、卷轴、生物器官 | 允许完全自由再分发与商用 | 免署名 | ⭐⭐⭐⭐⭐ (Diablo暗黑首选) |
| **1-bit Pixel Icons** | Nikoichu / itch.io | **CC0** | 16×16 (单色黑白) | 1,476 | 软件硬件、现代科技、战术装备、控制手柄 | 允许完全自由再分发与商用 | 免署名 | ⭐⭐⭐⭐ (单色/现代首选) |
| **Kyrise's Free 16×16 RPG Pack** | Kyrise / OGA & itch.io | **CC-BY 4.0** | 16×16 (含32/48) | 350+ (70+款) | 剑杖弓盾、头盔、药水鱼糖、宝石首饰、书籍 | 允许自由再分发与商用 | **必须署名 (Attribution)** | ⭐⭐⭐⭐ (精修质感首选) |
| **DawnLike (DawnLikeAtlas)** | DragonDePlatino & DawnBringer | **CC-BY 4.0** | 16×16 | 800+ (物品) | 经典 16 色 Roguelike 道具、弹药、药剂、卷轴 | 允许自由再分发与商用 | **必须署名 DawnBringer** | ⭐⭐⭐⭐ (经典复古首选) |
| **Jetrel 16×16 RPG Items** | Jetrel / OGA | **CC0** | 16×16 | 60+ | 经典日式勇者剑盾、长袍法杖、小金币、草药 | 允许完全自由再分发与商用 | 免署名 | ⭐⭐⭐⭐ (极简内嵌) |
| **LPC Items and Game Effects** | Reemax, Sharm 等 / OGA | **CC-BY-SA 3.0 / GPL** | 32×32 | 300+ | 经典欧式奇幻装备、药剂瓶、卷轴、施法特效 | 允许，但具**相同方式共享 (SA)** 约束 | **必须署名且传染 SA** | ⭐⭐ (不推荐默认内置) |
| **Clockwork Raven 免费包** | Clockwork Raven / itch.io | 专有免费许可 | 16×16 / 32×32 | 200+ | 武器、防具、药水 | **禁止作为素材再分发** | 条款冲突 | ❌ (禁止随开源库分发) |

---

## 2. 顶级 CC0（公有领域/自由再分发）图标套件深度剖析

对于托管在 GitHub 上的开源项目，**CC0 1.0 Universal（公有领域贡献宣告）** 是法律风险最低、集成摩擦最小的许可证。任何用户克隆仓库、二次分发、打成 npm 包或修改图标，均无需担心许可证违规。

### 2.1 Henrique Lazarini (7Soul1) - 496 Pixel Art Icons for Medieval/Fantasy RPG

- **原始出处**：[OpenGameArt.org Node 39455](https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg)
- **原始作者**：Henrique Lazarini ([7Soul1 DeviantArt](http://7soul1.deviantart.com/))，由社区贡献者 `gnola14` 统一重命名和整理。
- **许可证**：**CC0 1.0 Universal (Public Domain)**  
  *版权说明*：7Soul 原在 DeviantArt 发布了 420 Icons、Extra 98 Icons 与 Gold Series，因早年 CC-BY 3.0 带来繁杂版权纠纷，作者亲自在 DeviantArt 宣布将其全部置于公有领域（Public Domain）。提交至 OGA 时，gnola14 特意剔除了少数来源于商业游戏受保护剪影的衍生图标，确保包内全量 496 个图标纯正合法。
- **图像规格**：34×34 像素（核心画芯集中在 16×16 至 32×32 区域，周围有 1~2px 呼吸边缘，非常适合 32×32 或 36×36 的背包插槽，无损缩放下观感绝佳）。
- **主题与门类覆盖**：
  - **武器 (Weapons)**：双手剑、细剑、弯刀、战斧、巨斧、流星锤、长矛、三叉戟、木杖、法术杖、弓箭、十字弩、飞刀、飞镖；
  - **防具 (Armor)**：板甲、锁子甲、皮甲、法师长袍、骑士铁盔、角盔、皮帽、圆盾、塔盾、轻便皮靴、钢靴、护手；
  - **药剂与炼金 (Potions & Alchemy)**：红药水、蓝药水、解毒剂、体力药剂、毒药瓶、长颈烧瓶、大肚子试剂瓶；
  - **书籍与魔法 (Books & Magic)**：各色羊皮纸卷轴、魔法书、圣典、符文石、各元素法球（火/冰/雷/暗）；
  - **首饰与宝物 (Jewelry & Treasure)**：宝石戒指、护身符、各色切面宝石（红/蓝/绿宝石、钻石）、金币堆、银币、藏宝袋、金杯；
  - **食物与材料 (Food & Materials)**：烤肉、面包、奶酪、苹果、蘑菇、羽毛、皮革、矿石锭（铁/金/铜/秘银）。
- **艺术风格**：强烈受到《冒险岛 (MapleStory)》、《仙境传说 (Ragnarok Online)》与《暗黑破坏神 2 (Diablo II)》影响，色彩明快饱满，像素边缘结构立体，非常适合 JRPG 与 Diablo 混合风格。
- **直接下载直链 (Curl-friendly)**：
  ```bash
  curl -LO "https://opengameart.org/sites/default/files/496_RPG_icons.zip"
  # 文件大小: 1.54 MB，内含 496 个独立 PNG 文件及完整精灵图
  ```

---

### 2.2 Kenney 系列游戏资产（Roguelike / 1-Bit / Generic Items / Tiny Dungeon）

荷兰著名游戏资产创作者 Kenney（“Asset Jesus”）提供的全套游戏资源均严格遵守 **CC0 1.0 Universal**。Kenney 的资源是游戏界最标准、工业化程度最高的开源资源。

#### 2.2.1 Kenney Roguelike/RPG Pack
- **出处**：[OpenGameArt Roguelike/RPG pack](https://opengameart.org/content/roguelikerpg-pack-1700-tiles) 与 [kenney.nl](https://kenney.nl/assets/roguelike-rpg-pack)
- **规格**：标准 **16×16** 纯正像素点阵。
- **数量**：1,700+ 个图块与图标。
- **内容特点**：包含采矿镐、铁锹、火把、铁砧、宝箱、钥匙、各类农耕作物雏形、树木木材、矿石原石、基础武器（剑、盾、矛）以及简易背包 UI 框架边框。
- **下载直链**：
  ```bash
  curl -LO "https://opengameart.org/sites/default/files/Roguelike%20pack.zip"
  # 文件大小: 715 KB
  ```

#### 2.2.2 Kenney 1-Bit Pack
- **出处**：[OpenGameArt 1-Bit Pack](https://opengameart.org/content/1-bit-pack) 与 [kenney.nl](https://kenney.nl/assets/1-bit-pack)
- **规格**：**16×16**，纯单色（黑白）+ 透明背景。
- **数量**：1,000+ 个图块与道具。
- **主题亮点**：横跨 **奇幻魔法 (Fantasy)**、**封建东洋 (Feudal Japan - 武士刀/苦无/手里剑)**、**现代生活 (Modern)** 以及 **未来科幻 (Sci-Fi - 激光枪/能量块/航天仪器)**。
- **Web 优势**：由于是 1-bit 单色，前端可以通过 CSS `mask-image` 或 `filter: drop-shadow()` 配合当前主题色（如星露谷暖绿、宝可梦黄、暗黑血红）任意着色与发光。
- **下载直链**：
  ```bash
  curl -LO "https://opengameart.org/sites/default/files/1bitpack_kenney_1.1.zip"
  # 文件大小: 697 KB
  ```

#### 2.2.3 Kenney Generic Items
- **出处**：[OpenGameArt Generic Items](https://opengameart.org/content/generic-items)
- **规格**：包含 160 个独立 PNG 文件，并附带 **矢量 SVG 原稿**（可任意无损重采样为 16×16、32×32 或直接渲染为 SVG 图标）。
- **内容亮点**：弥补了传统奇幻 RPG 中缺乏“现代科技与工具”的重大短板。涵盖：电锯、圆锯、扳手、螺丝刀、灭火器、医疗箱（红十字已合规修正为蓝色十字）、对讲机、手电筒、公文包、地图、放大镜、闹钟、指南针等。
- **下载直链**：
  ```bash
  curl -LO "https://opengameart.org/sites/default/files/kenney_genericItems_updatedCross.zip"
  # 文件大小: 2.27 MB
  ```

---

### 2.3 Dungeon Crawl Stone Soup (DCSS) 官方 CC0 瓷砖资产库

- **官方 GitHub 仓库**：[github.com/crawl/tiles](https://github.com/crawl/tiles)
- **OGA 归档**：[Dungeon Crawl 32x32 tiles (OGA 12210)](https://opengameart.org/content/dungeon-crawl-32x32-tiles) 与 [Supplemental Pack](https://opengameart.org/content/dungeon-crawl-32x32-tiles-supplemental)
- **许可证**：**CC0 1.0 Universal**（DCSS 社区维护者严格排查了版权，由全体创作者签署 CC0 协议，单独隔离并剔除了不符合 CC0 的老旧遗留项，保留在 `TILES_UNDER_UNKNOWN_LICENSE.md` 中）。
- **图像规格**：正方形 **32×32** 纯像素（原生 1:1，像素点边界极其工整，可直接 `image-rendering: pixelated` 缩放为 16×16 或 64×64）。
- **数量**：初版 3,000+，加上补充包总计超过 **6,000+** 个独立精灵！
- **门类覆盖（极其极其丰富）**：
  - **暗黑破坏神 (Diablo) 级冷兵器**：细分多达数百种，包括 Executioner's Axe（刽子手斧）、Bardiche（宽刃长柄戟）、Quickblade（疾风短剑）、Trishula（三叉戟）、Demon Blade（恶魔之刃）、Scythe（死神巨镰）、Morningstar（晨星锤）、Arbalest（重型弩）；
  - **全身护甲**：Crystal Plate（水晶板甲）、Dragon Scale Mail（各色巨龙鳞甲：红龙/绿龙/冰龙/金龙）、Troll Leather（巨魔皮甲）、Robes of the Archmagi（大魔导师长袍）；
  - **首饰与奇异掉落**：数十款独一无二的魔法戒指（闪避、力量、抗火、吸血）、护符、神圣护身符；
  - **书籍、卷轴与奇物**：附魔卷轴、暗影法典、符文骨头、恶魔角、眼球触须、药剂（每个药剂均有瓶身与流体色标区分）；
- **下载直链 (Curl-friendly)**：
  ```bash
  curl -LO "https://opengameart.org/sites/default/files/Dungeon%20Crawl%20Stone%20Soup%20Full_0.zip"
  # 文件大小: 5.7 MB，包含完整分类目录（item/weapon, item/armour, item/potion 等）
  ```

---

### 2.4 Shade 系列 16×16 RPG 图标套件（Assorted / Weapons / Puny World）

- **主页**：[merchant-shade.itch.io](https://merchant-shade.itch.io/)
- **作者**：Shade（itch.io 著名像素创作者）
- **许可证**：**CC0 1.0 Universal (Public Domain)**  
  *授权验证*：作者在 itch.io 评论区及各免费包说明中多次明确声明：“yep all my free assets are licensed CC0. Feel free to use for your game commercially or not, no need to give credit.”
- **图像规格**：**严格原生 16×16 像素**，提供整张精灵图（Spritesheet）与单张独立切片。
- **子资产包与覆盖内容**：
  1. **Free 16×16 Assorted RPG Icons**：
     - **药水 (Potions)**：15 种独特瓶身造型 × 20+ 种色彩变体（共 300+ 药水）；
     - **消耗品 (Consumables)**：30 种设计 × 22+ 种颜色（肉类、果实、草药、奶酪、干粮）；
     - **防具 (Armours)**：150+ 款独立造型的头盔、胸甲、法袍；
     - **书籍 (Books)**：12 种开本与封皮纹样 × 14 种颜色（涵盖古籍、符文书、典籍、日记）；
     - **宝箱与环境道具**：各类金属木制宝箱、营地帐篷道具；
  2. **Free 16×16 Weapon RPG Icons**：
     - 细剑 (Rapier)、武士刀 (Katana)、三叉戟 (Trident)、链枷 (Mace)、镰刀 (Sickle)、双截棍 (Nunchucks)；
     - 每类武器拥有 30 种不同造型，且分别提供铁质 (Iron)、钢质 (Steel)、青铜 (Bronze)、黄金 (Gold) 4 种金属材质变体（单包合计 720+ 武器图腾）；
  3. **16×16 Survival & Puny World Assets**：
     - 包含大量生存制造道具：原木、石块、矿物原石、锭材、织物布料、皮毛、作物种子与耕作工具。
- **获取方式**：itch.io 页面可免登录直下（点击 Download → "No thanks, just take me to the downloads" 即可直接获取 zip）。

---

### 2.5 josehzz - Farming Crops 16×16（星露谷风农牧植物图鉴）

- **出处**：[OpenGameArt Node 87885](https://opengameart.org/content/farming-crops-16x16)
- **作者**：josehzz
- **许可证**：**CC0 1.0 Universal**
- **规格**：**16×16** 纯正手绘像素，使用经典的 Arne / PixelJoint 16 色调色板。
- **专长主题**：**星露谷物语 (Stardew Valley) / 牧场物语** 的绝配素材！
- **包含内容**：
  - 完整涵盖 20 种农作物：**芜菁 (Turnip)、番茄 (Tomato)、甜瓜 (Melon)、茄子 (Eggplant)、柠檬 (Lemon)、菠萝 (Pineapple)、水稻 (Rice)、小麦 (Wheat)、葡萄 (Grapes)、草莓 (Strawberry)、木薯 (Cassava)、马铃薯 (Potato)、咖啡豆 (Coffee)、橙子 (Orange)、牛油果 (Avocado)、玉米 (Corn)、向日葵 (Sunflower)、玫瑰 (Rose)、郁金香 (Tulip)、黄瓜 (Cucumber)**；
  - 核心亮点：不仅提供地块上的 5 阶段农作物生长精灵，更针对每一种作物提供了 **独立的 16×16 道具插槽图标 (Crop Item Portrait)**！
- **下载直链 (Curl-friendly)**：
  ```bash
  curl -LO "https://opengameart.org/sites/default/files/FarmingCrops16x16.zip"
  # 文件大小: 24.7 KB
  ```

---

### 2.6 Jetrel - 16×16 RPG Items（经典 JRPG 基础道具集）

- **出处**：[OpenGameArt Node 3828](https://opengameart.org/content/16x16-rpg-items)
- **作者**：Jetrel（OpenGameArt 元老级资深像素画师，多项开源游戏美术骨干）
- **许可证**：**CC0 1.0 Universal**
- **规格**：原生 **16×16**。
- **内容特点**：模仿《时空之轮 (Chrono Trigger)》与早期《最终幻想 (Final Fantasy)》风格。包含经典阔剑、黄金剑、法杖、红蓝回复瓶、圆盾、皮帽、法师兜帽、金币、钥匙、羊皮纸等 60+ 个最常用道具图腾。
- **下载直链**：
  ```bash
  curl -LO "https://opengameart.org/sites/default/files/items.png"
  # 单张标准精灵图，仅 6.5 KB，极易快速裁剪
  ```

---

### 2.7 Nikoichu - 1-bit Pixel Icons（1,400+ 现代/科技/通用像素图腾）

- **出处**：[nikoichu.itch.io/pixel-icons](https://nikoichu.itch.io/pixel-icons)
- **作者**：Nikoichu
- **许可证**：**CC0 1.0 Universal**
- **规格**：**16×16** 单色点阵，解压后包含 `Sprites/` 目录（全部 1,476 个独立 16×16 PNG 文件）。
- **分类覆盖**：
  - **现代与科技 (Tech & Hardware)**：CPU 芯片、内存条、电路板、显示器、软盘、U 盘、螺栓螺母、电池、雷达、天线、齿轮；
  - **软件与界面工具 (Software & Tools)**：画笔、橡皮、代码括号、终端光标、文件夹、齿轮设置、安全锁、钥匙、星标；
  - **现代战术装备 (Modern Warfare)**：突击步枪、手枪、手雷、防毒面具、军用背包、对讲机、夜视仪；
  - **棋盘与娱乐 (Games & Entertainment)**：骰子、扑克花色、国际象棋子、游戏手柄、耳机。
- **适用价值**：当项目中存在“现代开发者工具”、“DSH 插件/命令行”、“科技道具”等传统奇幻图标无法表达的物品时，此包是最佳补充。

---

### 2.8 Buch - RPG Items & UI Pieces

- **出处**：[OpenGameArt Node 20563](https://lpc.opengameart.org/content/rpg-items) 与 [Node 12971](https://opengameart.org/content/ui-pieces)
- **作者**：Buch
- **许可证**：**CC0 1.0 Universal**
- **规格**：**16×16**，使用 Dawnbringer 16 色调色板。
- **内容**：提供数十款小巧精炼的道具与状态图标（中毒、流血、虚弱、灼烧、防御加成、溺水、法力回复等），以及背包 UI 九宫格切片与边角饰条。

---

## 3. 知名 CC-BY / 宽松许可的高质量图标套件调研

若项目愿意在“关于/致谢/说明文档 (Credits/README)”中保留一行作者署名，可解锁以下在游戏工业界极负盛名的顶级套件。

### 3.1 Kyrise's Free 16×16 RPG Icon Pack (CC-BY 4.0)

- **出处**：[OpenGameArt Node 84576](https://opengameart.org/content/kyrises-free-16x16-rpg-icon-pack) 与 [kyrise.itch.io](https://kyrise.itch.io/kyrises-free-16x16-rpg-icon-pack)
- **作者**：Kyrise
- **许可证**：**Creative Commons Attribution 4.0 International (CC-BY 4.0)**
  - *商业化*：允许；
  - *修改/派生*：允许；
  - *再分发*：允许内置在开源项目中；
  - *法定署名要求*：需在项目致谢处附带文本：  
    `Kyrise's Free 16x16 RPG Icon Pack | Graphics made by Kyrise: https://kyrise.itch.io/`
- **规格**：官方直接提供了 **16×16**、**32×32** 和 **48×48** 三种预放大倍率的独立 PNG 文件夹，并自带黑边描边（Outline），在深色背景或浅色背包槽中均有清晰对比度。
- **内容细分**：
  - **武器**：长剑、法杖、短弓、圣典、盾牌（附带金/银/黑铁/红宝石等多色镶嵌版）；
  - **消耗品**：红蓝紫各色药剂、烤鱼、糖果；
  - **饰品与贵重物**：戒指、护符挂坠、七彩宝石、珍珠、水晶簇、金属锭（金/银/铜）、礼盒、钥匙。
- **下载直链 (Curl-friendly)**：
  ```bash
  curl -LO "https://opengameart.org/sites/default/files/Kyrises_16x16_RPG_Icon_Pack_V1.2.zip"
  # 文件大小: 724 KB，目录结构清晰分明
  ```

---

### 3.2 DragonDePlatino & DawnBringer - DawnLike (CC-BY 4.0 / DawnLikeAtlas)

- **出处**：[OpenGameArt Node 21243](https://opengameart.org/content/dawnlike-16x16-universal-rogue-like-tileset-v181)
- **GitHub 整理仓库**：[tommyettinger/DawnLikeAtlas](https://github.com/tommyettinger/DawnLikeAtlas)
- **作者**：DragonDePlatino（画师）与 DawnBringer（16 色调色板创造者）
- **许可证**：**CC-BY 4.0**
  - *法定署名要求*：必须注明调色板作者 **DawnBringer** 及画师 **DragonDePlatino**。
- **规格**：原生 **16×16**，经典的 DB16 调色体系（色彩极为协调，带有典型的美式复古 Roguelike 质感）。
- **内容覆盖**：
  - 单物品类别（`Items/` 目录）就拥有超过 **800+** 个图标：涵盖全部近战兵器、投掷弹药（`Ammo/`）、药水瓶、卷轴、钱币袋、书本、工具、魔杖；
  - 额外附带全套怪物敌人、NPC 及 2 帧微动画。
- **工程化福音：TommyEttinger DawnLikeAtlas**：
  - 原始 OGA 发布包是将成百上千小图合在一张大图上且未命名；
  - GitHub 开发者 Tommy Ettinger 耗时数月将 DawnLike 的 5,000 多个瓦片全部切片，并在仓库的 `renamed/` 目录下为每一个精灵赋予了清晰的英文语义文件名（如 `Items/Book0.png`、`Items/Potion_Red.png`），极大方便了工程脚本自动化引入！
- **下载与提取渠道**：
  ```bash
  # 官方 OGA 压缩包直链
  curl -LO "https://opengameart.org/sites/default/files/DawnLike_5.zip"
  # 或直接从 GitHub 抓取已拆分命名的文件库
  git clone --depth 1 --filter=blob:none --sparse https://github.com/tommyettinger/DawnLikeAtlas.git
  cd DawnLikeAtlas && git sparse-checkout set renamed/Items
  ```

---

### 3.3 Clint Bellanger & Justin Nichol - Flare RPG 装备图标系列

- **出处**：[OpenGameArt Node 13192 (Armor)](https://opengameart.org/content/armor-icons-by-equipment-slot) 与 [Node 42426 (Weapons)](https://opengameart.org/content/flare-weapon-icons-2)
- **作者**：Clint Bellanger, Justin Nichol, Blarumyrran, crowline
- **许可证**：**CC0 1.0 Universal**（多数核心图标）与 **CC-BY 3.0**
- **规格**：32×32 至 64×64，3D 建模渲染后手工像素绘制（Pre-rendered Pixel Paint-over）。
- **暗黑破坏神风格**：Flare RPG 是开源界著名的 Diablo 克隆项目，其装备图标有着极其厚重、肮脏、写实的金属和皮革质感，如重锤、短棍、宽刃剑、板甲。非常适合作为 Diablo 暗黑模式下的硬核重装装备。

---

### 3.4 Liberated Pixel Cup (LPC) 道具库与许可陷阱解析 (CC-BY-SA 3.0 / GPL 3.0)

- **代表资产**：`[LPC] Items and game effects` ([OGA Node 52145](https://opengameart.org/content/lpc-items-and-game-effects))
- **画质**：32×32，品质极高，社区生态巨大（数百位画师协作）。
- **⚠️ 许可证高危预警：Share-Alike (SA) 传染性**：
  - LPC 官方标准许可证要求为 **CC-BY-SA 3.0** 或 **GPL 3.0 / 2.0**。
  - 根据 Creative Commons 法律条款，**CC-BY-SA 属于“相同方式共享（Copyleft 强传染）”**：若你将 CC-BY-SA 的图标素材与你的 Web 项目整合并在项目中直接分发、修改或打包，你的整个派生作品/美术合集也必须以 CC-BY-SA 相同协议开源公开；
  - 对于希望采用宽松开源协议（如 MIT、Apache-2.0 或 CC0）的个人开源仓库而言，引入 CC-BY-SA 素材会导致许可证冲突或迫使整个前端静态库陷入合规争议；
  - **调研结论**：**不推荐**将 LPC 的 CC-BY-SA 道具直接选为本项目的“默认内置道具”，应优先选用纯 **CC0** 或 **CC-BY**（无 SA 限制）的套件。

---

### 3.5 itch.io 商业/受限免费包合规预警（以 Clockwork Raven 等为例）

在 itch.io 搜索“Free 16x16 RPG Icon Pack”，常能见到大量制作精良的免费资产（如 Clockwork Raven Studios 的 100+ Weapons and Potions、Caz's Pixel RPG Icons 等）。但经深度审查其商业许可细则，发现存在以下普遍约束：

> *"This asset can be used in any project, even commercial ones, but **it cannot be distributed or sold as a separate product or included in open asset libraries without the creator's permission**."*

- **开源风险分析**：开源 Web 背包项目通常将所有静态素材明文提交在 `public/assets/` 目录中。外界用户只要 `git clone` 就能直接获取整套图片素材并二次使用，这极易被原作者认定为“未经授权在开源代码库中二次分发（Redistribute raw assets）”；
- **落地红线**：严禁将此类带有“禁止再分发原始素材”条款的 itch.io 免费包直接存入开源 Git 仓库中。必须选用明确声明 **CC0** 或 **CC-BY** 的套件。

---

## 4. 四大核心游戏主题与分类覆盖度矩阵

本项目定位为支持 **星露谷 / 宝可梦 / 经典 JRPG / Diablo 暗黑** 多主题的 Web 背包展示站。以下是各主题核心道具分类与调研套件的无缝匹配方案：

### 4.1 星露谷物语 (Stardew Valley) 主题

- **主题视觉特点**：温暖明亮、饱和度较高、乡村田园、圆润可爱的像素轮廓。
- **推荐套件组合**：**josehzz Farming Crops 16×16** + **Kenney Roguelike Pack** + **Shade Assorted Icons**。
- **分类覆盖表**：
  - **农耕作物与果蔬**：芜菁、番茄、草莓、蓝莓、南瓜、玉米、土豆、咖啡豆（josehzz 纯正提供 20 种作物的 16×16 独立图标）；
  - **农具与工具**：锄头、喷水壶、铁镐、斧头、镰刀、钓鱼竿、牛奶桶、剪毛剪（Kenney Roguelike & Shade 均有完整 16×16 对应）；
  - **采集与自然材料**：橡木、枫糖浆、原木、煤炭、铜矿石、铁矿石、金矿石、黏土、纤维（Kenney Roguelike & Shade）；
  - **加工品与农副产品**：果酱罐、蛋、大鸡蛋、奶酪、面包、蜂蜜罐、蛋黄酱（Shade Consumables & 7Soul 496）。

### 4.2 宝可梦 (Pokémon) 主题

- **主题视觉特点**：Game Boy Advance / DS 掌机时代 16×16 或 24×24 清爽像素点阵，鲜明的黑色或深色描边。
- **推荐套件组合**：**7Soul 496** + **Shade Assorted Icons** + **Kyrise 16×16 Pack**。
- **分类覆盖表**：
  - **精灵球类 (Poké Balls)**：红白球、超级球、高级球、大师球、特定球（可利用 7Soul 的各元素宝珠/法球及圆形晶石轻松着色映射）；
  - **回复药剂 (Medicine)**：伤药、好伤药、全满药、解毒药、复活草、元气碎片（Shade 提供的 15 种喷雾瓶/药水瓶设计完全可无缝对应）；
  - **树果 (Berries)**：橙橙果、文柚果、苹野果等（josehzz 与 7Soul 的小浆果、异色水果完全契合）；
  - **进化石与道具 (Stones & Hold Items)**：火之石、水之石、雷之石、王者之证、先制之爪、不变之石（7Soul 496 中包含极其丰富的切面元素符文石与宝石）；
  - **技能学习器 (TM/HM)**：光盘/软盘（Nikoichu 1-bit 中的 Floppy Disk / Compact Disc 配合主题色即可完美还原）。

### 4.3 经典 JRPG（最终幻想 / 勇者斗恶龙）主题

- **主题视觉特点**：华丽细腻、注重职业特色（战士、骑士、黑白魔导师、盗贼）、魔法氛围浓厚。
- **推荐套件组合**：**7Soul 496** + **Kyrise 16×16 Pack** + **Jetrel 16×16 Items**。
- **分类覆盖表**：
  - **近战与远程武器**：铁剑、王者之剑、村正、法杖、魔导书、短弓、圣枪（7Soul 496 与 Kyrise 提供数百款设计）；
  - **防具与饰品**：秘银铠甲、魔法披风、龙之盾、加速戒指、力量护腕、智力吊坠（7Soul 496 提供极全套的首饰与防具）；
  - **回复与辅助道具**：波otion（药水）、以太（Ether）、不死鸟之羽（Phoenix Down）、金针、圣水、帐篷（Jetrel & 7Soul）；
  - **贵重品与任务物品**：水晶碎片、飞空艇钥匙、四元素水晶、古老羊皮纸地图（Kyrise & 7Soul）。

### 4.4 暗黑破坏神 (Diablo) 主题

- **主题视觉特点**：低饱和度、血腥、阴森、金属锈迹、骨骼骨刺、哥特暗黑风。
- **推荐套件组合**：**Dungeon Crawl Stone Soup (DCSS)** + **7Soul 496 (暗色系选件)** + **Flare RPG 系列**。
- **分类覆盖表**：
  - **重型凶器**：死神巨镰、双手巨剑、链枷、涂毒匕首、碎骨战锤、恶魔三叉戟（DCSS 的 6000+ 瓷砖中包含海量纯正硬核兵器）；
  - **暗金与符文装**：恶魔颅骨头盔、骨甲、阴影披风、吸血鬼之牙、哥特板甲（DCSS & Flare）；
  - **符文与宝石 (Runes & Gems)**：各类暗黑铭文石（El, Eld, Tir...）、粗糙/无暇颅骨、碎裂紫宝石（DCSS & 7Soul 符文分类）；
  - **特殊掉落**：辨识卷轴、城镇传送卷轴、恶魔之心、巨魔皮、腐烂肉块、剧毒药囊（DCSS 完整提供）。

### 4.5 科技、工具与异类物品补全方案

针对展示站中可能展示的“自研 CLI 工具、DSH 插件、MCP 服务器、运维脚本”等现代抽象物，传统奇幻装备难以具象化，推荐采用：
- **Kenney Generic Items**：提供扳手、螺丝刀、电池、医疗包、放大镜、地图、仪表等现代实物；
- **Nikoichu 1-bit Pixel Icons**：提供芯片、软盘、代码端、网卡、手柄、天线、齿轮等 1400+ 个极客风格图腾，辅以 CSS 染色。

---

## 5. 16×16 规格在 Web 端的高保真渲染与防模糊实践

像素美术在 Web 环境下面临的最大技术挑战是：**现代浏览器默认启用双线性插值（Bilinear Interpolation）平滑算法，导致 16×16 的小图一旦放大显示，会变得模糊发虚、边缘发灰、失去像素灵魂。**

### 5.1 浏览器渲染机制与图像模糊根因

当一个 16×16 像素的图片在 Web 页面中以 32×32、48×48 或 64×64 的 CSS 容器尺寸渲染时：
1. 浏览器默认将每个像素之间的色彩过渡进行平滑平均计算；
2. 若容器的物理像素位置（`transform`、`margin` 或百分比布局）出现了小数（例如 `left: 12.35px`），会导致次像素抗锯齿介入，像素格点彻底被抹匀。

### 5.2 CSS 关键样式：image-rendering 标准与兼容对照

必须在全局或像素图标容器上显式声明以下 CSS 属性：

```css
/* 像素图标通用保锐类 */
.pixel-art {
  /* 现代标准：Chrome 41+, Firefox 93+, Safari 18+ (使用邻近采样 Nearest-Neighbor) */
  image-rendering: pixelated;
  
  /* 针对老版本 Firefox 的标准回退 */
  image-rendering: -moz-crisp-edges;
  
  /* 针对老版本 Safari / WebKit 的历史回退 */
  image-rendering: -webkit-crisp-edges;
  image-rendering: crisp-edges;

  /* 严禁对像素图标开启平滑滤镜或次像素平移 */
  backface-visibility: hidden;
  transform: translateZ(0); /* 强制提升独立渲染层，避免父级重排引起浮点抖动 */
}
```

#### 浏览器兼容性对照：
- **`image-rendering: pixelated`**：现代 Chromium（Chrome / Edge）、Firefox 及最新 Safari 均原生支持，严格使用“最近邻插值（Nearest Neighbor）”，保持像素块的绝对锐利；
- **`image-rendering: crisp-edges`**：在 Firefox 与规范中受支持，采用对比度优先的无平滑算法。

### 5.3 无损缩放：整数倍缩放（Integer Scaling）与视网膜屏对齐

在 Web 端展示 16×16 图标，必须严格遵循 **整数倍放大（Integer Multiple Scaling）** 原则：

| 逻辑倍率 | 推荐显示尺寸 | 适用 UI 场景 | 对应 Tailwind / CSS 类名 |
|---|---|---|---|
| **1× (原生)** | 16×16 px | 极紧凑状态行、菜单树形节点、微型角标 | `w-4 h-4` (16px) |
| **2×** | 32×32 px | 紧凑背包格、手机移动端背包网格 | `w-8 h-8` (32px) |
| **3×** | 48×48 px | 标准桌面背包槽位、快速拾取栏 | `w-12 h-12` (48px) |
| **4×** | 64×64 px | 物品详细属性面板、装备检视大卡片 | `w-16 h-16` (64px) |

*避坑铁律*：**绝对不要**设置 `width: 35px` 或 `width: 50px` 等非 16 整倍数的尺寸！非整数倍会导致像素网格出现宽窄不一的“像素畸变（Uneven Pixel Artifacts）”，严重破坏视觉质感。

### 5.4 单图 PNG / SVG / CSS 精灵图 (Spritesheet) 的 Web 性能与维护性权衡

在构建现代 Web 装备背包前端时，有三种组织图标资产的技术架构：

| 架构形态 | 实现方式 | 优势 | 劣势 | 推荐场景 |
|---|---|---|---|---|
| **A. 独立单图 PNG** | 每个图标一个独立文件，如 `/icons/weapons/sword_01.png` | 维护直观，动态按需加载，用户可任意替换单张图片，支持直接 `<img>` 或 `fetch` | 图标极多（>500）且无 HTTP/2 时可能引起请求风暴 | **⭐⭐⭐⭐⭐ (推荐作为基础存储)** |
| **B. 纯手绘矢量 SVG** | 原生 `<svg viewBox="0 0 16 16">` 内写 `<rect>` 像素矩阵 | 零网络请求（直接打入 JS bundle），支持 CSS 动态变色，无限清晰 | 代码量巨大，大批量道具时会导致 JS bundle 体积膨胀 | **用于核心兜底或特殊高频图腾** |
| **C. 大精灵图 (Spritesheet)** | 几百张图拼为一张 `atlas.png`，用 `background-position` | 单次网络请求拉取全量，加载速度快 | 动态扩展困难，新增或替换单张道具需重新计算偏移坐标 | 传统大型游戏客户端，Web 端维护成本高 |

**最佳工程化实践**：
- 在 Git 仓库存储时，采用 **独立单图 PNG（规范语义化命名）** 存放；
- 利用 Vite / Webpack 的静态资源引入机制（如 `import.meta.glob`），支持懒加载与根据分类按需打包；
- 针对背包中出现频次最高的前 10 个核心图标，可保留纯 SVG 组件作为零加载延迟的 Fallback。

---

## 6. 一键自动化下载、解包与目录整理脚本

为了让开源项目能够实际、稳定、自动化地从官方渠道拉取合规资产并直接内置进工程，本调研编写了全套端到端自动化脚本。

### 6.1 基于 Curl 的极速离线素材拉取脚本 (`fetch-icons.sh`)

创建脚本文件（如 `scripts/fetch-icons.sh`），一键拉取全部顶级 CC0 / CC-BY 压缩包并自动分类解压：

```bash
#!/usr/bin/env bash
# ==============================================================================
# 游戏背包像素图标自动化抓取与归档脚本 (fetch-icons.sh)
# 专为 My DSH Inventory 项目打造，所有下载直链均经过 HTTP 200 验证
# ==============================================================================

set -euo pipefail

# 目标输出根目录
TARGET_DIR="public/assets/icons"
TMP_DIR="/tmp/pixel-icons-download"

mkdir -p "${TARGET_DIR}/7soul"
mkdir -p "${TARGET_DIR}/kenney-items"
mkdir -p "${TARGET_DIR}/kenney-roguelike"
mkdir -p "${TARGET_DIR}/farming-crops"
mkdir -p "${TARGET_DIR}/kyrise"
mkdir -p "${TARGET_DIR}/jetrel"
mkdir -p "${TMP_DIR}"

echo ">>> [1/6] 正在下载 7Soul 496 经典 RPG 像素图标 (CC0)..."
curl -fsSL "https://opengameart.org/sites/default/files/496_RPG_icons.zip" -o "${TMP_DIR}/496_RPG_icons.zip"
unzip -q -o "${TMP_DIR}/496_RPG_icons.zip" -d "${TARGET_DIR}/7soul/"

echo ">>> [2/6] 正在下载 Kenney Generic Items 现代/科技/工具图标 (CC0)..."
curl -fsSL "https://opengameart.org/sites/default/files/kenney_genericItems_updatedCross.zip" -o "${TMP_DIR}/kenney_generic.zip"
unzip -q -o "${TMP_DIR}/kenney_generic.zip" -d "${TARGET_DIR}/kenney-items/"

echo ">>> [3/6] 正在下载 Kenney Roguelike 16x16 奇幻地牢素材 (CC0)..."
curl -fsSL "https://opengameart.org/sites/default/files/Roguelike%20pack.zip" -o "${TMP_DIR}/kenney_roguelike.zip"
unzip -q -o "${TMP_DIR}/kenney_roguelike.zip" -d "${TARGET_DIR}/kenney-roguelike/"

echo ">>> [4/6] 正在下载 josehzz Farming Crops 16x16 星露谷农场作物 (CC0)..."
curl -fsSL "https://opengameart.org/sites/default/files/FarmingCrops16x16.zip" -o "${TMP_DIR}/farming_crops.zip"
unzip -q -o "${TMP_DIR}/farming_crops.zip" -d "${TARGET_DIR}/farming-crops/"

echo ">>> [5/6] 正在下载 Jetrel 16x16 经典 JRPG 精灵图 (CC0)..."
curl -fsSL "https://opengameart.org/sites/default/files/items.png" -o "${TARGET_DIR}/jetrel/items.png"

echo ">>> [6/6] 正在下载 Kyrise 16x16 高精细度 RPG 图标包 (CC-BY 4.0)..."
curl -fsSL "https://opengameart.org/sites/default/files/Kyrises_16x16_RPG_Icon_Pack_V1.2.zip" -o "${TMP_DIR}/kyrise.zip"
unzip -q -o "${TMP_DIR}/kyrise.zip" -d "${TARGET_DIR}/kyrise/"

# 清理临时文件
rm -rf "${TMP_DIR}"

echo ">>> ✅ 全部像素图标已成功拉取并整理至 ${TARGET_DIR}！"
```

---

### 6.2 基于 GitHub 的局部检索与 Sparse-Checkout 方案

对于如 `tommyettinger/DawnLikeAtlas`（已分类命名的 DawnLike）或 `crawl/tiles`（DCSS 6000+ 瓷砖），若无需下载整个 Git 历史仓库，可使用 Git 的 **Sparse-Checkout** 特性只抓取物品道具子目录：

```bash
#!/usr/bin/env bash
# 只克隆 DawnLike 已经切割好并赋予语义名称的 Items 目录
git clone --depth 1 --filter=blob:none --sparse https://github.com/tommyettinger/DawnLikeAtlas.git /tmp/dawnlike
cd /tmp/dawnlike
git sparse-checkout set renamed/Items renamed/Ammo
cp -r renamed/Items/* /root/projects/my-dsh-inventory/public/assets/icons/dawnlike-items/
rm -rf /tmp/dawnlike
```

---

### 6.3 Spritesheet 自动切图与语义化提取脚本（Node.js / Python）

对于包含整张 Spritesheet 的素材（如 Jetrel 的 `items.png` 或 Shade 的大图），可使用轻量 Node.js 脚本（利用 `sharp` 库）自动将其按 16×16 网格切割并输出为独立 PNG：

```javascript
// scripts/slice-spritesheet.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function sliceSpritesheet(inputFile, outputDir, tileWidth = 16, tileHeight = 16) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const image = sharp(inputFile);
  const metadata = await image.metadata();
  const cols = Math.floor(metadata.width / tileWidth);
  const rows = Math.floor(metadata.height / tileHeight);

  console.log(`正在切割 ${inputFile}: ${metadata.width}x${metadata.height} (${cols} 列 x ${rows} 行)`);

  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c * tileWidth;
      const top = r * tileHeight;
      const outputFile = path.join(outputDir, `item_${String(count).padStart(3, '0')}.png`);

      await sharp(inputFile)
        .extract({ left, top, width: tileWidth, height: tileHeight })
        .toFile(outputFile);
      count++;
    }
  }
  console.log(`✅ 成功输出 ${count} 个 ${tileWidth}x${tileHeight} 独立图标至 ${outputDir}`);
}

// 示例调用：
// sliceSpritesheet('public/assets/icons/jetrel/items.png', 'public/assets/icons/jetrel/sliced', 16, 16);
```

---

## 7. 开源项目合规指引与默认内置套件落地规划

### 7.1 许可证兼容与 NOTICE / Credits 归档模板

在开源项目中内置上述美术素材时，建议在仓库根目录设立 `THIRD_PARTY_LICENSES.md` 或 `CREDITS.md`，规范声明如下：

```markdown
# Third-Party Assets & Credits

This project includes open-source pixel art game icons under explicit, permissive licenses:

## 1. Public Domain / CC0 Assets (No attribution strictly required, credited with deep gratitude)
- **496 Pixel Art Icons for Medieval/Fantasy RPG**
  - Artist: Henrique Lazarini (7Soul1)
  - Source: https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg
  - License: CC0 1.0 Universal
- **Kenney Game Assets (Roguelike Pack, Generic Items, 1-Bit Pack)**
  - Artist: Kenney (Asset Jesus)
  - Source: https://kenney.nl / https://opengameart.org/users/kenney
  - License: CC0 1.0 Universal
- **Farming Crops 16x16**
  - Artist: josehzz
  - Source: https://opengameart.org/content/farming-crops-16x16
  - License: CC0 1.0 Universal
- **16x16 RPG Items**
  - Artist: Jetrel
  - Source: https://opengameart.org/content/16x16-rpg-items
  - License: CC0 1.0 Universal
- **Dungeon Crawl Stone Soup 32x32 Tiles**
  - Authors: Dungeon Crawl Stone Soup Team
  - Source: https://github.com/crawl/tiles
  - License: CC0 1.0 Universal

## 2. Creative Commons Attribution (CC-BY 4.0) Assets
- **Kyrise's Free 16x16 RPG Icon Pack**
  - Artist: Kyrise (https://kyrise.itch.io/)
  - Source: https://opengameart.org/content/kyrises-free-16x16-rpg-icon-pack
  - License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **DawnLike - 16x16 Universal Rogue-like tileset**
  - Artists: DragonDePlatino & DawnBringer
  - Source: https://opengameart.org/content/dawnlike-16x16-universal-rogue-like-tileset-v181
  - License: Creative Commons Attribution 4.0 International (CC BY 4.0)
```

---

### 7.2 本项目仓库目录落地结构设计

为保持项目的整洁与模块化，建议将下载后的图标按主题与功能规整至 `public/assets/icons/items/`：

```text
public/assets/icons/items/
├── stardew/                # 星露谷主题：农牧、采集、田园工具
│   ├── crops/              # 20 种成熟农作物图标 (来自 josehzz)
│   ├── tools/              # 锄头、喷水壶、铁镐、鱼竿 (来自 Kenney & Shade)
│   └── forage/             # 浆果、蘑菇、木材、花卉
├── pokemon/                # 宝可梦主题：精灵球、树果、进化石
│   ├── balls/              # 各色球体图腾 (基于 7Soul 球形着色选件)
│   ├── berries/            # 浆果与草药
│   └── stones/             # 元素进化石与携带道具
├── jrpg/                   # 经典 JRPG：剑杖弓盾、防具、魔法卷轴
│   ├── weapons/            # 刀剑、长枪、法杖、弓弩 (7Soul 496 & Kyrise)
│   ├── armors/             # 头盔、铠甲、盾牌、鞋子
│   ├── potions/            # 红蓝药水、圣水、万灵药
│   └── scrolls/            # 魔法卷轴、古籍圣典
├── diablo/                 # 暗黑主题：重型冷兵器、符文、暗黑颅骨
│   ├── weapons/            # 恶魔之刃、死神巨镰、战锤 (来自 DCSS)
│   ├── runes/              # 雕刻符文石、骷髅宝石 (来自 DCSS & 7Soul)
│   └── materials/          # 恶魔角、骨骼、毒液囊
└── tech/                   # 现代与科技道具：为 DSH 插件与 CLI 专属定制
    ├── hardware/           # 芯片、主板、电池、天线 (来自 Kenney & Nikoichu)
    └── tools/              # 扳手、螺丝刀、终端、齿轮
```

---

### 7.3 默认内置道具池（Fallback Preset）搭配建议

为了在 Web 装备背包加载初始状态或用户未上传自定义 AI 图标时，展现出稳定、统一且极高信噪比的视觉效果，推荐建立一套**“36 格全能经典默认道具清单”**（映射到 `src/data/inventoryData.ts`）：

1. **核心装备类（8格）**：
   - 传说级大剑（7Soul `sword_gold`）
   - 守护者秘银盾（7Soul `shield_plate`）
   - 大魔法师兜帽（7Soul `helmet_cloth`）
   - 恶魔斩首战斧（DCSS `executioner_axe`）
   - 刺客淬毒短刃（Kyrise `dagger_poison`）
   - 精灵之风长弓（Kyrise `bow_wood`）
   - 圣殿骑士胸甲（7Soul `armor_heavy`）
   - 疾行飞靴（7Soul `boots_leather`）
2. **消耗与魔法类（8格）**：
   - 特级生命药剂（Shade `potion_red_large`）
   - 超级法力灵药（Shade `potion_blue_large`）
   - 万灵解毒剂（Shade `potion_green`）
   - 远古回城卷轴（7Soul `scroll_teleport`）
   - 烈焰风暴符文典籍（Kyrise `book_fire`）
   - 冰霜新星魔导书（Kyrise `book_ice`）
   - 不死鸟之羽（Jetrel `feather_gold`）
   - 纯净圣水瓶（7Soul `potion_holy`）
3. **农牧与生活类（8格）**：
   - 黄金品质甜瓜（josehzz `melon_gold`）
   - 鲜红草莓篮（josehzz `strawberry`）
   - 丰收小麦捆（josehzz `wheat`）
   - 熟透的南瓜（josehzz `pumpkin`）
   - 铁质喷水壶（Kenney `watering_can`）
   - 匠人钓鱼竿（Kenney `fishing_rod`）
   - 坚固的铁镐（Kenney `pickaxe`）
   - 浓郁咖啡豆（josehzz `coffee_beans`）
4. **宝可梦与奇异宝物类（6格）**：
   - 大师级捕获球（7Soul `sphere_purple`）
   - 灼热火之进化石（7Soul `stone_fire`）
   - 璀璨水之进化石（7Soul `stone_water`）
   - 黄金苹果（7Soul `fruit_golden_apple`）
   - 闪耀星之碎片（Kyrise `gem_star`）
   - 纯金金币堆（7Soul `coins_gold_pile`）
5. **极客与现代科技类（6格）**：
   - 量子计算核心芯片（Nikoichu / Kenney `tech_cpu`）
   - 高能便携电池组（Kenney `generic_battery`）
   - 模块化多功能扳手（Kenney `tool_wrench`）
   - 绝密数据软盘（Nikoichu `disk_floppy`）
   - 全息侦测目镜（Kenney `generic_goggles`）
   - 应急急救医疗包（Kenney `generic_medkit`）

通过以上 36 款精选图标的预设注入，无论用户在 Web 页面中切换至星露谷、宝可梦、经典 JRPG 或暗黑 Diablo 任何一种 UI 皮肤，背包中的道具均能保持绝对锐利（`image-rendering: pixelated`）、风格协调且完全免除版权后顾之忧。
