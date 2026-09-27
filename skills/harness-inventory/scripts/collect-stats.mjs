#!/usr/bin/env node
// harness 统计采集器：自动探测本机 harness，输出 harness.yaml 可用的 YAML 片段。
//
// 展示口径（全站统一）：
//   sessions = root 主会话数（不含子代理；子代理量作档案彩蛋）
//   tokens   = 非缓存 input+output 累计
//
// 全量采集：DSH / Claude Code / Codex CLI
// 仅探测：Cursor / OpenCode / Goose / Amp / Gemini CLI / Copilot / Aider
//         （打印指引 → references/harnesses/ 对应指南手动采集）
//
// 用法：node skills/harness-inventory/scripts/collect-stats.mjs [--harness <id>] [--json]
//   <id>：dsh | claude-code | codex（全量）或 cursor/opencode/goose/amp/gemini-cli/copilot/aider（仅指引）
//
// 输出通道：YAML/JSON 结果走 stdout（可安全重定向）；进度与提示走 stderr。
// 退出码：0 成功；1 未探测到/未知 id；2 需人类选择（多 harness 冲突或仅探测型）。
//
// 流程：先快速探测（只数文件、不解析内容，秒级）——多个 harness 有数据时立即
// exit 2 呈报，指定 --harness 后才做全量解析（大量会话可能需要数十秒到几分钟）。
//
// 要求 Node ≥ 22（DSH 的 zstd 会话依赖系统 zstd CLI）。
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { homedir } from 'node:os';
import path from 'node:path';

const HOME = homedir();
const args = process.argv.slice(2);
const want = args.includes('--harness') ? args[args.indexOf('--harness') + 1] : null;
const jsonOut = args.includes('--json');
const log = (...a) => console.error(...a); // 进度/提示一律走 stderr

// ---------- 通用工具 ----------

async function walkJsonl(dir, out = []) {
  if (!dir || !existsSync(dir)) return out;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walkJsonl(p, out);
    else if (e.name.endsWith('.jsonl')) out.push(p);
  }
  return out;
}

async function birthDate(dir) {
  try {
    const s = await stat(dir);
    return (s.birthtimeMs > 0 ? s.birthtime : s.mtime).toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
}

// ---------- DSH（全量：zstd 会话流） ----------

function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(HOME, '.claude');
}
function codexBase() {
  return process.env.CODEX_HOME || path.join(HOME, '.codex');
}

/** DSH 会话文件清单（探测与采集共用；只列文件不解压） */
async function listDshFiles() {
  const dir = path.join(HOME, '.dsh/sessions');
  if (!existsSync(dir)) return null;
  const files = [];
  for (const ws of readdirSync(dir, { withFileTypes: true })) {
    if (!ws.isDirectory()) continue;
    for (const session of readdirSync(path.join(dir, ws.name), { withFileTypes: true })) {
      if (!session.isDirectory()) continue;
      const sDir = path.join(dir, ws.name, session.name);
      const names = readdirSync(sDir).filter(
        (f) => f.startsWith('session') && f.includes('.jsonl') && !f.includes('.bak') && !f.includes('.corrupt-bak')
      );
      const hasV3 = names.some((f) => f.startsWith('session.v3.'));
      for (const f of names) {
        if (hasV3 && !f.startsWith('session.v3.')) continue;
        files.push(path.join(sDir, f));
      }
    }
  }
  return files;
}

async function collectDsh() {
  const files = await listDshFiles();
  if (files === null) return null;
  log(`[collect] dsh：解压解析 ${files.length} 个会话文件…`);
  const acc = { root: 0, sub: 0, input: 0, output: 0, cacheRead: 0, first: Infinity, done: 0 };
  const KEY = '"assistant/message"';
  await Promise.all(
    files.map(async (file) => {
      const child = spawn('zstd', ['-dcq', file], { stdio: ['ignore', 'pipe', 'ignore'] });
      const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
      let headerDone = false;
      try {
        for await (const line of rl) {
          if (!line) continue;
          if (!headerDone) {
            try {
              const head = JSON.parse(line);
              if (head.type === 'session') {
                if (head.origin === 'subagent') acc.sub++;
                else acc.root++;
                if (head.createdAt > 0 && head.createdAt < acc.first) acc.first = head.createdAt;
                headerDone = true;
                continue;
              }
            } catch { /* 损坏 header */ }
          }
          if (!line.includes(KEY)) continue;
          try {
            const msg = JSON.parse(line);
            const u = msg?.data?.usage;
            if (msg.type === 'assistant/message' && u) {
              acc.input += u.inputTokens ?? 0;
              acc.output += u.outputTokens ?? 0;
              acc.cacheRead += u.cacheReadTokens ?? 0;
            }
          } catch { /* skip */ }
        }
      } finally {
        child.kill();
        if (++acc.done % 25 === 0) log(`  … dsh ${acc.done}/${files.length}`);
      }
    })
  );
  return {
    id: 'dsh', name: 'DeepSeek Harness', brand: 'dsh',
    since: acc.first === Infinity ? await birthDate(path.join(HOME, '.dsh')) : new Date(acc.first).toISOString().slice(0, 10),
    sessions: acc.root, subagentSessions: acc.sub,
    tokens: acc.input + acc.output, cacheTokens: acc.cacheRead,
    note: `${files.length} 个会话文件；tokens=非缓存 input+output`,
  };
}

// ---------- Claude Code（全量：projects/**/*.jsonl） ----------

/** 扫描 projects 目录：主会话文件（含 mtime）+ 子代理会话数。探测与采集共用。 */
async function scanClaudeProjects() {
  const dir = claudeDir();
  if (!existsSync(dir)) return null;
  const projects = path.join(dir, 'projects');
  if (!existsSync(projects)) return { files: [], subagents: 0, noProjects: true };
  const files = [];
  let subagents = 0;
  for (const proj of await readdir(projects, { withFileTypes: true })) {
    if (!proj.isDirectory()) continue;
    const pDir = path.join(projects, proj.name);
    for (const e of await readdir(pDir, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith('.jsonl')) {
        const p = path.join(pDir, e.name);
        files.push({ path: p, mtime: (await stat(p)).mtimeMs });
      } else if (e.isDirectory()) {
        // 布局：projects/<proj>/<session-uuid>/subagents/*.jsonl（新版）
        //      或 projects/<proj>/subagents/*.jsonl（旧版直挂）
        const sub = e.name === 'subagents' ? path.join(pDir, e.name) : path.join(pDir, e.name, 'subagents');
        if (existsSync(sub)) {
          for (const f of await readdir(sub)) if (f.endsWith('.jsonl')) subagents++;
        }
      }
    }
  }
  return { files, subagents, noProjects: false };
}

async function collectClaudeCode() {
  const scan = await scanClaudeProjects();
  if (scan === null) return null;
  const dir = claudeDir();
  const res = {
    id: 'claude-code', name: 'Claude Code', brand: 'claude-code',
    since: undefined, sessions: scan.files.length, subagentSessions: scan.subagents,
    tokens: 0, cacheTokens: 0, note: '',
  };
  // since：stats-cache.json 的 firstSessionDate → 最早主会话 jsonl mtime → ~/.claude 目录时间
  try {
    const cache = JSON.parse(await readFile(path.join(dir, 'stats-cache.json'), 'utf8'));
    if (cache.firstSessionDate) res.since = String(cache.firstSessionDate).slice(0, 10);
  } catch { /* 可选缓存 */ }
  if (!res.since) {
    const minM = scan.files.length ? Math.min(...scan.files.map((f) => f.mtime)) : NaN;
    res.since = Number.isFinite(minM) ? new Date(minM).toISOString().slice(0, 10) : await birthDate(dir);
  }
  if (scan.noProjects) {
    res.note = '未找到 projects 目录，仅返回安装日期';
    return res;
  }
  log(`[collect] claude-code：解析 ${scan.files.length} 个会话文件…`);
  let input = 0, output = 0, cacheRead = 0, done = 0;
  const seen = new Set();
  for (const { path: file } of scan.files) {
    for (const line of (await readFile(file, 'utf8')).split('\n')) {
      if (!line.includes('"type":"assistant"')) continue;
      try {
        const r = JSON.parse(line);
        const u = r?.message?.usage;
        if (r.type === 'assistant' && u) {
          const mid = r.message.id;
          if (mid && seen.has(mid)) continue;
          if (mid) seen.add(mid);
          input += u.input_tokens ?? 0;
          output += u.output_tokens ?? 0;
          cacheRead += u.cache_read_input_tokens ?? 0;
        }
      } catch { /* skip */ }
    }
    if (++done % 50 === 0) log(`  … claude-code ${done}/${scan.files.length}`);
  }
  res.tokens = input + output;
  res.cacheTokens = cacheRead;
  res.note = 'input_tokens 不含 cache_read（Anthropic 口径），两者独立相加展示';
  return res;
}

// ---------- Codex CLI（全量：rollout-*.jsonl，token_usage 为累积值取末值） ----------

async function collectCodex() {
  const base = codexBase();
  if (!existsSync(base)) return null;
  const files = await walkJsonl(path.join(base, 'sessions'));
  const res = {
    id: 'codex', name: 'OpenAI Codex CLI', brand: 'codex',
    since: undefined, sessions: files.length, subagentSessions: 0, tokens: 0, cacheTokens: 0,
    note: 'rollout 内 token_usage 为会话内累积值，每会话取末值再求和',
  };
  // since：rollout 文件名里的最早日期 → ~/.codex 目录时间
  const dates = files.map((f) => path.basename(f).match(/^rollout-(\d{4}-\d{2}-\d{2})T/)?.[1]).filter(Boolean);
  res.since = dates.length ? dates.sort()[0] : await birthDate(base);
  log(`[collect] codex：解析 ${files.length} 个会话文件…`);
  let done = 0;
  for (const f of files) {
    let lastUsage = null;
    for (const line of (await readFile(f, 'utf8')).split('\n')) {
      if (!line.includes('token_usage')) continue;
      try {
        const r = JSON.parse(line);
        const u = r?.payload?.info?.token_usage ?? r?.info?.token_usage;
        if (u) lastUsage = u;
      } catch { /* skip */ }
    }
    if (lastUsage) {
      const cached = lastUsage.cached_input_tokens ?? 0;
      res.tokens += Math.max(0, (lastUsage.input_tokens ?? 0) - cached) + (lastUsage.output_tokens ?? 0);
      res.cacheTokens += cached;
    }
    if (++done % 50 === 0) log(`  … codex ${done}/${files.length}`);
  }
  return res;
}

// ---------- 仅探测型 ----------

const PROBES = [
  { id: 'cursor', name: 'Cursor', brand: 'cursor', dirs: ['~/.cursor'], guide: 'cursor.md' },
  { id: 'opencode', name: 'OpenCode', brand: 'opencode', dirs: ['~/.local/share/opencode', '~/.config/opencode'], guide: 'generic.md' },
  { id: 'goose', name: 'Goose', brand: 'goose', dirs: ['~/.config/goose'], guide: 'generic.md' },
  { id: 'amp', name: 'Amp', brand: 'amp', dirs: ['~/.config/amp', '~/.amp'], guide: 'generic.md' },
  { id: 'gemini-cli', name: 'Gemini CLI', brand: 'gemini-cli', dirs: ['~/.gemini'], guide: 'generic.md' },
  { id: 'copilot', name: 'GitHub Copilot CLI', brand: 'copilot', dirs: ['~/.copilot'], guide: 'generic.md' },
  { id: 'aider', name: 'Aider', brand: 'aider', dirs: ['~/.aider'], guide: 'generic.md' },
];

// ---------- 主流程：先快速探测，冲突立即呈报，再做全量采集 ----------

const COLLECTORS = { dsh: collectDsh, 'claude-code': collectClaudeCode, codex: collectCodex };
const NAMES = { dsh: 'DeepSeek Harness', 'claude-code': 'Claude Code', codex: 'OpenAI Codex CLI' };
const PROBE_IDS = new Set(PROBES.map((p) => p.id));

if (want && !COLLECTORS[want] && !PROBE_IDS.has(want)) {
  console.error(`未知 harness id "${want}"。`);
  console.error(`可全量采集：${Object.keys(COLLECTORS).join(' / ')}`);
  console.error(`仅探测指引：${[...PROBE_IDS].join(' / ')}`);
  process.exit(1);
}

if (want && PROBE_IDS.has(want)) {
  const p = PROBES.find((x) => x.id === want);
  console.error(`${p.name}：本脚本未内置解析（探测到 ${p.dirs.join(' / ')}）。`);
  console.error(`手动采集指引：skills/harness-inventory/references/harnesses/${p.guide}`);
  process.exit(2);
}

// 快速探测：只数文件、不解析内容（秒级）
log('[probe] 快速探测本机 harness…');
const detected = [];
if (!want || want === 'dsh') {
  const n = (await listDshFiles())?.length ?? null;
  if (n !== null) detected.push({ id: 'dsh', sessions: n });
}
if (!want || want === 'claude-code') {
  const scan = await scanClaudeProjects();
  if (scan !== null) detected.push({ id: 'claude-code', sessions: scan.noProjects ? 0 : scan.files.length });
}
if (!want || want === 'codex') {
  if (existsSync(codexBase())) {
    detected.push({ id: 'codex', sessions: (await walkJsonl(path.join(codexBase(), 'sessions'))).length });
  }
}

const detectedOnly = PROBES.filter((p) => p.dirs.some((d) => existsSync(d.replace(/^~/, HOME))));

if (!want) {
  const active = detected.filter((d) => d.sessions > 0);
  if (active.length > 1) {
    console.error('探测到多个 harness（快速计数，未解析内容）：');
    active.forEach((d, i) => console.error(`  ${i + 1}. ${NAMES[d.id]}（${d.sessions} 个会话文件）`));
    console.error('用 --harness <id> 指定其一后重新运行。');
    process.exit(2);
  }
}

let target = want;
if (!target) {
  const active = detected.filter((d) => d.sessions > 0);
  if (active.length === 1) target = active[0].id;
  else if (detected.length === 1) target = detected[0].id; // 已安装但暂无会话
}

if (!target) {
  if (detectedOnly.length > 0) {
    for (const d of detectedOnly) {
      console.error(`[探测] ${d.name}（${d.dirs[0]} 存在）—— 本脚本未内置解析，手动采集见 references/harnesses/${d.guide}`);
    }
    process.exit(2);
  }
  console.error('未探测到已知 harness（DSH/Claude Code/Codex/Cursor/OpenCode/Goose/Amp/Gemini CLI/Copilot/Aider）。');
  console.error('手动采集指引：skills/harness-inventory/references/harnesses/generic.md');
  process.exit(1);
}

for (const d of detectedOnly) {
  if (d.id === target) continue;
  console.error(`[探测] ${d.name}（${d.dirs[0]} 存在）—— 本脚本未内置解析，手动采集见 references/harnesses/${d.guide}`);
}

const r = await COLLECTORS[target]();
if (!r) {
  console.error(`采集 ${NAMES[target]} 失败：未找到会话数据。`);
  process.exit(1);
}

const y = (n) => (n >= 100 ? Math.round(n) : n); // 默认取整

if (jsonOut) {
  console.log(JSON.stringify(r, null, 2));
} else {
  console.log(`# collect-stats 输出（${r.name}，采集于 ${new Date().toISOString().slice(0, 10)}）`);
  console.log(`# ${r.note}`);
  console.log(`harness:\n  brand: ${r.brand}`);
  if (r.since) console.log(`  since: "${r.since}"`);
  console.log(`  stats:\n    sessions: ${y(r.sessions)}`);
  if (r.subagentSessions) console.log(`    subagentSessions: ${y(r.subagentSessions)}`);
  console.log(`    tokens: ${y(r.tokens)}`);
  if (r.cacheTokens) console.log(`    cacheTokens: ${y(r.cacheTokens)}`);
}
