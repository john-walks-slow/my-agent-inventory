// 主题词汇表：展示名的主题兜底 + 等级称号阶梯。
// P5 主题系统会按主题覆写（如宝可梦主题的 tomes → 「图鉴」）；当前为星露谷基准值。

export const SECTION_LABEL_FALLBACKS: Record<string, string> = {
  plugins: '插件',
  skills: '技能',
  mcp: 'MCP',
  tools: '工具',
  tomes: '秘籍'
};

export function sectionLabel(sec: { id: string; label?: string }): string {
  return sec.label ?? SECTION_LABEL_FALLBACKS[sec.id] ?? sec.id;
}

/** 等级 → 称号阶梯（星露谷基准；P5 各主题自带一套） */
export const LEVEL_TITLES: ReadonlyArray<readonly [number, string]> = [
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
];

export function levelTitle(level: number): string {
  let title = LEVEL_TITLES[0][1];
  for (const [min, name] of LEVEL_TITLES) {
    if (level >= min) title = name;
    else break;
  }
  return title;
}
