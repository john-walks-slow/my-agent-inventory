#!/usr/bin/env node
// privacy-scan：发布前全仓隐私自检。
//
// 硬模式（发现即 exit 1）：私钥、API Key 形态（sk-/ghp_/xox/AKIA/AIza）、
//   赋值形态的 secret/token/password。
// 软模式（仅警告）：公网域名、非保留 IP、个人 home 路径 —— 由人工判断是否脱敏。
//
// 用法：pnpm privacy:scan [--allow example.com --allow api.example.org]
// 占位符（<your-key>、mock-token、xxx…）与生成产物（badges/字体子集）自动豁免。
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const allows = new Set();
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--allow' && args[i + 1]) allows.add(args[i + 1].toLowerCase());
}
// 仓库级白名单 .privacy-allow：每行一个域名（# 注释），子域自动覆盖
try {
  for (const line of readFileSync(path.join(ROOT, '.privacy-allow'), 'utf8').split('\n')) {
    const d = line.trim().toLowerCase();
    if (d && !d.startsWith('#')) allows.add(d);
  }
} catch { /* 无白名单文件则跳过 */ }

// ---- 扫描范围：文本文件，排除生成物/依赖/二进制 ----
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', '.mnemon', 'baseline',
  'badges', // public/badges：内嵌 base64 字体会随机命中密钥形态
  'assets', // src/iconkit/assets 与 src/badge/fonts：二进制字体/图标
  'fonts',
]);
const TEXT_EXT = new Set([
  '.ts', '.tsx', '.mjs', '.js', '.cjs', '.json', '.yaml', '.yml', '.tpl',
  '.md', '.txt', '.html', '.css', '.svg', '.gitkeep', '.gitignore', '',
]);

const SKIP_FILES = new Set(['badge.svg', 'favicon.svg', 'pnpm-lock.yaml']); // 生成物/锁文件

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walk(path.join(dir, e.name));
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (!TEXT_EXT.has(ext)) continue;
      if (SKIP_FILES.has(e.name)) continue;
      yield path.join(dir, e.name);
    }
  }
}

// ---- 规则 ----
const HARD_PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, '私钥文件内容'],
  [/\bsk-[A-Za-z0-9_-]{16,}\b/, 'API Key（sk- 形态）'],
  [/\bghp_[A-Za-z0-9]{30,}\b/, 'GitHub PAT (ghp_)'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/, 'GitHub PAT (github_pat_)'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, 'Slack Token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS Access Key'],
  [/\bAIza[0-9A-Za-z_-]{30,}\b/, 'Google API Key'],
];
const GENERIC_SECRET =
  /\b(api[_-]?key|apikey|secret|access[_-]?token|auth[_-]?token|password|passwd|pwd)\b\s*[:=]\s*["'`][^"'`\s]{10,}["'`]/gi;
const PLACEHOLDER = /^(test|mock|example|sample|dummy|fake|xxx+|changeme|placeholder|redacted|your?|yours|<[^>]*>|\$\{[^}]*}|[A-Z_]+)$/i;

const DOMAIN_RE = /https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi;
// 通配符域名（"*." 前缀 + 多级域名）几乎必是基础设施地址，无 http 前缀也要抓；
// 但要排除文件 glob（*.jsonl / *.md 等——尾段是文件扩展名而非 TLD）
const WILDCARD_DOMAIN_RE = /\*\.([a-z0-9.-]+\.[a-z]{2,})/g;
const NOT_TLD = new Set([
  'ts', 'tsx', 'js', 'mjs', 'cjs', 'json', 'yaml', 'yml', 'md', 'txt', 'html', 'css',
  'svg', 'png', 'gif', 'jpg', 'jpeg', 'webp', 'jsonl', 'zstd', 'gz', 'zip', 'tar',
  'woff', 'woff2', 'ttf', 'otf', 'bak', 'lock', 'log', 'tpl', 'gitkeep',
]);
const IP_RE = /\b(\d{1,3}(?:\.\d{1,3}){3})\b/g;
const HOME_RE = /(?:\/home\/|\/Users\/)([A-Za-z0-9._-]+)/g;
// root 家目录路径（agent 容器常态）：首段非通用工作目录即提醒
const ROOT_RE = /\/root\/([A-Za-z0-9._-]+)/g;
const ROOT_OK = new Set([
  'projects', 'documents', 'downloads', 'docs', 'doc', 'desktop', 'work', 'code',
  'src', 'dev', 'workspace', 'tmp', 'temp', 'data', 'media', 'repo', 'repos',
]);

const DOMAIN_ALLOW = new Set([
  'github.com', 'raw.githubusercontent.com', 'opengameart.org', 'npmjs.org', 'npmjs.com',
  'registry.npmjs.org', 'nodejs.org', 'w3.org', 'www.w3.org', 'developer.mozilla.org',
  'react.dev', 'vite.dev', 'vitejs.dev', 'tailwindcss.com', 'lucide.dev', 'marked.js.org',
  'example.com', 'example.org', 'localhost', 'fonts.google.com', 'fonts.gstatic.com',
  'openai.com', 'anthropic.com', 'schema.org', 'json-schema.org', 'opencode.ai',
  'deepseek.com', 'google.com', 'googleapis.com',
]);
const IP_ALLOW = (ip) =>
  ip === '127.0.0.1' || ip === '0.0.0.0' || ip.startsWith('192.0.2.') ||
  ip.startsWith('198.51.100.') || ip.startsWith('203.0.113.') || ip.startsWith('255.');
const HOME_ALLOW = new Set(['root', 'user', 'users', 'you', 'your-name', 'username', 'yourname', 'name', 'home']);

/** 域名集合后缀匹配：精确命中或任意子域 */
const suffixHit = (set, host) => set.has(host) || [...set].some((a) => host.endsWith(`.${a}`));

const hard = [];
const soft = [];
let scanned = 0;

for (const file of walk(ROOT)) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (content.includes('\0')) continue;
  scanned++;
  const rel = path.relative(ROOT, file);
  const lines = content.split('\n');

  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln];
    for (const [re, label] of HARD_PATTERNS) {
      if (re.test(line)) hard.push({ rel, ln: ln + 1, label, line: line.trim().slice(0, 120) });
    }
    GENERIC_SECRET.lastIndex = 0;
    let m;
    while ((m = GENERIC_SECRET.exec(line))) {
      const value = line.slice(m.index + m[0].length - 20, m.index + m[0].length).match(/["'`]([^"'`]+)["'`]/)?.[1] ?? '';
      if (!PLACEHOLDER.test(value)) {
        hard.push({ rel, ln: ln + 1, label: `疑似赋值密钥（${m[1]}）`, line: line.trim().slice(0, 120) });
      }
    }
    DOMAIN_RE.lastIndex = 0;
    while ((m = DOMAIN_RE.exec(line))) {
      const host = m[1].toLowerCase();
      const allowed =
        suffixHit(DOMAIN_ALLOW, host) ||
        suffixHit(allows, host) ||
        host.endsWith('.github.io');
      if (!allowed) {
        soft.push({ rel, ln: ln + 1, label: `域名 ${m[1]}`, line: line.trim().slice(0, 120) });
      }
    }
    WILDCARD_DOMAIN_RE.lastIndex = 0;
    while ((m = WILDCARD_DOMAIN_RE.exec(line))) {
      const host = m[1].toLowerCase();
      if (NOT_TLD.has(host.split('.').pop())) continue; // 文件 glob，不是域名
      const allowed =
        suffixHit(DOMAIN_ALLOW, host) ||
        suffixHit(allows, host) ||
        host.endsWith('.github.io');
      if (!allowed) {
        soft.push({ rel, ln: ln + 1, label: `通配符域名 *.${m[1]}`, line: line.trim().slice(0, 120) });
      }
    }
    IP_RE.lastIndex = 0;
    while ((m = IP_RE.exec(line))) {
      if (!IP_ALLOW(m[1])) soft.push({ rel, ln: ln + 1, label: `IP ${m[1]}`, line: line.trim().slice(0, 120) });
    }
    HOME_RE.lastIndex = 0;
    while ((m = HOME_RE.exec(line))) {
      if (!HOME_ALLOW.has(m[1].toLowerCase())) {
        soft.push({ rel, ln: ln + 1, label: `个人路径 /${m[1]}`, line: line.trim().slice(0, 120) });
      }
    }
    ROOT_RE.lastIndex = 0;
    while ((m = ROOT_RE.exec(line))) {
      if (!ROOT_OK.has(m[1].toLowerCase())) {
        soft.push({ rel, ln: ln + 1, label: `root 个人路径 /root/${m[1]}`, line: line.trim().slice(0, 120) });
      }
    }
  }
}

const print = (list, title) => {
  if (list.length === 0) return;
  console.log(`\n${title}（${list.length}）`);
  const seen = new Set();
  for (const f of list) {
    const key = `${f.rel}:${f.ln}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  ${f.rel}:${f.ln}  [${f.label}]`);
    console.log(`    ${f.line}`);
  }
};

console.log(`privacy-scan：已扫描 ${scanned} 个文本文件（生成物/依赖已豁免）`);
print(hard, '✗ 硬模式命中（疑似真实凭据）');
print(soft, '⚠ 软模式提醒（域名/IP/个人路径，请人工确认是否脱敏；可用 --allow <域名> 豁免）');

if (hard.length > 0) {
  console.error(`\n✗ privacy:scan 失败：${hard.length} 处硬命中。脱敏后再发布。`);
  process.exit(1);
}
console.log(soft.length === 0 ? '\n✔ 通过：未发现硬命中，也无软提醒。' : `\n✔ 硬模式通过（软提醒 ${soft.length} 处，人工复核后即可发布）。`);
