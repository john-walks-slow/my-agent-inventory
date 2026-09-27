# 图标选型

## 解析链

item/section 的 `icon` 字段按以下顺序解析：

```
config/icons/<icon>.svg → config/icons/<icon>.png → iconkit 内置 id → 兜底图
```

即：**先查自定义目录，再查内置套件**。`pnpm validate` 会查引用完整性（写了个不存在的自定义文件名会报错；纯 kit id 拼错则静默兜底，注意别拼错）。

内置套件共 **496 枚**（7Soul，CC0），站内 `#/icons` 图鉴页可在线浏览与检索全部；下表是精选的 **121 枚**常用 id。

## 内置套件常用 id 表（14 组）

**剑刃**：`sword-1` `sword-2` `sword-3` `sword-4` `sword-5` `gold-sword`

**刀匕**：`dagger-1` `dagger-2` `dagger-3` `dagger-4` `gold-dagger`

**斧锤**：`axe-1` `axe-2` `axe-3` `mace-1` `mace-2` `mace-3` `gold-axe` `gold-mace`

**弓弩枪炮**：`bow-1` `bow-2` `bow-3` `gold-bow` `gun-1` `gun-2` `cannon-1`

**长柄拳投**：`spear-1` `spear-2` `spear-3` `gold-spear` `fist-1` `fist-2` `throw-1` `throw-2`

**法杖书卷**：`staff-1` `staff-2` `staff-3` `staff-4` `book-1` `book-2` `book-3` `scroll` `scroll-2`

**元素法术**：`spell-fire-1` `spell-ice-1` `spell-thunder-1` `spell-water-1` `spell-wind-1` `spell-earth-1` `spell-light-1` `spell-shadow-1` `spell-holy-1` `spell-poison-1`

**战技**：`spell-sword-1` `spell-axe-1` `spell-bow-1` `spell-dagger-2` `spell-magic-1` `spell-buff-1` `spell-physic-1`

**药水**：`potion-red-1` `potion-blue-1` `potion-green-1` `potion-yellow-1` `potion-pink-1` `potion-white-1` `potion-medicine-1` `antidote`

**防具**：`armour-1` `armour-2` `armour-3` `armor-4` `clothing-1` `hat-1` `hat-2` `shoes-1` `shoes-2`

**饰品**：`ring-1` `ring-2` `necklace-1` `necklace-2` `medal-1` `medal-2`

**食物**：`food-bread` `food-meat` `food-fish` `food-cheese` `food-mushroom` `food-carrot` `food-pie` `food-strawberry`

**宝石贵金属**：`ruby` `sapphire` `diamond` `agate` `amethist` `opal` `jade` `crystal-1` `gold-bar` `gold-coin` `silver-bar` `silver-coin` `bronze-bar`

**素材杂货**：`key-1` `key-2` `map` `clock` `mirror` `telescope` `ink` `torch-1` `bottle-1` `feather-1` `fabric` `fang` `bone` `coal` `rock-1` `wood-1` `metal-1`

选型直觉：插件→`metal-1`/`key-1`（或自定义 gear/puzzle 类 SVG）、技能→`book-1`/`scroll`、MCP→`crystal-1`/`ruby`、工作流→`map`、典籍→`scroll-2`。
⚠ `puzzle`、`sword`、`book` 这类裸词**不在套件里**（存在的是 `sword-1`/`book-1`）——kit id 拼错不报错、静默兜底，从本表复制 id 最稳。

## 自定义图标

放 `config/icons/<icon>.svg`，16×16 像素风（描边粗、色块实）。命名即 `icon` 字段引用值。
风格要求：与内置套件一致的 16×16 手绘像素，**杜绝引入 Lucide/FontAwesome 等矢量图标库**。

## AIGC 图标（可选通道）

用 AI 生成像素图标时：生成 16×16 或等比放大的像素风图片 → 转 SVG（或直接放 `.png`）→ 存 `config/icons/`。
注意：AIGC 产物先过人类过目（对齐闸门的一部分）；许可证信息记入仓库 NOTICE。

## 站内图鉴

`pnpm dev` 后打开 `#/icons` 可浏览全部内置图标与分组，比本表直观。
