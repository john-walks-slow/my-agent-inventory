#!/usr/bin/env node
// sync-content：把本机 DSH 环境的真实正文同步进 config/content/。
//
// 源 → 目标：
//   ~/.agents/skills/<name>/SKILL.md      → config/content/skills/skill-<name>.md
//   ~/projects/<plugin>/README.md         → config/content/plugins/<plugin>.md
//   ~/.dsh/AGENTS.md（按小节切分）        → config/content/tomes/*.md
//
// 默认 dry run，只打印将要发生的改动；加 --write 才落盘。
//
// 脱敏分两层（见全局指令「敏感信息与安全防护规范」）：
//   1. 通用规则直接写在本文件——只含 RFC1918/RFC5737 内网段、home 绝对路径、UUID 这类形态，
//      本身不含任何本机凭据，可以安全入库；
//   2. 本机专属规则（真实域名、口令、隧道 ID 片段）必须放仓库根目录的 sync-redactions.json，
//      该文件已进 .gitignore，格式见 sync-redactions.example.json。
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOME = homedir();
const WRITE = process.argv.includes('--write');

// ---------- 脱敏 ----------

/** 可入库的通用规则；顺序有意义，先长后短 */
const BASE_REDACTIONS = [
  // 通用隧道/实例 ID 形态
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, '<tunnel-id>'],
  // 内网地址 → RFC 5737 测试段
  [/\b192\.168\.\d{1,3}\.\d{1,3}\b/g, '192.0.2.10'],
  [/\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '192.0.2.10'],
  // 个人 home 绝对路径 → ~ 形式（放最后，兜住上面没枚举到的）
  [/\/root\//g, '~/'],
];

/** 本机专属规则：真实域名/口令/隧道前缀，只存在于未入库的 sync-redactions.json */
const LOCAL_REDACTIONS_PATH = path.join(ROOT, 'sync-redactions.json');
const localRedactions = existsSync(LOCAL_REDACTIONS_PATH)
  ? JSON.parse(readFileSync(LOCAL_REDACTIONS_PATH, 'utf8')).map(([source, to]) => [new RegExp(source, 'g'), to])
  : [];

const REDACTIONS = [...localRedactions, ...BASE_REDACTIONS];

function redact(text) {
  let out = text;
  const hits = [];
  for (const [re, to] of REDACTIONS) {
    const found = out.match(re);
    if (found) hits.push(...new Set(found));
    out = out.replace(re, to);
  }
  return { text: out, hits };
}

/** 去掉 YAML frontmatter，保留正文 */
function stripFrontmatter(md) {
  return md.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

/** 去掉正文里残留的 description: 引导行与孤立分隔线 */
function cleanBody(md) {
  return md
    .split('\n')
    .filter((l) => !/^description:\s/.test(l))
    .join('\n')
    .replace(/\n---\n/g, '\n')
    .trim();
}

/** 按标题锚点切出 AGENTS.md 的一个片段（到下一个锚点为止） */
function slice(md, startAnchor, endAnchors) {
  const start = md.indexOf(startAnchor);
  if (start < 0) throw new Error(`找不到锚点: ${startAnchor}`);
  let end = md.length;
  for (const a of endAnchors) {
    const i = md.indexOf(a, start + startAnchor.length);
    if (i >= 0 && i < end) end = i;
  }
  return md.slice(start, end).replace(/\n+$/, '');
}

// ---------- 任务清单 ----------
const SKILL_RENAMES = new Map([
  // content 文件名 → 本机 skill 目录名（默认同名）
]);

function skillTasks() {
  const dir = path.join(ROOT, 'config/content/skills');
  const tasks = [];
  for (const f of readdirSafe(dir)) {
    if (!f.endsWith('.md') || f === '.gitkeep') continue;
    const name = f.slice(0, -3).replace(/^skill-/, '');
    const src = path.join(HOME, '.agents/skills', SKILL_RENAMES.get(name) ?? name, 'SKILL.md');
    tasks.push({ src, dest: path.join(dir, f), label: `skills/${f}` });
  }
  return tasks;
}

function pluginTasks() {
  const dir = path.join(ROOT, 'config/content/plugins');
  const tasks = [];
  for (const f of readdirSafe(dir)) {
    if (!f.endsWith('.md') || f === '.gitkeep') continue;
    const name = f.slice(0, -3);
    tasks.push({ src: path.join(HOME, 'projects', name, 'README.md'), dest: path.join(dir, f), label: `plugins/${f}` });
  }
  return tasks;
}

function tomesTasks() {
  const agents = readFileSync(path.join(HOME, '.dsh/AGENTS.md'), 'utf8');
  const dir = path.join(ROOT, 'config/content/tomes');
  const wrap = (title, body) => `# ${title}\n\n> 全局指令 \`~/.dsh/AGENTS.md\` 原文同步。\n\n${body}\n`;
  const parts = {
    'host-environment.md': wrap(
      '基础环境概况',
      slice(agents, '# 基础环境概况', ['\n---\n']).replace(/^# 基础环境概况\n+/, '')
    ),
    'coding-style.md': wrap(
      '输出风格与核心编码实践',
      [slice(agents, '# 输出风格', ['\n---\n# 文档规范', '\n# 文档规范']), slice(agents, '# 核心编码实践', ['\n# 文档规范'])]
        .map((s) => s.replace(/^#\s+/, '## '))
        .join('\n\n')
    ),
    'collab-docs.md': wrap(
      '文档规范与协作通例',
      [
        slice(agents, '# 文档规范', ['\n---\ndescription:', '\n# 约定与通例']),
        slice(agents, '# 约定与通例', ['\n## 敏感信息与安全防护规范']),
      ]
        .map((s) => s.replace(/^#\s+/, '## '))
        .join('\n\n')
    ),
    'security-ironlaw.md': wrap(
      '敏感信息与安全防护规范',
      slice(agents, '## 敏感信息与安全防护规范', []).replace(/^##\s+/, '')
    ),
  };
  return Object.entries(parts).map(([f, body]) => ({
    src: path.join(HOME, '.dsh/AGENTS.md'),
    dest: path.join(dir, f),
    label: `tomes/${f}`,
    inline: body,
  }));
}

function readdirSafe(d) {
  try {
    return readdirSync(d);
  } catch {
    return [];
  }
}

// ---------- 执行 ----------
const tasks = [...skillTasks(), ...pluginTasks(), ...tomesTasks()];
let copied = 0;
let skipped = 0;
const redacted = [];

for (const t of tasks) {
  if (!t.inline && !existsSync(t.src)) {
    skipped++;
    console.log(`  SKIP  ${t.label.padEnd(42)} 缺源文件 ${t.src.replace(HOME, '~')}`);
    continue;
  }
  const raw = t.inline ?? stripFrontmatter(readFileSync(t.src, 'utf8'));
  const { text, hits } = redact(cleanBody(raw));
  if (hits.length) redacted.push(`${t.label}: ${hits.join(', ')}`);
  const before = existsSync(t.dest) ? readFileSync(t.dest, 'utf8').length : 0;
  const after = text.length;
  console.log(`  ${WRITE ? 'WRITE' : 'DRY  '} ${t.label.padEnd(42)} ${before} B → ${after} B`);
  if (WRITE) writeFileSync(t.dest, `${text}\n`, 'utf8');
  copied++;
}

console.log(`\n${WRITE ? '已写入' : '将写入'} ${copied} 个文件，跳过 ${skipped} 个（无本机源）。`);
if (redacted.length) {
  console.log(`\n脱敏命中 ${redacted.length} 个文件：`);
  for (const r of redacted) console.log(`  - ${r}`);
}
if (!WRITE) console.log('\n（dry run：加 --write 才落盘）');
if (WRITE) console.log('\n提醒：正文已同步，请接着跑 pnpm content-urls:fix 把相对链接/图片改写为源仓绝对地址（部署质检 content-urls:check 会拦截残留）。');
