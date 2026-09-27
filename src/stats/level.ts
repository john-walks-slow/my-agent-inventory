// 等级与经验纯函数（Node / 浏览器双端可跑，零依赖）。
//
// 公式（详见 docs/features/260927-my-harness-inventory/ plan §6）：
//   exp = A·log2(1+sessions) + B·log10(1+tokens) + C·√days + D·itemScore
//   level = clamp(1 + floor(exp / K), 1, 99)
//
// 会话与 Token 均做对数压缩（跨 4-5 个数量级且防刷）；
// 系数由 4 个人设锚点 + DSH 真机第 5 锚拟合（tests/level.test.ts 固化预期）。
// harness.level 可显式覆盖等级（彩蛋与公式解耦），EXP 条仍按公式 exp 计算进度。

export interface GearCounts {
  plugins?: number;
  skills?: number;
  mcp?: number;
  tools?: number;
  tomes?: number;
}

export interface LevelInput {
  /** root 主会话数 */
  sessions?: number;
  /** 累计 Token（非缓存 input+output 口径） */
  tokens?: number;
  /** 存活天数（since 至今） */
  days?: number;
  gear?: GearCounts;
}

export interface LevelResult {
  /** 最终展示等级（1-99，已应用显式覆盖） */
  level: number;
  /** 公式计算出的等级（覆盖前） */
  formulaLevel: number;
  exp: number;
  /** 当前等级区间起点 exp */
  expBase: number;
  /** 下一等级起点 exp（99 级时等于 expBase） */
  expNext: number;
  /** 当前等级区间内进度 0..1 */
  progress: number;
  maxed: boolean;
}

// ---- 拟合系数（tests/level.test.ts 锚点断言与此处一致） ----

/** 会话项系数（log2） */
const A = 1.0;
/** Token 项系数（log10） */
const B = 1.0;
/** 存活天数项系数（√） */
const C = 0.35;
/** 装备分系数 */
const D = 0.35;
/** 每级所需 exp（线性阶梯） */
const K = 4.2;

/** 装备加权分：插件/MCP 是重装备，tomes 是经验结晶 */
export function itemScore(gear: GearCounts | undefined): number {
  if (!gear) return 0;
  return (
    2 * (gear.plugins ?? 0) +
    1 * (gear.skills ?? 0) +
    3 * (gear.mcp ?? 0) +
    1.5 * (gear.tools ?? 0) +
    5 * (gear.tomes ?? 0)
  );
}

export function computeExp(input: LevelInput): number {
  const sessions = input.sessions ?? 0;
  const tokens = input.tokens ?? 0;
  const days = input.days ?? 0;
  return A * Math.log2(1 + sessions) + B * Math.log10(1 + tokens) + C * Math.sqrt(days) + D * itemScore(input.gear);
}

export function computeFormulaLevel(input: LevelInput): number {
  return Math.min(99, Math.max(1, 1 + Math.floor(computeExp(input) / K)));
}

export function computeLevel(input: LevelInput, override?: number): LevelResult {
  const exp = computeExp(input);
  const formulaLevel = computeFormulaLevel(input);
  const level = Math.min(99, Math.max(1, override ?? formulaLevel));
  const maxed = level >= 99;
  const expBase = (level - 1) * K;
  const expNext = maxed ? expBase : level * K;
  const progress = maxed ? 1 : Math.min(1, Math.max(0, (exp - expBase) / (expNext - expBase)));
  return { level, formulaLevel, exp, expBase, expNext, progress, maxed };
}

/** since（YYYY-MM-DD）至 now 的存活天数；since 缺省返回 0 */
export function daysSince(since: string | undefined, now: Date = new Date()): number {
  if (!since) return 0;
  const start = new Date(`${since}T00:00:00`).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((now.getTime() - start) / 86_400_000));
}
