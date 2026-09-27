// 内置图标套件注册表 —— 纯数据模块（Node 与浏览器双端可导入，禁止环境 API）
// id 命名约定：小写短横线语义名（如 sword-1 / potion-red-1 / spell-fire-1）。
// 全量映射由入库脚本生成于 manifest.gen.ts；本文件维护「常用 id 分组」速查表。
// 同一 id 被多个物品共用是合法且鼓励的。
// 注意：config/icons/ 下的自定义图标优先于套件 id（解析链见 resolve.ts）。
import { KIT_MANIFEST } from './manifest.gen';

export interface KitGroup {
  /** 分组名（图鉴页/文档用） */
  label: string;
  ids: string[];
}

/** id → 原始包内文件名（溯源用；实际资产文件已重命名为 <id>.png） */
export const KIT_ICONS: Record<string, string> = KIT_MANIFEST;

/** 常用 id 分组速查（fork 者友好；文档与图鉴页共用） */
export const KIT_GROUPS: KitGroup[] = [
  { label: '剑刃', ids: ['sword-1', 'sword-2', 'sword-3', 'sword-4', 'sword-5', 'gold-sword'] },
  { label: '刀匕', ids: ['dagger-1', 'dagger-2', 'dagger-3', 'dagger-4', 'gold-dagger'] },
  { label: '斧锤', ids: ['axe-1', 'axe-2', 'axe-3', 'mace-1', 'mace-2', 'mace-3', 'gold-axe', 'gold-mace'] },
  { label: '弓弩枪炮', ids: ['bow-1', 'bow-2', 'bow-3', 'gold-bow', 'gun-1', 'gun-2', 'cannon-1'] },
  { label: '长柄拳投', ids: ['spear-1', 'spear-2', 'spear-3', 'gold-spear', 'fist-1', 'fist-2', 'throw-1', 'throw-2'] },
  { label: '法杖书卷', ids: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'book-1', 'book-2', 'book-3', 'scroll', 'scroll-2'] },
  { label: '元素法术', ids: ['spell-fire-1', 'spell-ice-1', 'spell-thunder-1', 'spell-water-1', 'spell-wind-1', 'spell-earth-1', 'spell-light-1', 'spell-shadow-1', 'spell-holy-1', 'spell-poison-1'] },
  { label: '战技', ids: ['spell-sword-1', 'spell-axe-1', 'spell-bow-1', 'spell-dagger-2', 'spell-magic-1', 'spell-buff-1', 'spell-physic-1'] },
  { label: '药水', ids: ['potion-red-1', 'potion-blue-1', 'potion-green-1', 'potion-yellow-1', 'potion-pink-1', 'potion-white-1', 'potion-medicine-1', 'antidote'] },
  { label: '防具', ids: ['armour-1', 'armour-2', 'armour-3', 'armor-4', 'clothing-1', 'hat-1', 'hat-2', 'shoes-1', 'shoes-2'] },
  { label: '饰品', ids: ['ring-1', 'ring-2', 'necklace-1', 'necklace-2', 'medal-1', 'medal-2'] },
  { label: '食物', ids: ['food-bread', 'food-meat', 'food-fish', 'food-cheese', 'food-mushroom', 'food-carrot', 'food-pie', 'food-strawberry'] },
  { label: '宝石贵金属', ids: ['ruby', 'sapphire', 'diamond', 'agate', 'amethist', 'opal', 'jade', 'crystal-1', 'gold-bar', 'gold-coin', 'silver-bar', 'silver-coin', 'bronze-bar'] },
  { label: '素材杂货', ids: ['key-1', 'key-2', 'map', 'clock', 'mirror', 'telescope', 'ink', 'torch-1', 'bottle-1', 'feather-1', 'fabric', 'fang', 'bone', 'coal', 'rock-1', 'wood-1', 'metal-1'] },
];

export function isKitIcon(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(KIT_ICONS, id);
}
