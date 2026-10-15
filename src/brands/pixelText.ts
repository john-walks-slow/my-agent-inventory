// 16×16 纯点阵像素文字徽标生成器 (Node 与浏览器通用纯函数)

const FONT_3X5: Record<string, number[][]> = {
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

/**
 * 根据任意文本生成 16×16 经典 3×5 点阵像素文字 SVG
 */
export function generatePixelTextSvg(
  text: string,
  bg = '#090d16',
  border = '#1e293b',
  ink = '#fbbf24'
): string {
  // 清理非字母数字字符并大写
  let chars = (text || 'AI').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!chars) chars = 'AI';

  const grid: number[][] = Array.from({ length: 16 }, () => Array(16).fill(0));

  // 1px 环形边框
  for (let x = 1; x <= 14; x++) { grid[1][x] = 1; grid[14][x] = 1; }
  for (let y = 1; y <= 14; y++) { grid[y][1] = 1; grid[y][14] = 1; }

  function drawGlyph(ch: string, sx: number, sy: number) {
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
    // 1-3 字符水平单行居中 (每个字 3 宽 + 1 间距)
    const totalW = chars.length * 3 + (chars.length - 1);
    const startX = Math.floor((16 - totalW) / 2);
    chars.split('').forEach((ch, idx) => {
      drawGlyph(ch, startX + idx * 4, 5);
    });
  } else {
    // 4 字符及以上采用双行经典排版 (例如 GOOSE → GO / SE)
    const line1 = chars.slice(0, 2);
    const line2 = chars.length === 5 ? (chars.slice(2, 4) === 'OS' ? 'SE' : chars.slice(3, 5)) : chars.slice(2, 4);
    const startX1 = Math.floor((16 - (line1.length * 3 + line1.length - 1)) / 2);
    const startX2 = Math.floor((16 - (line2.length * 3 + line2.length - 1)) / 2);

    line1.split('').forEach((ch, idx) => drawGlyph(ch, startX1 + idx * 5, 3));
    line2.split('').forEach((ch, idx) => drawGlyph(ch, startX2 + idx * 5, 9));
  }

  const rects: string[] = [`  <rect width="16" height="16" fill="${bg}"/>`];
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
