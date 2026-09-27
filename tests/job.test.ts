// 职业自动判定单测：主导 section、平票取配置顺序、空背包
// 运行：pnpm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveJobSection } from '../src/stats/job';

test('deriveJobSection：数量主导的 section 胜出', () => {
  const gear = { plugins: 3, skills: 8, mcp: 2, tools: 5, tomes: 2 };
  assert.equal(deriveJobSection(gear, ['plugins', 'skills', 'mcp', 'tools', 'tomes']), 'skills');
});

test('deriveJobSection：平票取配置顺序靠前', () => {
  const gear = { plugins: 4, skills: 4, mcp: 0 };
  assert.equal(deriveJobSection(gear, ['plugins', 'skills', 'mcp']), 'plugins');
  assert.equal(deriveJobSection(gear, ['skills', 'plugins', 'mcp']), 'skills');
});

test('deriveJobSection：空背包与未收录 section', () => {
  assert.equal(deriveJobSection({}, ['plugins', 'skills']), null);
  assert.equal(deriveJobSection({ custom: 2 }, ['plugins']), null);
  // 计数为 0 视同未装备
  assert.equal(deriveJobSection({ plugins: 0, skills: 0 }, ['plugins', 'skills']), null);
});
