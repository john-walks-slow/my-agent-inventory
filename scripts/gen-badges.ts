// Badge 生成器（Node，tsx 运行）：config → public/badges/{四主题}.svg + badge.svg + favicon.svg
// 挂在 predev/prebuild；产物入库，fork 者改配置后自动重生成。
// 运行：tsx scripts/gen-badges.ts（或随 pnpm dev/build 自动跑）
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { siteConfigSchema } from '../src/config/schema';
import { THEMES } from '../src/config/schema';
import { computeLevel, daysSince } from '../src/stats/level';
import { getVocab } from '../src/theme/vocab';
import { buildBadge } from '../src/badge/build';
import { BADGE_THEMES } from '../src/badge/themes';

const ROOT = new URL('..', import.meta.url).pathname;

const read = (p: string) => readFileSync(ROOT + p, 'utf8');

// ---- 装配档案（镜像 src/config/loader.ts buildProfile 的口径） ----
const rawConfig = parseYaml(read('config/harness.yaml'));
const config = siteConfigSchema.parse(rawConfig);
const h = config.harness;

const gear: Record<string, number> = {};
let items = 0;
for (const sec of config.sections) {
  gear[sec.id] = sec.items.length;
  items += sec.items.length;
}
const level = computeLevel(
  { sessions: h.stats?.sessions, tokens: h.stats?.tokens, days: daysSince(h.since), gear },
  h.level
);

// ---- 头像解析（customAvatar → brand → generic） ----
function resolveBrandSvg(): { svg: string; key: string } {
  if (h.customAvatar && existsSync(ROOT + `config/icons/${h.customAvatar}.svg`)) {
    return { svg: read(`config/icons/${h.customAvatar}.svg`), key: h.customAvatar };
  }
  const brandKey = existsSync(ROOT + `src/brands/${h.brand ?? ''}.svg`) ? (h.brand as string) : 'generic';
  return { svg: read(`src/brands/${brandKey}.svg`), key: brandKey };
}
const brand = resolveBrandSvg();

mkdirSync(ROOT + 'public/badges', { recursive: true });
const activeTheme = config.site.theme;

for (const t of THEMES) {
  const vocab = getVocab(t);
  const spec = BADGE_THEMES[t];
  const fontBytes = readFileSync(ROOT + `src/badge/fonts/${spec.embedFont.file}`);
  const fontDataUri = `data:font/woff2;base64,${fontBytes.toString('base64')}`;

  const svg = buildBadge(
    {
      nickname: h.nickname ?? h.name,
      harnessName: h.name,
      siteTitle: config.site.title,
      level: level.level,
      progress: level.progress,
      sessions: h.stats?.sessions,
      tokens: h.stats?.tokens,
      items,
      chipLabels: {
        sessions: vocab.expTerms.sessions,
        tokens: vocab.expTerms.tokens,
        items: vocab.expTerms.gear,
      },
      brandSvg: brand.svg,
    },
    spec,
    fontDataUri
  );

  writeFileSync(ROOT + `public/badges/${t}.svg`, svg);
  if (t === activeTheme) writeFileSync(ROOT + 'public/badge.svg', svg);
  console.log(`badge: ${t}.svg ${(svg.length / 1024).toFixed(1)}KB`);
}

// favicon = 品牌头像本体（16×16 像素 SVG，浏览器原生支持）
writeFileSync(ROOT + 'public/favicon.svg', brand.svg);
console.log(`badge: favicon.svg (${brand.key})`);

// index.html <title> 与配置同步（顶栏已不显示站点标题，浏览器标签页是标题唯一出口）
const indexPath = ROOT + 'index.html';
const indexHtml = readFileSync(indexPath, 'utf8');
const nextHtml = indexHtml.replace(/<title>[^<]*<\/title>/, `<title>${config.site.title}</title>`);
if (nextHtml !== indexHtml) {
  writeFileSync(indexPath, nextHtml);
  console.log(`index.html <title> → ${config.site.title}`);
}
