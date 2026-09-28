// 主题词汇表单测：结构完整性 + sectionLabel 优先级 + levelTitle 边界 + fmt 插值
// 运行：pnpm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  THEME_VOCAB,
  getVocab,
  sectionLabel,
  levelTitle,
  fmt,
  type ThemeVocab,
} from '../src/theme/vocab';
import { THEMES, RARITIES } from '../src/config/schema';

function assertAllNonEmpty(obj: object, path: string) {
  for (const [k, v] of Object.entries(obj)) {
    assert.equal(typeof v, 'string', `${path}.${k} 应为字符串`);
    assert.ok((v as string).length > 0, `${path}.${k} 不应为空`);
  }
}

test('四主题词汇表：rarity/detail/hud/reader/jobs/since 全键非空', () => {
  for (const t of THEMES) {
    const v: ThemeVocab = THEME_VOCAB[t];
    for (const r of RARITIES) {
      assert.ok(v.rarity[r]?.length, `${t}.rarity.${r} 缺失`);
    }
    assertAllNonEmpty(v.detail, `${t}.detail`);
    assertAllNonEmpty(v.hud, `${t}.hud`);
    assertAllNonEmpty(v.reader, `${t}.reader`);
    assert.ok(v.since.length > 0, `${t}.since`);
    for (const sec of ['plugins', 'skills', 'mcp', 'tools', 'tomes'] as const) {
      assert.ok(v.jobs[sec]?.length, `${t}.jobs.${sec} 缺失`);
      assert.ok(v.jobDescs[sec]?.length, `${t}.jobDescs.${sec} 缺失`);
    }
    // currency.glyph 必填；unit 允许空串（如 ₽ 无单位后缀）
    assert.ok(v.currency.glyph.length > 0, `${t}.currency.glyph`);
    assert.equal(typeof v.currency.unit, 'string', `${t}.currency.unit 应为字符串`);
    assertAllNonEmpty(v.expTerms, `${t}.expTerms`);
    assert.ok(v.bagLabel.length > 0, `${t}.bagLabel`);
    assert.ok(v.sections.plugins?.length, `${t}.sections.plugins`);
    // 等级阶梯：阈值升序且唯一，首档从 1 开始
    const mins = v.levelTitles.map(([min]) => min);
    assert.equal(mins[0], 1, `${t}.levelTitles 首档应为 1`);
    assert.deepEqual([...mins].sort((a, b) => a - b), mins, `${t}.levelTitles 阈值应升序`);
    assert.equal(new Set(mins).size, mins.length, `${t}.levelTitles 阈值不应重复`);
    for (const [, name] of v.levelTitles) assert.ok(name.length > 0);
  }
});

test('getVocab：未知/缺省主题回退 stardew', () => {
  assert.equal(getVocab(undefined).bagLabel, THEME_VOCAB.stardew.bagLabel);
  assert.equal(getVocab('nope').bagLabel, THEME_VOCAB.stardew.bagLabel);
  assert.equal(getVocab('diablo').reader.empty, THEME_VOCAB.diablo.reader.empty);
});

test('sectionLabel：显式 label > 主题词汇 > id 兜底', () => {
  assert.equal(sectionLabel({ id: 'plugins', label: '我的收藏' }, 'stardew'), '我的收藏');
  assert.equal(sectionLabel({ id: 'plugins' }, 'pokemon'), '精灵球');
  assert.equal(sectionLabel({ id: 'custom-x' }, 'diablo'), 'custom-x');
});

test('levelTitle：命中区间与边界回退', () => {
  assert.equal(levelTitle(1, 'stardew'), '见习农场主');
  assert.equal(levelTitle(16, 'stardew'), '渔夫大师');
  assert.equal(levelTitle(99, 'stardew'), '银河农夫');
  assert.equal(levelTitle(0, 'jrpg'), '见习勇者'); // 低于首档回退第一档
  assert.equal(levelTitle(30, 'diablo'), '毁灭行者');
  assert.equal(levelTitle(16, 'pokemon'), '冠军');
});

test('fmt：占位替换、未命中保留、多处替换', () => {
  assert.equal(fmt('空闲格子 [{n}]', { n: 7 }), '空闲格子 [7]');
  assert.equal(fmt('(已扩容至 {rows} 行 / {cells} 格)', { rows: 4, cells: 48 }), '(已扩容至 4 行 / 48 格)');
  assert.equal(fmt('没有 {missing} 变量', { n: 1 }), '没有 {missing} 变量');
  assert.equal(fmt('{a}-{a}', { a: 'x' }), 'x-x');
});
