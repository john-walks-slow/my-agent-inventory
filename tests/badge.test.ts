// Badge 纯函数单测：结构/转义/限宽截断/计数格式/进度 clamp/字体内嵌
// 运行：pnpm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBadge,
  escapeXml,
  fitText,
  fitSubtitle,
  formatCount,
  BADGE_WIDTH,
  BADGE_HEIGHT,
  type BadgeProfile,
} from '../src/badge/build';
import { BADGE_THEMES } from '../src/badge/themes';

const BRAND = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g><rect x="1" y="1" width="2" height="2" fill="#123456"/></g></svg>';

const profile: BadgeProfile = {
  nickname: '大肥鱼',
  harnessName: 'DeepSeek Harness',
  siteTitle: '我的 DSH 背包',
  level: 16,
  levelTitle: '渔夫大师',
  progress: 0.88,
  sessions: 482,
  tokens: 4_360_000_000,
  items: 85,
  chipLabels: { sessions: '会话', tokens: 'Token', items: '装备' },
  brandSvg: BRAND,
};

test('buildBadge：结构完整（尺寸/头像/文本/EXP/chips）', () => {
  const svg = buildBadge(profile, BADGE_THEMES.stardew, 'data:font/woff2;base64,QUJD');
  assert.ok(svg.startsWith('<svg xmlns='), '应为 svg 根元素');
  assert.ok(svg.includes(`width="${BADGE_WIDTH}"`) && svg.includes(`height="${BADGE_HEIGHT}"`));
  assert.ok(svg.includes('@font-face'), '应内嵌字体');
  assert.ok(svg.includes('viewBox="0 0 16 16"'), '应嵌入 16×16 品牌头像');
  assert.ok(svg.includes('大肥鱼') && svg.includes('Lv.16') && svg.includes('渔夫大师'));
  assert.ok(svg.includes('88%'));
  assert.ok(svg.includes('会话') && svg.includes('482'));
  assert.ok(svg.includes('43.6亿') && svg.includes('85'));
});

test('buildBadge：无字体参数则不内嵌 @font-face；progress 越界 clamp', () => {
  const svg = buildBadge({ ...profile, progress: 1.5 }, BADGE_THEMES.pokemon);
  assert.ok(!svg.includes('@font-face'));
  assert.ok(svg.includes('width="180"'), '进度条满宽 180');
  assert.ok(svg.includes('100%'));
  const under = buildBadge({ ...profile, progress: -0.2 }, BADGE_THEMES.pokemon);
  assert.ok(under.includes('width="0"'), '负进度钳为 0');
});

test('buildBadge：undefined 的 chip 不渲染；昵称 XSS 转义', () => {
  const svg = buildBadge(
    { ...profile, sessions: undefined, nickname: '<script>alert("x")</script>' },
    BADGE_THEMES.diablo
  );
  assert.ok(!svg.includes('会话'), 'sessions chip 应省略');
  assert.equal((svg.match(/translate\(328 /g) ?? []).length, 2, '应只有 2 个 chip');
  assert.ok(!svg.includes('<script>'), 'script 标签必须被转义');
  assert.ok(svg.includes('&lt;script&gt;'));
});

test('escapeXml：五个保留字符', () => {
  assert.equal(escapeXml(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&apos;');
});

test('formatCount：中文计数习惯', () => {
  assert.equal(formatCount(85), '85');
  assert.equal(formatCount(9_999), '9999');
  assert.equal(formatCount(10_000), '1万');
  assert.equal(formatCount(2_105_000), '210.5万');
  assert.equal(formatCount(4_360_000_000), '43.6亿');
  assert.equal(formatCount(100_000_000), '1亿');
});

test('fitText：短串原样、超宽截断加省略号', () => {
  assert.equal(fitText('abc', 200, 12), 'abc');
  assert.equal(fitText('大肥鱼', 200, 24), '大肥鱼');
  const long = '一二三四五六七八九十'.repeat(3);
  const cut = fitText(long, 100, 12);
  assert.ok(cut.endsWith('…'));
  assert.ok(cut.length < long.length);
});

test('fitSubtitle：整串放不下时回退 harness 名，再放不下才截断', () => {
  assert.equal(fitSubtitle('DSH', '我的背包', 200, 12), 'DSH · 我的背包');
  // 整串超宽 → 回退 harness 名
  assert.equal(fitSubtitle('DeepSeek Harness', '我的 DSH 背包超长站点标题', 200, 12), 'DeepSeek Harness');
  // harness 名本身也超宽 → 截断
  const cut = fitSubtitle('A Very Long Harness Name Indeed', 'x', 100, 12);
  assert.ok(cut.endsWith('…') && cut.length < 'A Very Long Harness Name Indeed'.length);
});
