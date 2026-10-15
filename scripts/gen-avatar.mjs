#!/usr/bin/env node
// 自定义 Harness 品牌头像导入与生成器
//
// 官方收录品牌仅保留核心主流（dsh / gemini / claude / codex / pi / terminal / opencode）。
// 用户可使用本脚本将自己的 SVG 或 PNG/位图头像写入 config/icons/，支持全链路（Web、名片、Favicon）。
//
// 用法：
//   node scripts/gen-avatar.mjs <path/to/icon.png|svg> [avatar-name]
//   node scripts/gen-avatar.mjs --text <文本/英文字母> [avatar-name]
//
// 示例：
//   pnpm gen:avatar ./my-bot.png
//   pnpm gen:avatar ./custom-logo.svg my-harness
//   pnpm gen:avatar --text "GOOSE" goose-text

import { existsSync, copyFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = path.join(root, 'config/icons');
mkdirSync(iconsDir, { recursive: true });

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
自定义 Harness 品牌头像导入与生成器 (支持 SVG & PNG)

用法:
  node scripts/gen-avatar.mjs <图片路径> [头像名称]
  node scripts/gen-avatar.mjs --text <文字/字母> [头像名称]

示例:
  pnpm gen:avatar ./my-avatar.png
  pnpm gen:avatar ./logo.svg my-agent
  pnpm gen:avatar --text "GOOSE" my-goose

生效方式:
  在 config/harness.yaml 中配置:
    harness:
      customAvatar: <头像名称>
`);
  process.exit(0);
}

// ---- 3×5 经典像素点阵字形 (大写字母 + 数字) ----
const FONT_3X5 = {
  A: [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  B: [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  C: [[1,1,1],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  D: [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  E: [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
  F: [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  G: [[1,1,1],[1,0,0],[1,0,1],[1,0,1],[1,1,1]],
  H: [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  I: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  J: [[0,0,1],[0,0,1],[0,0,1],[1,0,1],[1,1,1]],
  K: [[1,0,1],[1,1,0],[1,0,0],[1,1,0],[1,0,1]],
  L: [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  M: [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  N: [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,0,1]],
  O: [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  P: [[1,1,1],[1,0,1],[1,1,1],[1,0,0],[1,0,0]],
  Q: [[1,1,1],[1,0,1],[1,0,1],[1,1,1],[0,0,1]],
  R: [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  S: [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  T: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  U: [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  V: [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  W: [[1,0,1],[1,0,1],[1,0,1],[1,1,1],[1,0,1]],
  X: [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  Y: [[1,0,1],[1,0,1],[1,1,1],[0,1,0],[0,1,0]],
  Z: [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
};

function generatePixelTextSvg(text, bg = '#090d16', border = '#1e293b', ink = '#fbbf24') {
  const chars = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const grid = Array.from({ length: 16 }, () => Array(16).fill(0));

  // 1px 环形边框
  for (let x = 1; x <= 14; x++) { grid[1][x] = 1; grid[14][x] = 1; }
  for (let y = 1; y <= 14; y++) { grid[y][1] = 1; grid[y][14] = 1; }

  function drawGlyph(ch, sx, sy) {
    const glyph = FONT_3X5[ch];
    if (!glyph) return;
    for (let r = 0; r < glyph.length; r++) {
      for (let c = 0; c < glyph[r].length; c++) {
        if (glyph[r][c] && sy + r < 15 && sx + c < 15) {
          grid[sy + r][sx + c] = 2;
        }
      }
    }
  }

  if (chars.length <= 3) {
    // 单行排版 (1-3 个字符)
    const totalW = chars.length * 3 + (chars.length - 1);
    const startX = Math.floor((16 - totalW) / 2);
    chars.split('').forEach((ch, idx) => {
      drawGlyph(ch, startX + idx * 4, 5);
    });
  } else {
    // 多行排版 (如 GOOSE → 上排 GO，下排 SE)
    const line1 = chars.slice(0, 2);
    const line2 = chars.length === 5 ? (chars.slice(2, 4) === 'OS' ? 'SE' : chars.slice(3, 5)) : chars.slice(2, 4);
    const startX1 = Math.floor((16 - (line1.length * 3 + line1.length - 1)) / 2);
    const startX2 = Math.floor((16 - (line2.length * 3 + line2.length - 1)) / 2);

    line1.split('').forEach((ch, idx) => drawGlyph(ch, startX1 + idx * 5, 3));
    line2.split('').forEach((ch, idx) => drawGlyph(ch, startX2 + idx * 5, 9));
  }

  const rects = [`  <rect width="16" height="16" fill="${bg}"/>`];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (grid[y][x] === 1) rects.push(`  <rect x="${x}" y="${y}" width="1" height="1" fill="${border}"/>`);
      if (grid[y][x] === 2) rects.push(`  <rect x="${x}" y="${y}" width="1" height="1" fill="${ink}"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
${rects.join('\n')}
</svg>
`;
}

let input = args[0];
let avatarName = args[1];

if (input === '--text') {
  const rawText = args[1] ?? 'GOOSE';
  avatarName = args[2] ?? `avatar-${rawText.toLowerCase()}`;
  const outPath = path.join(iconsDir, `${avatarName}.svg`);

  const svg = generatePixelTextSvg(rawText);
  writeFileSync(outPath, svg, 'utf-8');
  console.log(`✓ 3×5 点阵像素文字徽标已生成: config/icons/${avatarName}.svg`);
  printNextStep(avatarName);
  process.exit(0);
}

const resolvedInput = path.resolve(process.cwd(), input);
if (!existsSync(resolvedInput)) {
  console.error(`✗ 找不到输入文件: ${resolvedInput}`);
  process.exit(1);
}

const ext = path.extname(resolvedInput).toLowerCase().replace('.', '');
const allowed = ['svg', 'png', 'webp', 'jpg', 'jpeg', 'gif'];
if (!allowed.includes(ext)) {
  console.error(`✗ 不支持的文件格式 ".${ext}"。请使用: ${allowed.join(', ')}`);
  process.exit(1);
}

if (!avatarName) {
  avatarName = path.basename(resolvedInput, path.extname(resolvedInput));
}
// 清理文件名非法字符
avatarName = avatarName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

const targetFile = path.join(iconsDir, `${avatarName}.${ext}`);
copyFileSync(resolvedInput, targetFile);

console.log(`✓ 头像已成功放置: config/icons/${avatarName}.${ext}`);
printNextStep(avatarName);

function printNextStep(name) {
  console.log(`
下一步:
  1. 打开 config/harness.yaml，在 harness 块添加:
     harness:
       customAvatar: "${name}"

  2. 运行校验与预览:
     pnpm validate
     pnpm dev
`);
}
