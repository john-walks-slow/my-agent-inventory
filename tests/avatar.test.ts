import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAvatar, generatePixelTextSvg, BUILTIN_AVATAR_KEYS, BUILTIN_AVATARS } from '../src/brands';

test('BUILTIN_AVATARS: 仅保留 4 种娘化头像 key', () => {
  assert.deepEqual(BUILTIN_AVATAR_KEYS.sort(), ['claude', 'codex', 'deepseek', 'gemini'].sort());
});

test('resolveAvatar: 自定义头像优先', () => {
  const customIcons = {
    'my-svg': { kind: 'svg' as const, raw: '<svg id="my-svg"></svg>' },
    'my-png': { kind: 'img' as const, url: 'blob:http://localhost/test.png' },
  };
  const res1 = resolveAvatar('my-svg', 'MyBot', customIcons);
  assert.equal(res1.kind, 'custom-svg');
  assert.equal(res1.key, 'my-svg');

  const res2 = resolveAvatar('my-png', 'MyBot', customIcons);
  assert.equal(res2.kind, 'custom-img');
  assert.equal(res2.key, 'my-png');
});

test('resolveAvatar: 内置娘化头像（deepseek/claude/codex/gemini）命中', () => {
  // 在 Node 测试环境下模拟内置模块
  BUILTIN_AVATARS['deepseek'] = '<svg id="deepseek"></svg>';
  BUILTIN_AVATARS['claude'] = '<svg id="claude"></svg>';
  BUILTIN_AVATARS['codex'] = '<svg id="codex"></svg>';
  BUILTIN_AVATARS['gemini'] = '<svg id="gemini"></svg>';

  const customIcons = {};
  for (const key of ['deepseek', 'claude', 'codex', 'gemini']) {
    const res = resolveAvatar(key, 'TestBot', customIcons);
    assert.equal(res.kind, 'builtin');
    assert.equal(res.key, key);
    assert.ok(res.raw.startsWith('<svg'));
  }
});

test('resolveAvatar: 缺省或未命中时自动生成 16×16 点阵像素字头像兜底', () => {
  const customIcons = {};
  const res = resolveAvatar(undefined, 'Goose', customIcons);
  assert.equal(res.kind, 'pixel-text');
  assert.ok(res.raw.includes('viewBox="0 0 16 16"'));
  assert.ok(res.raw.includes('shape-rendering="crispEdges"'));

  const res2 = resolveAvatar('unknown-name', 'Random Harness', customIcons);
  assert.equal(res2.kind, 'pixel-text');
});

test('generatePixelTextSvg: 生成合法的 16×16 crispEdges SVG', () => {
  const svg = generatePixelTextSvg('AI');
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes('viewBox="0 0 16 16"'));
  assert.ok(svg.includes('<rect'));
});
