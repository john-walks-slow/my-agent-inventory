#!/usr/bin/env node
// 等级公式系数拟合（用后即弃的校准工具，结果固化进 src/stats/level.ts）。
// A=B=1、p=1 固定，网格搜索 C / D / K：
//   硬约束：DSH 真机锚 = Lv.16（"Lv.16 大肥鱼"彩蛋）
//   目标：其余 4 人设锚点误差平方和最小（轻 5 / 中 9 / 重 14 / 离谱 20）

const anchors = [
  { name: 'rookie', sessions: 50, tokens: 5e6, days: 60, gear: { plugins: 2, skills: 3, mcp: 1, tools: 0, tomes: 1 }, target: 5 },
  { name: 'daily', sessions: 300, tokens: 1e8, days: 200, gear: { plugins: 5, skills: 10, mcp: 2, tools: 3, tomes: 2 }, target: 9 },
  { name: 'veteran', sessions: 1200, tokens: 6e8, days: 400, gear: { plugins: 10, skills: 25, mcp: 4, tools: 10, tomes: 3 }, target: 14 },
  { name: 'legendary', sessions: 5000, tokens: 3e9, days: 700, gear: { plugins: 15, skills: 40, mcp: 6, tools: 20, tomes: 5 }, target: 20 },
  { name: 'dsh', sessions: 482, tokens: 4356590671, days: 31, gear: { plugins: 13, skills: 41, mcp: 3, tools: 24, tomes: 4 }, target: 16 },
];

const itemScore = (g) => 2 * (g.plugins ?? 0) + 1 * (g.skills ?? 0) + 3 * (g.mcp ?? 0) + 1.5 * (g.tools ?? 0) + 5 * (g.tomes ?? 0);
const expOf = (a, C, D) => Math.log2(1 + a.sessions) + Math.log10(1 + a.tokens) + C * Math.sqrt(a.days) + D * itemScore(a.gear);
const levelOf = (a, C, D, K) => Math.min(99, Math.max(1, 1 + Math.floor(expOf(a, C, D) / K)));

let best = null;
for (let C = 0.2; C <= 1.21; C += 0.05) {
  for (let D = 0.2; D <= 0.81; D += 0.05) {
    for (let K = 4.0; K <= 8.01; K += 0.05) {
      const dsh = levelOf(anchors[4], C, D, K);
      if (dsh !== 16) continue; // 硬约束
      const sse = anchors.reduce((s, a) => s + (levelOf(a, C, D, K) - a.target) ** 2, 0);
      if (!best || sse < best.sse) best = { C: +C.toFixed(2), D: +D.toFixed(2), K: +K.toFixed(2), sse, levels: anchors.map((a) => ({ n: a.name, t: a.target, got: levelOf(a, C, D, K) })) };
    }
  }
}

if (!best) {
  console.log('无可行解（DSH=16 约束下）');
} else {
  console.log(`best: C=${best.C} D=${best.D} K=${best.K} sse=${best.sse}`);
  for (const l of best.levels) console.log(`  ${l.n.padEnd(9)} target Lv.${l.t} → got Lv.${l.got}`);
}
