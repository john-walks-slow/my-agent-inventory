// 等级公式锚点校准单测（系数拟合见 tools/fit-level.mjs，sse=0 全锚命中）
// 运行：pnpm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeExp,
  computeFormulaLevel,
  computeLevel,
  daysSince,
  itemScore,
  type LevelInput,
} from '../src/stats/level';
import { levelTitle } from '../src/theme/vocab';

const anchor = (over: Partial<LevelInput>): LevelInput => ({ ...over });

test('锚点：轻度人设 → Lv.8', () => {
  const lv = computeFormulaLevel(
    anchor({ sessions: 50, tokens: 5e6, days: 60, gear: { plugins: 2, skills: 3, mcp: 1, tools: 0, tomes: 1 } })
  );
  assert.equal(lv, 8);
});

test('锚点：中度人设 → Lv.13', () => {
  const lv = computeFormulaLevel(
    anchor({ sessions: 300, tokens: 1e8, days: 200, gear: { plugins: 5, skills: 10, mcp: 2, tools: 3, tomes: 2 } })
  );
  assert.equal(lv, 13);
});

test('锚点：重度人设 → Lv.21', () => {
  const lv = computeFormulaLevel(
    anchor({ sessions: 1200, tokens: 6e8, days: 400, gear: { plugins: 10, skills: 25, mcp: 4, tools: 10, tomes: 3 } })
  );
  assert.equal(lv, 21);
});

test('锚点：离谱人设 → Lv.29', () => {
  const lv = computeFormulaLevel(
    anchor({ sessions: 5000, tokens: 3e9, days: 700, gear: { plugins: 15, skills: 40, mcp: 6, tools: 20, tomes: 5 } })
  );
  assert.equal(lv, 29);
});

test('锚点：DSH 真机数据（含缓存口径，skills/harness-inventory/scripts/collect-stats.mjs 实测）→ Lv.25 大肥鱼', () => {
  const lv = computeFormulaLevel(
    anchor({ sessions: 487, tokens: 44_822_895_353, days: 49, gear: { plugins: 13, skills: 41, mcp: 3, tools: 24, tomes: 4 } })
  );
  assert.equal(lv, 25);
  assert.equal(levelTitle(lv), '觅食专家');
});

test('零数据 → Lv.1；疯狂数据 → 封顶 99', () => {
  assert.equal(computeFormulaLevel(anchor({})), 1);
  assert.equal(computeFormulaLevel(anchor({ sessions: 1e9, tokens: 1e18, days: 36500, gear: { plugins: 999, skills: 9999, mcp: 99, tools: 999, tomes: 99 } })), 99);
});

test('harness.level 显式覆盖：等级被钉住，EXP 条仍按公式 exp 计算进度', () => {
  const input = anchor({ sessions: 487, tokens: 44_822_895_353, days: 49, gear: { plugins: 13, skills: 41, mcp: 3, tools: 24, tomes: 4 } });
  const r = computeLevel(input, 25);
  assert.equal(r.level, 25);
  assert.equal(r.formulaLevel, 25);
  assert.ok(r.progress > 0 && r.progress < 1);
  // 覆盖为别的值时 formulaLevel 不变
  const forced = computeLevel(input, 42);
  assert.equal(forced.level, 42);
  assert.equal(forced.formulaLevel, 25);
  assert.equal(forced.exp, r.exp);
});

test('EXP 区间进度：跨级连续且夹在 [0,1]', () => {
  const input = anchor({ sessions: 100, tokens: 1e7, days: 90, gear: { plugins: 3, skills: 5, tomes: 1 } });
  const r = computeLevel(input);
  const exp = computeExp(input);
  assert.ok(r.expBase <= exp);
  assert.ok(exp < r.expNext || r.maxed);
  assert.ok(r.progress >= 0 && r.progress <= 1);
  // 区间起点恰为整数倍 K
  assert.equal(r.expBase, (r.level - 1) * 2.8);
});

test('单调性：任何维度增长不降级', () => {
  const base = computeFormulaLevel(anchor({ sessions: 10, tokens: 1e5, days: 10, gear: { plugins: 1 } }));
  assert.ok(computeFormulaLevel(anchor({ sessions: 20, tokens: 1e5, days: 10, gear: { plugins: 1 } })) >= base);
  assert.ok(computeFormulaLevel(anchor({ sessions: 10, tokens: 2e5, days: 10, gear: { plugins: 1 } })) >= base);
  assert.ok(computeFormulaLevel(anchor({ sessions: 10, tokens: 1e5, days: 20, gear: { plugins: 1 } })) >= base);
  assert.ok(computeFormulaLevel(anchor({ sessions: 10, tokens: 1e5, days: 10, gear: { plugins: 2 } })) >= base);
});

test('itemScore：插件/MCP/tomes 权重高于 skills/tools', () => {
  assert.equal(itemScore({ plugins: 1 }), 2);
  assert.equal(itemScore({ skills: 1 }), 1);
  assert.equal(itemScore({ mcp: 1 }), 3);
  assert.equal(itemScore({ tools: 1 }), 1.5);
  assert.equal(itemScore({ tomes: 1 }), 5);
  assert.equal(itemScore(undefined), 0);
});

test('daysSince：跨日计数与非法输入', () => {
  const now = new Date('2026-09-27T12:00:00');
  assert.equal(daysSince('2026-08-27', now), 31);
  assert.equal(daysSince('2026-09-27', now), 0);
  assert.equal(daysSince(undefined, now), 0);
  assert.equal(daysSince('not-a-date', now), 0);
  // 未来日期不产生负数
  assert.equal(daysSince('2026-10-01', now), 0);
});

test('称号阶梯：关键节点', () => {
  assert.equal(levelTitle(1), '见习农场主');
  assert.equal(levelTitle(16), '渔夫大师');
  assert.equal(levelTitle(99), '银河农夫');
  assert.equal(levelTitle(100), '银河农夫'); // 越界兜底取最高档
});
