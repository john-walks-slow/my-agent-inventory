// 主题词汇表：section 展示名 / 等级称号 / 货币等文案按主题变化。
// P5a token 层负责颜色；本文件负责「字样」的主题化。

import type { ThemeId } from '../config/schema';

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
};

export const THEME_VOCAB: Record<ThemeId, ThemeVocab> = { stardew, pokemon, jrpg, diablo };

export function getVocab(theme: string | undefined): ThemeVocab {
  return THEME_VOCAB[(theme ?? 'stardew') as ThemeId] ?? stardew;
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
