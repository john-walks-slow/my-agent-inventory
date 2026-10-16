#!/usr/bin/env node
// fix-content-urls：正文相对链接/图片改写为源仓绝对地址。
//
// 背景：config/content/<section>/<id>.md 多是从各插件仓 README 原样同步来的，
// 站内渲染（marked 直出）没有 base 重写，相对路径会解析到本站域名下 → 图片全挂、链接 404。
// 本脚本按 harness.yaml 条目的 repo 字段定位源仓，把相对引用改写成：
//   图片（Markdown ![]() / <img src> / <source srcset>）
//     → https://raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>
//   链接（Markdown []() / <a href>）
//     → https://github.com/<owner>/<repo>/blob/HEAD/<path>
// 用 HEAD 作 ref 免维护各仓默认分支名（main/master 不一）。
//
// 跳过：绝对 URL、#锚点、mailto:/data: 等带 scheme 的、//协议相对、
// 以 / 开头的（正文里的示例假路径）、含 < > 或空白的占位符、../ 逃逸仓根的。
// 没有 repo 字段的条目（如 tomes/本地 skill）不在处理范围。
//
// 用法：
//   node scripts/fix-content-urls.mjs           改写并落盘，打印每文件改动数
//   node scripts/fix-content-urls.mjs --check   只检查：有残留相对引用 exit 1（CI/部署质检用）
//
// 流程：每次 pnpm sync:content 同步正文之后跑一次本脚本（或靠部署质检的 --check 兜底拦截）。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

const config = parseYaml(readFileSync(path.join(ROOT, 'config/harness.yaml'), 'utf8'));

// content 文件 → 源仓 {owner, repo}
const repoByFile = new Map();
for (const sec of config.sections ?? []) {
  for (const item of sec.items ?? []) {
    const m = /^https:\/\/github\.com\/([^/]+)\/([^/#]+?)\/?$/.exec(item.repo ?? '');
    if (!m) continue;
    repoByFile.set(`${sec.id}/${item.id}`, { owner: m[1], repo: m[2] });
  }
}

function isSkippable(url) {
  return (
    !url ||
    url.startsWith('#') ||
    url.startsWith('/') || // 含正文示例假路径
    url.startsWith('//') ||
    /^[a-z][a-z0-9+.-]*:/i.test(url) || // http: https: mailto: data: ...
    url.includes('<') ||
    url.includes('>') ||
    url.startsWith('../')
  );
}

function cleanPath(url) {
  return url.replace(/^\.\//, '');
}

function encodePath(p) {
  // 已含 % 的段视为已编码，不二次编码
  return p
    .split('/')
    .map((seg) => (seg.includes('%') ? seg : encodeURIComponent(seg)))
    .join('/');
}

function toRaw({ owner, repo }, p) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${encodePath(p)}`;
}
function toBlob({ owner, repo }, p) {
  return `https://github.com/${owner}/${repo}/blob/HEAD/${encodePath(p)}`;
}

// 在一段文本里改写所有相对引用；kind: 'img' | 'link' 由匹配形态决定
function rewrite(text, gh) {
  let count = 0;
  const leftovers = [];
  const handle = (url, kind) => {
    if (isSkippable(url)) {
      if (!url.startsWith('/') && !url.includes('<') && !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('#') && !url.startsWith('//')) {
        leftovers.push(url);
      }
      return url;
    }
    count++;
    const p = cleanPath(url);
    return kind === 'img' ? toRaw(gh, p) : toBlob(gh, p);
  };

  let out = text;
  // Markdown 图片 ![alt](url) / ![alt](<url>)
  out = out.replace(/!\[([^\]]*)\]\(<?([^)\s>]+)>?([^)]*)\)/g, (m, alt, url, rest) =>
    isSkippable(url) ? m : `![${alt}](${handle(url, 'img')}${rest})`,
  );
  // Markdown 链接 [text](url)（图片已被上一条处理，剩余 ! 前缀不会再命中）
  out = out.replace(/(?<!!)\[([^\]]*)\]\(<?([^)\s>]+)>?([^)]*)\)/g, (m, label, url, rest) =>
    isSkippable(url) ? m : `[${label}](${handle(url, 'link')}${rest})`,
  );
  // HTML <img src="...">
  out = out.replace(/(<img[^>]+src=")([^"]+)(")/g, (m, pre, url, post) =>
    isSkippable(url) ? m : pre + handle(url, 'img') + post,
  );
  // HTML <source srcset="url ...">
  out = out.replace(/(<source[^>]+srcset=")([^"\s,]+)/g, (m, pre, url) =>
    isSkippable(url) ? m : pre + handle(url, 'img'),
  );
  // HTML <a href="...">
  out = out.replace(/(<a[^>]+href=")([^"]+)(")/g, (m, pre, url, post) =>
    isSkippable(url) ? m : pre + handle(url, 'link') + post,
  );
  // check 模式下重新扫描残留（write 模式改写后亦应为零）
  return { text: out, count, leftovers };
}

let totalChanged = 0;
let totalLeft = 0;
for (const [key, gh] of repoByFile) {
  const file = path.join(ROOT, 'config/content', `${key}.md`);
  if (!existsSync(file)) continue;
  const before = readFileSync(file, 'utf8');
  const { text, count } = rewrite(before, gh);
  // 残留扫描：对改写后的文本找仍为相对形态的引用
  const rel = [
    ...text.matchAll(/!?\[[^\]]*\]\(<?([^)\s>]+)>?[^)]*\)/g),
    ...text.matchAll(/<(?:img|a|source)[^>]+(?:src|href|srcset)="([^"\s,]+)"/g),
  ]
    .map((m) => m[1])
    .filter((u) => !isSkippable(u));
  if (rel.length) {
    totalLeft += rel.length;
    console.log(`! ${key}.md 残留相对引用 ${rel.length}: ${[...new Set(rel)].join(', ')}`);
  }
  if (count > 0) {
    totalChanged += count;
    console.log(`${CHECK ? 'would fix' : 'fixed'} ${key}.md: ${count} 处`);
    if (!CHECK && text !== before) writeFileSync(file, text);
  }
}

if (CHECK) {
  if (totalLeft > 0) {
    console.error(`✘ check 失败：${totalLeft} 处相对引用未改写，先跑 pnpm content-urls:fix`);
    process.exit(1);
  }
  console.log('✔ check 通过：源仓正文无残留相对引用');
} else {
  console.log(`完成：共改写 ${totalChanged} 处`);
}
