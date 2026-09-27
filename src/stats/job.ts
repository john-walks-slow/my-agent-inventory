// 职业自动判定：按装备构成（各 section 物品数）取主导 section。
// 平票取配置顺序靠前的 section——可解释、无魔数；称号映射见 theme/vocab.ts jobs。
export function deriveJobSection(gear: Record<string, number>, sectionOrder: string[]): string | null {
  let best: string | null = null;
  let bestCount = 0;
  for (const id of sectionOrder) {
    const n = gear[id] ?? 0;
    if (n > bestCount) {
      best = id;
      bestCount = n;
    }
  }
  return best;
}
