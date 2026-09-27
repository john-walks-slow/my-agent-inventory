// PKMN 字体确定性校验：pkmn.woff2 必须被 Chrome 接受（OTS），且每个可打印
// ASCII 字符独立渲染时有墨（空格除外）。canvas 逐字符数墨点，不依赖人工看图。
// 一次性验证脚本：node scripts/font-probe.mjs
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const html = `<!doctype html><html><head><style>
@font-face { font-family:'PKMN'; src:url('file://${process.cwd()}/src/assets/fonts/pkmn.woff2') format('woff2'); }
@font-face { font-family:'Fusion Pixel'; src:url('file://${process.cwd()}/src/assets/fonts/fusion-pixel-12px-proportional-zh_hans.woff2') format('woff2'); }
body{margin:0;background:#fff}
.p{font-family:'PKMN';font-size:32px;white-space:pre}
.mixed{font-family:'PKMN','Fusion Pixel',monospace;font-size:28px;white-space:pre}
</style></head><body>
<div class="mixed">Lv.42 dsh-wait-subagent EXP 99% 插件技能秘籍：装 v1.0.0</div>
<canvas id="c" width="64" height="64"></canvas>
</body></html>`;
writeFileSync('/tmp/pkmn-verify.html', html);

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 160 });
await page.goto('file:///tmp/pkmn-verify.html', { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');
await new Promise((r) => setTimeout(r, 400));

const report = await page.evaluate(() => {
  const status = Array.from(document.fonts).map((f) => `${f.family}:${f.status}`).join(' ');
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const blanks = [];
  for (let cp = 0x21; cp <= 0x7e; cp++) {
    const ch = String.fromCharCode(cp);
    ctx.clearRect(0, 0, 64, 64);
    ctx.font = "32px 'PKMN'";
    ctx.fillStyle = '#000';
    ctx.fillText(ch, 8, 40);
    const data = ctx.getImageData(0, 0, 64, 64).data;
    let ink = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 20) ink++;
    if (ink === 0) blanks.push(`${ch}(U+${cp.toString(16)})`);
  }
  return { status, blanks };
});
console.log('fonts:', report.status);
console.log(report.blanks.length === 0 ? '✓ 94 个可打印 ASCII 全部有墨' : `✗ 空白字形: ${report.blanks.join(' ')}`);
await page.screenshot({ path: '/tmp/pkmn-verify.png' });
await browser.close();
process.exit(report.blanks.length === 0 ? 0 : 1);
