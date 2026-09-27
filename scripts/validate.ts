// 独立校验：node/tsx 直接运行，供 agent 与 CI 使用（pnpm validate）
// 检查：YAML 语法 → schema → 交叉字段 → 图标可解析性 → 正文文件存在性
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { siteConfigSchema, formatIssues } from '../src/config/schema';
import { isKitIcon } from '../src/iconkit/registry';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cfgPath = resolve(root, 'config/harness.yaml');

type Line = { level: 'error' | 'warn' | 'ok'; msg: string };
const lines: Line[] = [];
const push = (level: Line['level'], msg: string) => lines.push({ level, msg });

// 1. 读取与 YAML 语法
let raw: string;
try {
  raw = readFileSync(cfgPath, 'utf8');
} catch {
  console.error(`✗ 未找到 ${cfgPath}`);
  process.exit(1);
}

let data: unknown;
try {
  data = parse(raw);
} catch (e) {
  console.error(`✗ YAML 语法错误: ${(e as Error).message}`);
  process.exit(1);
}

// 2. schema 校验
const result = siteConfigSchema.safeParse(data);
if (!result.success) {
  console.error(`✗ schema 校验失败:\n${formatIssues(result.error)}`);
  process.exit(1);
}
const cfg = result.data;
push('ok', `schema 校验通过（theme=${cfg.site.theme}, ${cfg.sections.length} 个 section）`);

// 3. 图标可解析性
const iconsDir = resolve(root, 'config/icons');
const customIconNames = existsSync(iconsDir)
  ? new Set(readdirSync(iconsDir).map((f) => f.replace(/\.(svg|png|gif|webp|jpg|jpeg)$/, '')))
  : new Set<string>();

const iconTargets: { where: string; name?: string }[] = [
  { where: 'harness.customAvatar', name: cfg.harness.customAvatar },
  ...cfg.sections.flatMap((sec) => [
    { where: `sections[${sec.id}].icon`, name: sec.icon },
    ...sec.items.map((it) => ({ where: `sections[${sec.id}].items[${it.id}].icon`, name: it.icon })),
  ]),
];

for (const t of iconTargets) {
  if (!t.name) continue;
  if (customIconNames.has(t.name) || isKitIcon(t.name)) continue;
  if (t.name === cfg.harness.brand) continue;
  push('warn', `${t.where}: 图标 "${t.name}" 既不在 config/icons/ 也不在内置套件中，将渲染兜底图标`);
}

// 4. 正文文件存在性
let itemCount = 0;
let contentFound = 0;
for (const sec of cfg.sections) {
  for (const item of sec.items) {
    itemCount++;
    const p = resolve(root, 'config/content', sec.id, `${item.id}.md`);
    if (existsSync(p)) contentFound++;
    else if (sec.view !== 'reader') push('warn', `缺少正文: config/content/${sec.id}/${item.id}.md（详情卡将只显示摘要）`);
  }
}
push('ok', `物品 ${itemCount} 个，正文 ${contentFound} 篇`);

// 汇总
for (const l of lines) {
  if (l.level === 'warn') {
    console.warn(`! ${l.msg}`);
    continue;
  }
  console.log(`✓ ${l.msg}`);
}
console.log('✔ validate 完成（警告不阻断，schema 错误才阻断）');
