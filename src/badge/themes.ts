// Badge 主题规格：四主题各一套框架色板与字体栈。
// 颜色取自 src/index.css 同名 token，保证 badge 与站点同源观感；
// 拉丁字体子集（src/badge/fonts/，ASCII 95 字形，pyftsubset 产物）以
// data-URI 内嵌进 SVG——<img> 上下文无法加载外部字体，中文回退系统字体栈。

import type { ThemeId } from '../config/schema';

export interface BadgeThemeSpec {
  id: ThemeId;
  /** 展示名（badge 页卡片标题） */
  label: string;
  /** 外框 */
  frame: string;
  /** 内底（单色） */
  bg: string;
  /** 内底（垂直渐变，优先于 bg；FF 风格窗口用） */
  bgGradient?: readonly [string, string];
  /** 内衬线（双线框主题；缺省不画） */
  innerLine?: string;
  /** 主文本 */
  ink: string;
  /** 次文本 */
  inkMuted: string;
  /** Lv 徽章底色 */
  levelBg: string;
  /** Lv 徽章文字 */
  levelInk: string;
  /** EXP 轨道 / 填充 */
  barTrack: string;
  barFill: string;
  /** 数据 chip 底 / 文字 */
  chipBg: string;
  chipBorder?: string;
  chipInk: string;
  /** 圆角（像素徽章小圆角） */
  radius: number;
  /** 展示字体栈（首项为内嵌子集族名） */
  fontDisplay: string;
  /** 正文字体栈（chip 标签等中文） */
  fontBody: string;
  /** 内嵌拉丁子集：族名 + 文件名（gen 脚本读出后转 data-URI 传入） */
  embedFont: { family: string; file: string };
}

export const BADGE_THEMES: Record<ThemeId, BadgeThemeSpec> = {
  stardew: {
    id: 'stardew',
    label: '星露谷',
    frame: '#4a2113',
    bg: '#ecd0a6',
    innerLine: '#fff6e0',
    ink: '#381503',
    inkMuted: '#78350f',
    levelBg: '#d98236',
    levelInk: '#fff6e0',
    barTrack: '#c89b62',
    barFill: '#78c850',
    chipBg: '#fdf5df',
    chipBorder: '#8d562b',
    chipInk: '#381503',
    radius: 6,
    fontDisplay: "'BadgeSilkscreen','DotGothic16','PingFang SC','Microsoft YaHei',sans-serif",
    fontBody: "'BadgeSilkscreen','DotGothic16','PingFang SC','Microsoft YaHei',sans-serif",
    embedFont: { family: 'BadgeSilkscreen', file: 'stardew-latin.woff2' },
  },
  pokemon: {
    id: 'pokemon',
    label: '宝可梦',
    frame: '#ee1515',
    bg: '#f8f8e8',
    innerLine: '#ffffff',
    ink: '#2a2a2a',
    inkMuted: '#6a6a6a',
    levelBg: '#f8d030',
    levelInk: '#2a2a2a',
    barTrack: '#d0d0d0',
    barFill: '#78c850',
    chipBg: '#fffbe6',
    chipBorder: '#5a5a5a',
    chipInk: '#2a2a2a',
    radius: 14,
    fontDisplay: "'BadgePKMN','Fusion Pixel','PingFang SC','Microsoft YaHei',sans-serif",
    fontBody: "'BadgePKMN','Fusion Pixel','PingFang SC','Microsoft YaHei',sans-serif",
    embedFont: { family: 'BadgePKMN', file: 'pokemon-latin.woff2' },
  },
  jrpg: {
    id: 'jrpg',
    label: 'JRPG',
    // FF 风格战斗窗口：夜蓝渐变底 + 近白描边 + 青色 EXP + 金色数字
    frame: '#dce4ff',
    bg: '#101a3e',
    bgGradient: ['#1a2a5e', '#0e1636'],
    innerLine: '#3a5ac0',
    ink: '#ffffff',
    inkMuted: '#9fb4e8',
    levelBg: '#2a3e7e',
    levelInk: '#ffe8a0',
    barTrack: '#0c1434',
    barFill: '#58b8f0',
    chipBg: '#16244e',
    chipBorder: '#3a5ac0',
    chipInk: '#ffd868',
    radius: 4,
    fontDisplay: "'BadgeCinzel','Songti SC','SimSun',serif",
    fontBody: "'Fusion Pixel','PingFang SC','Microsoft YaHei',sans-serif",
    embedFont: { family: 'BadgeCinzel', file: 'jrpg-latin.woff2' },
  },
  diablo: {
    id: 'diablo',
    label: '暗黑',
    frame: '#5c1a10',
    bg: '#241a10',
    innerLine: '#5c4830',
    ink: '#e8d8b0',
    inkMuted: '#b8a078',
    levelBg: '#8c2b1e',
    levelInk: '#ffe4a1',
    barTrack: '#1a1208',
    barFill: '#c9a227',
    chipBg: '#2a1e12',
    chipBorder: '#5c1a10',
    chipInk: '#c9a227',
    radius: 6,
    fontDisplay: "'BadgePirata','Songti SC','SimSun',serif",
    fontBody: "'Fusion Pixel','PingFang SC','Microsoft YaHei',sans-serif",
    embedFont: { family: 'BadgePirata', file: 'diablo-latin.woff2' },
  },
};
