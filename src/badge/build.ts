// Badge 纯函数：档案 + 主题规格 → SVG 字符串（Node gen 脚本与站点共用，零依赖）。
// 480×160：品牌头像（带框格）+ 昵称 + 副题 + Lv 徽章 + EXP 条 + 3 数据 chip。
// 拉丁字体子集以 data-URI @font-face 内嵌（<img> 上下文无法加载外部字体）；
// 中文走系统字体栈回退（站点字体过大，不做 CJK 子集）。

import type { BadgeThemeSpec } from './themes';

export interface BadgeProfile {
  /** 昵称（缺省用 harness 名） */
  nickname: string;
  /** harness 标识名（如 DSH） */
  harnessName: string;
  /** 站点标题（如「我的 DSH 背包」） */
  siteTitle: string;
  level: number;
  /** 当前等级区间内进度 0..1（越界自动 clamp） */
  progress: number;
  /** chip 数据；undefined 的 chip 不渲染 */
  sessions?: number;
  tokens?: number;
  items?: number;
  /** chip 标签措辞（来自主题词汇表 expTerms） */
  chipLabels: { sessions: string; tokens: string; items: string };
  /** 职业称号（主题词汇表 jobs；缺省不渲染） */
  job?: string;
  /** 品牌头像 SVG 源码（16×16） */
  brandSvg: string;
}

export const BADGE_WIDTH = 480;
export const BADGE_HEIGHT = 160;

/** XML 转义（昵称等来自用户配置，必须转义） */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 中文习惯计数：<1e4 原样；≥1万 → x.x万；≥1亿 → x.x亿（去掉 .0） */
export function formatCount(n: number): string {
  if (n < 10_000) return String(n);
  const yi = n / 100_000_000;
  if (yi >= 1) return trimZero(yi.toFixed(1)) + '亿';
  return trimZero((n / 10_000).toFixed(1)) + '万';
}

function trimZero(s: string): string {
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

/** 全角/半角判断（CJK 与全角符号按整字宽估） */
function isWide(ch: string): boolean {
  return /[\u2e80-\ufaff\uff00-\uffef]/.test(ch);
}

/** 估宽：全角 = fontSize，半角 ≈ 0.75×fontSize（像素拉丁字偏宽，宁窄勿溢） */
function measureEst(s: string, fontSize: number): number {
  let w = 0;
  for (const ch of s) w += isWide(ch) ? fontSize : fontSize * 0.75;
  return w;
}

/** 按估宽截断到 maxWidth，超出以 … 结尾（SVG 无自动换行/裁切，须手动限宽防溢） */
export function fitText(s: string, maxWidth: number, fontSize: number): string {
  const chars = [...s];
  let used = 0;
  for (let i = 0; i < chars.length; i++) {
    used += isWide(chars[i]) ? fontSize : fontSize * 0.75;
    if (used + fontSize * 0.6 > maxWidth) {
      return chars.slice(0, i).join('') + '…';
    }
  }
  return s;
}

/** 副标题限宽：整串放不下 → 只留 harness 名 → 再放不下才截断 */
export function fitSubtitle(harnessName: string, siteTitle: string, maxWidth: number, fontSize: number): string {
  const full = `${harnessName} · ${siteTitle}`;
  if (measureEst(full, fontSize) <= maxWidth) return full;
  if (measureEst(harnessName, fontSize) <= maxWidth) return harnessName;
  return fitText(harnessName, maxWidth, fontSize);
}

/** 抽取品牌头像 SVG 的内部内容，重新包进嵌套 <svg>（保持 16×16 视口缩放） */
function embedBrandSvg(raw: string, x: number, y: number, size: number): string {
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '');
  return (
    `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 16 16" ` +
    `shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`
  );
}

/**
 * 生成 badge SVG。
 * @param fontDataUri 内嵌拉丁字体子集的 data:font/woff2;base64,…；空串则不内嵌
 */
export function buildBadge(profile: BadgeProfile, theme: BadgeThemeSpec, fontDataUri = ''): string {
  const progress = Math.min(1, Math.max(0, profile.progress));
  const pct = Math.round(progress * 100);
  // 左块文本可用宽度：从 x=112 到 chip 列（x=330）前留 8px
  const nickname = escapeXml(fitText(profile.nickname || profile.harnessName, 206, 23));
  const sub = escapeXml(fitSubtitle(profile.harnessName, profile.siteTitle, 206, 11));
  const lvText = `Lv.${profile.level}`;

  const fontFace = fontDataUri
    ? `@font-face{font-family:'${theme.embedFont.family}';src:url(${fontDataUri}) format('woff2');}`
    : '';

  // Lv 徽章宽度：文本估宽 + 两侧内边距
  const lvWidth = 18 + measureEst(lvText, 12) + 14;

  const chips: Array<[string, number | undefined]> = [
    [profile.chipLabels.sessions, profile.sessions],
    [profile.chipLabels.tokens, profile.tokens],
    [profile.chipLabels.items, profile.items],
  ];
  const chipRows = chips
    .filter(([, v]) => v !== undefined)
    .map(([label, v]) => ({ label: escapeXml(label), value: formatCount(v as number) }));

  const chipSvg = chipRows
    .map(
      (c, i) => `
    <g transform="translate(330 ${28 + i * 34})">
      <rect width="126" height="26" rx="${Math.max(3, theme.radius - 2)}" fill="${theme.chipBg}" stroke="${theme.chipBorder ?? theme.innerLine ?? theme.frame}" stroke-width="1"/>
      <text x="9" y="17" font-family="${theme.fontBody}" font-size="9.5" fill="${theme.inkMuted}">${c.label}</text>
      <text x="117" y="17.5" text-anchor="end" font-family="${theme.fontDisplay}" font-size="12" font-weight="bold" fill="${theme.chipInk}">${c.value}</text>
    </g>`
    )
    .join('');

  // 内底：单色或垂直渐变（FF 风格窗口用渐变）
  const bgFill = theme.bgGradient
    ? 'url(#bgGrad)'
    : theme.bg;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BADGE_WIDTH}" height="${BADGE_HEIGHT}" viewBox="0 0 ${BADGE_WIDTH} ${BADGE_HEIGHT}" role="img" aria-label="${escapeXml(profile.nickname || profile.harnessName)} harness badge">
  <defs>
    <style>${fontFace}</style>${theme.bgGradient ? `
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${theme.bgGradient[0]}"/>
      <stop offset="1" stop-color="${theme.bgGradient[1]}"/>
    </linearGradient>` : ''}
  </defs>
  <!-- 外框 -->
  <rect x="0" y="0" width="${BADGE_WIDTH}" height="${BADGE_HEIGHT}" rx="${theme.radius}" fill="${theme.frame}"/>
  <!-- 内底 -->
  <rect x="4" y="4" width="${BADGE_WIDTH - 8}" height="${BADGE_HEIGHT - 8}" rx="${Math.max(2, theme.radius - 3)}" fill="${bgFill}"/>
  <!-- 内衬线 -->
  ${theme.innerLine ? `<rect x="8" y="8" width="${BADGE_WIDTH - 16}" height="${BADGE_HEIGHT - 16}" rx="${Math.max(2, theme.radius - 5)}" fill="none" stroke="${theme.innerLine}" stroke-width="1" opacity="0.55"/>` : ''}
  <!-- 品牌头像（带框格） -->
  <rect x="24" y="42" width="76" height="76" fill="${theme.chipBg}" stroke="${theme.chipBorder ?? theme.frame}" stroke-width="1.5"/>
  ${embedBrandSvg(profile.brandSvg, 30, 48, 64)}
  <!-- 昵称 / 副题 -->
  <text x="116" y="63" font-family="${theme.fontDisplay}" font-size="23" font-weight="bold" fill="${theme.ink}">${nickname}</text>
  <text x="116" y="82" font-family="${theme.fontBody}" font-size="11" fill="${theme.inkMuted}">${sub}</text>
  <!-- Lv 徽章 + 职业称号 -->
  <rect x="116" y="94" width="${lvWidth}" height="21" rx="${Math.max(3, theme.radius - 2)}" fill="${theme.levelBg}"/>
  <text x="${116 + lvWidth / 2}" y="108.5" text-anchor="middle" font-family="${theme.fontDisplay}" font-size="12" font-weight="bold" fill="${theme.levelInk}">${lvText}</text>${
    profile.job
      ? `
  <text x="${116 + lvWidth + 8}" y="108.5" font-family="${theme.fontDisplay}" font-size="12" font-weight="bold" fill="${theme.ink}">${escapeXml(profile.job)}</text>`
      : ''
  }
  <!-- EXP 条（带描边轨道） -->
  <text x="116" y="139" font-family="${theme.fontDisplay}" font-size="9" font-weight="bold" fill="${theme.inkMuted}" letter-spacing="1">EXP</text>
  <rect x="144" y="130" width="164" height="10" rx="2" fill="${theme.barTrack}" stroke="${theme.innerLine ?? theme.frame}" stroke-width="1" opacity="0.9"/>
  <rect x="145" y="131" width="${Math.max(progress > 0 ? 2 : 0, Math.round(162 * progress))}" height="8" rx="1" fill="${theme.barFill}"/>
  <text x="316" y="139" text-anchor="end" font-family="${theme.fontDisplay}" font-size="9" font-weight="bold" fill="${theme.inkMuted}">${pct}%</text>
  <!-- 数据 chips -->
  ${chipSvg}
</svg>`;
}
