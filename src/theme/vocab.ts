// 主题词汇表：全站「字样」按主题变化。
// P5b-1：section 展示名 / 等级称号 / 货币；P6 补齐品质命名、详情卡章节标题、
// HUD 提示、空态与阅读器用语——组件不再硬编码面向用户的中文。

import type { ThemeId, Rarity } from '../config/schema';

export interface ThemeVocab {
  /** section id → 展示名兜底（配置里显式 label 永远优先） */
  sections: Record<string, string>;
  /** 等级 → 称号阶梯（升序，命中最后一档 min ≤ level） */
  levelTitles: ReadonlyArray<readonly [number, string]>;
  /** 货币符号与单位（HUD 金币计数） */
  currency: { glyph: string; unit: string };
  /** 背包网格标题字样 */
  bagLabel: string;
  /** 档案弹窗 EXP 构成行的四项措辞 */
  expTerms: { sessions: string; tokens: string; days: string; gear: string };
  /** 品质命名（normal → iridium 升序，详情卡品质徽标） */
  rarity: Record<Rarity, string>;
  /** 详情卡章节标题与操作按钮 */
  detail: {
    highlights: string;
    content: string;
    install: string;
    config: string;
    note: string;
    repo: string;
    copy: string;
    copied: string;
  };
  /** HUD 与空态文案；{n}/{rows}/{cells} 为占位符，用 fmt() 插值 */
  hud: {
    /** 档案入口称呼（HUD 按钮 / 徽章 title） */
    profile: string;
    search: string;
    allFilter: string;
    capacity: string;
    expanded: string;
    clickToView: string;
    hoverHint: string;
    emptySlot: string;
    totalLabel: string;
    totalUnit: string;
    codexLink: string;
    badgeLink: string;
    goldHint: string;
    emptyDetailTitle: string;
    emptyDetailHint: string;
    searchEmpty: string;
    sectionEmpty: string;
  };
  /** 阅读器（tomes）用语 */
  reader: { title: string; empty: string; sign: string };
}

const stardew: ThemeVocab = {
  sections: { plugins: '插件', skills: '技能', mcp: 'MCP', tools: '工具', tomes: '秘籍' },
  levelTitles: [
    [1, '见习农场主'],
    [4, '锄地学徒'],
    [7, '播种好手'],
    [10, '矿洞新丁'],
    [13, '钓鱼常客'],
    [16, '渔夫大师'],
    [20, '战斗老手'],
    [25, '觅食专家'],
    [30, '矿井勇者'],
    [40, '传奇农夫'],
    [55, '铱星大师'],
    [70, '星露谷传说'],
    [85, '尤卡之主'],
    [99, '银河农夫'],
  ],
  currency: { glyph: '🪙', unit: 'g' },
  bagLabel: '豪华大背包',
  expTerms: { sessions: '会话', tokens: 'Token', days: '工龄', gear: '装备' },
  rarity: {
    normal: '普通品质',
    silver: '银星品质 (Silver)',
    gold: '金星品质 (Gold)',
    iridium: '铱星品质 (Iridium ★)',
  },
  detail: {
    highlights: '✦ 核心亮点',
    content: '📜 深度解析',
    install: '安装与使用指令',
    config: '⚙ 配置示例',
    note: '💡 装备备注',
    repo: '仓库',
    copy: '复制命令',
    copied: '已复制！',
  },
  hud: {
    profile: '档案',
    search: '搜索...',
    allFilter: '全部',
    capacity: '收纳数',
    expanded: '(已扩容至 {rows} 行 / {cells} 格)',
    clickToView: '点击查看属性',
    hoverHint: '悬停在装备上可快速预览',
    emptySlot: '空闲格子 [{n}]',
    totalLabel: '收纳总数',
    totalUnit: '项',
    codexLink: '图标图鉴',
    badgeLink: '装备名片',
    goldHint: '点击收成金币！',
    emptyDetailTitle: '请点击背包中的装备',
    emptyDetailHint: '查看设计原理、配置与安装方式',
    searchEmpty: '没有找到匹配的物品',
    sectionEmpty: '这一栏还空着',
  },
  reader: {
    title: '秘籍阁',
    empty: '从左侧书架挑选一卷秘籍开始研读',
    sign: '—— 沉淀自全局指令与真机实战',
  },
};

const pokemon: ThemeVocab = {
  sections: { plugins: '精灵球', skills: '招式', mcp: '设施', tools: '道具', tomes: '图鉴' },
  levelTitles: [
    [1, '新人训练师'],
    [4, '短裤小侠'],
    [7, '徽章收集者'],
    [10, '道馆挑战者'],
    [13, '四天王候补'],
    [16, '冠军'],
    [20, '图鉴完成者'],
    [25, '传说训练师'],
    [30, '宝可梦大师'],
    [40, '岛屿之王'],
    [55, '羁绊大师'],
    [70, '世界冠军'],
    [85, '创世训练师'],
    [99, '阿尔宙斯之友'],
  ],
  currency: { glyph: '₽', unit: '' },
  bagLabel: '道具背包',
  expTerms: { sessions: '对战', tokens: '经验', days: '旅程', gear: '徽章' },
  rarity: {
    normal: '普通品质',
    silver: '精灵球品质',
    gold: '超级球品质',
    iridium: '大师球品质 (Master ★)',
  },
  detail: {
    highlights: '✦ 特性',
    content: '📖 图鉴说明',
    install: '获取方式',
    config: '⚙ 设置方法',
    note: '📒 训练笔记',
    repo: '交换所',
    copy: '抄录',
    copied: '抄好了！',
  },
  hud: {
    profile: '训练卡',
    search: '寻找...',
    allFilter: '全部',
    capacity: '持有数',
    expanded: '(扩容到 {rows} 排 / {cells} 格)',
    clickToView: '点击查看图鉴',
    hoverHint: '悬停在道具上可快速查看',
    emptySlot: '空位 [{n}]',
    totalLabel: '持有总数',
    totalUnit: '件',
    codexLink: '图鉴全览',
    badgeLink: '训练家卡',
    goldHint: '点击获得金币！',
    emptyDetailTitle: '请选择一件道具',
    emptyDetailHint: '查看图鉴说明、设置与获取方式',
    searchEmpty: '没有发现这样的道具…',
    sectionEmpty: '这里还是空的…',
  },
  reader: {
    title: '图鉴馆',
    empty: '从左侧图鉴架挑选一页开始查阅',
    sign: '—— 收录自训练师的冒险实录',
  },
};

const jrpg: ThemeVocab = {
  sections: { plugins: '装备', skills: '咒文', mcp: '召唤', tools: '道具', tomes: '贤者之书' },
  levelTitles: [
    [1, '见习勇者'],
    [4, '村庄少年'],
    [7, '冒险者'],
    [10, '战士'],
    [13, '魔法战士'],
    [16, '勇者'],
    [20, '龙之克星'],
    [25, '贤者'],
    [30, '传说勇者'],
    [40, '星空勇者'],
    [55, '天选之人'],
    [70, '大陆守护者'],
    [85, '神话编织者'],
    [99, '世界树之友'],
  ],
  currency: { glyph: '◎', unit: 'G' },
  bagLabel: '道具袋',
  expTerms: { sessions: '冒险', tokens: '经验', days: '旅程', gear: '装备' },
  rarity: {
    normal: '铜之品质',
    silver: '银之品质',
    gold: '金之品质',
    iridium: '虹之品质 (Rainbow ★)',
  },
  detail: {
    highlights: '✦ 特技',
    content: '📖 记载',
    install: '入手方法',
    config: '⚙ 调整设定',
    note: '📜 冒险手记',
    repo: '武器屋',
    copy: '誊写',
    copied: '誊好了！',
  },
  hud: {
    profile: '冒险手账',
    search: '探索...',
    allFilter: '全部',
    capacity: '所持数',
    expanded: '(扩充至 {rows} 列 / {cells} 格)',
    clickToView: '点击鉴定属性',
    hoverHint: '将光标停在装备上即可预览',
    emptySlot: '空栏 [{n}]',
    totalLabel: '所持总数',
    totalUnit: '种',
    codexLink: '纹章图鉴',
    badgeLink: '冒险纹章',
    goldHint: '点击获取金币！',
    emptyDetailTitle: '请选择要查看的装备',
    emptyDetailHint: '查看来历、设定与入手方法',
    searchEmpty: '没有找到该装备…',
    sectionEmpty: '此栏尚未放入任何物品',
  },
  reader: {
    title: '贤者书阁',
    empty: '从左侧书架挑选一卷贤者之书开始研读',
    sign: '—— 抄录自贤者的旅行手记',
  },
};

const diablo: ThemeVocab = {
  sections: { plugins: '符文', skills: '技能', mcp: '仆从', tools: '药剂', tomes: '禁书' },
  levelTitles: [
    [1, '流亡者'],
    [4, '营地新兵'],
    [7, '罗格游侠'],
    [10, '狩魔猎人'],
    [13, '恐惧克星'],
    [16, '奈非天'],
    [20, '地狱行者'],
    [25, '憎恨终结者'],
    [30, '毁灭行者'],
    [40, '大天使'],
    [55, '正义之刃'],
    [70, '万物终结者'],
    [85, '黑暗之王'],
    [99, '万恶之源'],
  ],
  currency: { glyph: '◆', unit: '金' },
  bagLabel: '储物箱',
  expTerms: { sessions: '征战', tokens: '经验', gear: '战利品', days: '流浪' },
  rarity: {
    normal: '普通 (Common)',
    silver: '魔法 (Magic)',
    gold: '稀有 (Rare)',
    iridium: '传奇 (Legendary ★)',
  },
  detail: {
    highlights: '✦ 威能',
    content: '📜 传说',
    install: '获取途径',
    config: '⚙ 符文配置',
    note: '🕯 流亡者批注',
    repo: '赌商',
    copy: '拓印',
    copied: '拓好了！',
  },
  hud: {
    profile: '石碑',
    search: '搜寻...',
    allFilter: '全部',
    capacity: '携带数',
    expanded: '(扩容至 {rows} 排 / {cells} 格)',
    clickToView: '点击鉴定',
    hoverHint: '悬停战利品可快速鉴定',
    emptySlot: '空槽 [{n}]',
    totalLabel: '战利品总数',
    totalUnit: '件',
    codexLink: '符文图鉴',
    badgeLink: '英雄石板',
    goldHint: '点击搜刮金币！',
    emptyDetailTitle: '请选中一件战利品',
    emptyDetailHint: '查看属性、符文与获取途径',
    searchEmpty: '储物箱中无此物…',
    sectionEmpty: '此处空无一物',
  },
  reader: {
    title: '禁书馆',
    empty: '从左侧书堆挑选一册禁书开始翻阅',
    sign: '—— 誊写自流亡者的黑暗法典',
  },
};

export const THEME_VOCAB: Record<ThemeId, ThemeVocab> = { stardew, pokemon, jrpg, diablo };

export function getVocab(theme: string | undefined): ThemeVocab {
  return THEME_VOCAB[(theme ?? 'stardew') as ThemeId] ?? stardew;
}

/** 词汇模板插值：'{n}' 等占位符替换；未命中的占位符原样保留 */
export function fmt(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m));
}

export function sectionLabel(sec: { id: string; label?: string }, theme?: string): string {
  return sec.label ?? getVocab(theme).sections[sec.id] ?? sec.id;
}

export function levelTitle(level: number, theme?: string): string {
  const titles = getVocab(theme).levelTitles;
  let title = titles[0][1];
  for (const [min, name] of titles) {
    if (level >= min) title = name;
    else break;
  }
  return title;
}
