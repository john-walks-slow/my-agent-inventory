#!/usr/bin/env node
// 可控视口截图工具（P5 visual diff / P10 e2e 走查共用）。
// 用法：node tools/shot.mjs --url <url> --w 1280 --h 800 --out a.png [--click "text:秘籍"]...
// click 动作：text:<文本> 按 Playwright text 选择器点击；#<hash> 直接设 location.hash。
// Chrome 需 --no-sandbox（root 容器）。

import { chromium } from '/usr/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs';

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const clicks = args.reduce((acc, a, i) => (a === '--click' ? [...acc, args[i + 1]] : acc), []);

const url = flag('url', 'http://127.0.0.1:5181');
const width = Number(flag('w', 1280));
const height = Number(flag('h', 800));
const out = flag('out', '/tmp/shot.png');
const wait = Number(flag('wait', 600));
const tab = flag('tab', null); // 点击第 N 个 .sdv-tab-btn（0 起，主题无关）

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: 'networkidle' });
if (tab !== null) {
  await page.click(`.sdv-tab-btn >> nth=${tab}`, { timeout: 5000 });
  await page.waitForTimeout(wait);
}
for (const action of clicks) {
  if (action.startsWith('#')) {
    await page.goto(`${url}${action}`, { waitUntil: 'networkidle' });
  } else {
    const selector = action.startsWith('text:') ? action : action;
    await page.click(selector, { timeout: 5000 });
  }
  await page.waitForTimeout(wait);
}
await page.screenshot({ path: out });
console.log(`shot ${out} (${width}x${height})`);
await browser.close();
