#!/usr/bin/env node
// init-harness：把仓库重置为白板（fork/degit 后第一步）。
//
// 做六件事：
//   1. 清空 config/content/** 与 config/icons/*（原站主人的私货，保留 .gitkeep）
//   2. config/harness.yaml ← harness.example.yaml（代入 name/title/theme/brand）
//   3. package.json name、index.html <title>
//   4. README.md 与 AGENTS.md ← scripts/templates/ 白板模板（原正文是作者的私货）
//   5. 删除 docs/ 下的作者历史文档（features/issues/essays/lessons/freeform/references/learning）
//   6. .privacy-allow ← 注释模板（原豁免清单放行的是作者的域名）
//
// 用法：pnpm init:harness [--name "Claude Code"] [--title "我的 Claude 背包"]
//                        [--theme pokemon] [--yes]
// 不带 --yes 时交互确认（破坏性操作，不可逆，请在干净副本上运行）。
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const harnessName = flag('name');
const siteTitle = flag('title') ?? (harnessName ? `${harnessName} 背包` : undefined);
const theme = flag('theme');
const yes = args.includes('--yes');

// --name → 内置品牌头像 key（badge 头像与档案弹窗用）
const BRANDS = [
  [/deepseek\s*harness|^dsh$/i, 'dsh'],
  [/claude/i, 'claude-code'],
  [/codex/i, 'codex'],
  [/cursor/i, 'cursor'],
  [/gemini/i, 'gemini-cli'],
  [/opencode/i, 'opencode'],
  [/goose/i, 'goose'],
  [/sourcegraph|^amp\b/i, 'amp'],
  [/copilot/i, 'copilot'],
  [/aider/i, 'aider'],
];
const brand = harnessName ? (BRANDS.find(([re]) => re.test(harnessName))?.[1] ?? 'generic') : 'generic';

console.log('my-harness-inventory · 白板初始化');
console.log(`  目录: ${ROOT}`);

const targets = [
  'config/content',
  'config/icons',
  'config/harness.yaml',
  'package.json',
  'index.html',
  'README.md',
  'AGENTS.md',
  'scripts/templates/README.md.tpl',
  'scripts/templates/AGENTS.md.tpl',
];
for (const t of targets) {
  if (!existsSync(path.join(ROOT, t))) {
    console.error(`✗ 缺少 ${t} —— 请在仓库根目录运行`);
    process.exit(1);
  }
}

// ---- 破坏性操作确认 ----
if (!yes) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    '\n将清空 config/、重置 README 与 AGENTS、删除 docs/ 历史文档与 .privacy-allow（不可逆，请在干净副本上运行）。继续？[y/N] '
  );
  rl.close();
  if (!/^y(es)?$/i.test(answer.trim())) {
    console.log('已取消，未做任何改动。');
    process.exit(0);
  }
}

// ---- 1. 清空内容与自定义图标（保留 .gitkeep 与空目录） ----
let wiped = 0;
for (const dir of ['config/content', 'config/icons']) {
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(p);
        if (readdirSync(p).length === 0) rmSync(p, { recursive: true, force: true });
      } else if (e.name !== '.gitkeep') {
        rmSync(p);
        wiped++;
      }
    }
  };
  walk(path.join(ROOT, dir));
}
console.log(`✓ 已清空 config/content + config/icons（${wiped} 个文件）`);

// ---- 2. harness.yaml ← example（代入身份字段） ----
let yaml = readFileSync(path.join(ROOT, 'config/harness.example.yaml'), 'utf8');
if (harnessName) yaml = yaml.replace(/name: My Agent Harness/, `name: ${harnessName}`);
if (siteTitle) yaml = yaml.replace(/title: 我的 Harness 背包/, `title: ${siteTitle}`);
if (theme) yaml = yaml.replace(/theme: stardew/, `theme: ${theme}`);
if (harnessName) yaml = yaml.replace(/brand: generic/, `brand: ${brand}`);
writeFileSync(path.join(ROOT, 'config/harness.yaml'), yaml);
console.log(`✓ config/harness.yaml 已重置${harnessName ? `（name: ${harnessName}，brand: ${brand}）` : ''}`);

// ---- 3. package.json name / index.html title ----
const slug = (harnessName ?? 'my harness')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '') || 'my-harness-inventory';

const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.name = `${slug}-inventory`;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`✓ package.json name → ${pkg.name}`);

const htmlPath = path.join(ROOT, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
writeFileSync(htmlPath, html.replace(/<title>.*<\/title>/, `<title>${siteTitle ?? '我的 Harness 背包'}</title>`));
console.log('✓ index.html <title> 已更新（构建时仍以 harness.yaml 为准）');

// ---- 4. README / AGENTS ← 白板模板（原正文是作者私货） ----
const fill = (tpl) =>
  tpl.replaceAll('{{TITLE}}', siteTitle ?? '我的 Harness 背包').replaceAll('{{NAME}}', harnessName ?? 'My Agent Harness');
writeFileSync(path.join(ROOT, 'README.md'), fill(readFileSync(path.join(ROOT, 'scripts/templates/README.md.tpl'), 'utf8')));
writeFileSync(path.join(ROOT, 'AGENTS.md'), fill(readFileSync(path.join(ROOT, 'scripts/templates/AGENTS.md.tpl'), 'utf8')));
console.log('✓ README.md / AGENTS.md 已重置为白板模板');

// ---- 5. 删除作者历史文档 ----
const docDirs = ['features', 'issues', 'essays', 'lessons', 'freeform', 'references', 'learning'];
let removedDocs = 0;
for (const d of docDirs) {
  const p = path.join(ROOT, 'docs', d);
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    removedDocs++;
  }
}
if (removedDocs) console.log(`✓ 已删除 docs/ 下 ${removedDocs} 个作者文档目录（${docDirs.join('/')}）`);

// ---- 6. .privacy-allow ← 模板（保留资产署名链接的豁免，去掉作者个人域名） ----
const privacyAllow = `# .privacy-allow：pnpm privacy:scan 的域名豁免清单。
# 每行一个你确认可以公开出现的公共域名（支持后缀匹配），# 开头为注释。
# 下面几项是模板自带资产的署名链接（iconkit/字体许可要求保留），请勿删除：
deviantart.com
scripts.sil.org
openfontlicense.org
takwolf.com
# 你自己的公共站点域名往下追加。任何含个人信息的域名不要写进来。
`;
writeFileSync(path.join(ROOT, '.privacy-allow'), privacyAllow);
console.log('✓ .privacy-allow 已重置为空模板');

// ---- 7. 下一步提示 ----
console.log(`
白板就绪。下一步：
  1. 采集统计：node skills/harness-inventory/scripts/collect-stats.mjs [--harness <id>]
  2. 编辑 config/harness.yaml（nickname/version/since 是占位符，记得替换）与 config/content/**/*.md
     全流程指引：skills/harness-inventory/SKILL.md
  3. 校验 + 预览：pnpm validate && pnpm dev
  4. 发布前自检：pnpm privacy:scan
`);
