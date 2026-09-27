// 解析链与套件完整性单测：node --test（经 tsx 运行 TS）
// 运行：pnpm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { KIT_ICONS, KIT_GROUPS, isKitIcon } from '../src/iconkit/registry';
import { resolveIconRef, type CustomIcon } from '../src/iconkit/resolve';

const assetsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/iconkit/assets');
const assetFiles = new Set(readdirSync(assetsDir));

test('manifest 完整性：每个 id 唯一且资产文件存在', () => {
  const ids = Object.keys(KIT_ICONS);
  assert.equal(ids.length, 496);
  assert.equal(new Set(ids).size, ids.length, 'id 必须唯一');
  for (const [id, source] of Object.entries(KIT_ICONS)) {
    // value 为原始包内文件名（溯源），入库时已重命名为 <id>.png
    assert.ok(source.endsWith('.png'), `溯源文件名异常: ${id} → ${source}`);
    assert.ok(assetFiles.has(`${id}.png`), `资产文件缺失: ${id}.png`);
  }
  // 资产目录无孤儿文件（入库脚本生成的 <id>.png 与 manifest 一一对应）
  assert.equal(assetFiles.size, ids.length);
});

test('常用 id 分组全部存在于 manifest', () => {
  for (const group of KIT_GROUPS) {
    for (const id of group.ids) {
      assert.ok(id in KIT_ICONS, `分组「${group.label}」引用了不存在的 id: ${id}`);
    }
  }
});

test('isKitIcon 与 manifest 一致', () => {
  assert.equal(isKitIcon('sword-1'), true);
  assert.equal(isKitIcon('not-an-icon'), false);
});

test('解析链：custom-svg 优先于一切', () => {
  const custom: Record<string, CustomIcon> = { sword: { kind: 'svg', raw: '<svg/>' } };
  const ref = resolveIconRef('sword', custom, { 'sword': 'W_Sword01.png' });
  assert.deepEqual(ref, { kind: 'custom-svg', raw: '<svg/>', name: 'sword' });
});

test('解析链：custom-img 次之', () => {
  const custom: Record<string, CustomIcon> = { avatar: { kind: 'img', url: '/x.png' } };
  const ref = resolveIconRef('avatar', custom, {});
  assert.deepEqual(ref, { kind: 'custom-img', url: '/x.png', name: 'avatar' });
});

test('解析链：kit id 命中（Record 与 Set 两种入参）', () => {
  assert.deepEqual(resolveIconRef('sword-1', {}, KIT_ICONS), { kind: 'kit', id: 'sword-1' });
  assert.deepEqual(
    resolveIconRef('sword-1', {}, new Set(['sword-1'])),
    { kind: 'kit', id: 'sword-1' }
  );
});

test('解析链：未定义/未知/空名 → 兜底', () => {
  assert.deepEqual(resolveIconRef(undefined, {}, {}), { kind: 'fallback' });
  assert.deepEqual(resolveIconRef('nope', {}, KIT_ICONS), { kind: 'fallback' });
});
