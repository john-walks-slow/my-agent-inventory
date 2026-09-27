#!/usr/bin/env node
// DSH 会话统计采集器（规范口径）。
//
// 口径（与 config/harness.yaml stats 字段一致）：
//   - 会话数 = 首行 type=="session" 计数，按 header.origin 区分 root / subagent
//   - 展示 sessions = root 主会话数；subagentSessions 仅作档案彩蛋
//   - tokens = 非缓存 inputTokens + outputTokens（cacheReadTokens 单独统计）
//   - usage 真源 = type=="assistant/message" 的 data.usage（结构化解析，禁 grep 子串）
//
// 用法：node scripts/collect-dsh-stats.mjs [--sessions-dir <dir>] [--json]
// 零依赖：node:fs + node:child_process 调 zstd CLI。

import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { homedir } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const sessionsDir = args.includes('--sessions-dir')
  ? args[args.indexOf('--sessions-dir') + 1]
  : path.join(homedir(), '.dsh/sessions');

async function collectFiles() {
  const files = [];
  for (const ws of await readdir(sessionsDir, { withFileTypes: true })) {
    if (!ws.isDirectory()) continue;
    const wsDir = path.join(sessionsDir, ws.name);
    for (const session of await readdir(wsDir, { withFileTypes: true })) {
      if (!session.isDirectory()) continue;
      const sDir = path.join(wsDir, session.name);
      const names = (await readdir(sDir)).filter(
        (f) => f.startsWith('session') && f.includes('.jsonl') && !f.includes('.bak') && !f.includes('.corrupt-bak')
      );
      // 同目录同时存在 v3 与旧版（升级重写，同一会话双份记录）时只取 v3，避免双计数
      const hasV3 = names.some((f) => f.startsWith('session.v3.'));
      for (const f of names) {
        if (hasV3 && !f.startsWith('session.v3.')) continue;
        files.push(path.join(sDir, f));
      }
    }
  }
  return files;
}

const USAGE_KEY = '"assistant/message"';

/** 逐行扫描单个 session 文件（readline 异步迭代自带背压） */
async function scanFile(file, acc) {
  const child = spawn('zstd', ['-dcq', file], { stdio: ['ignore', 'pipe', 'ignore'] });
  const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
  let headerParsed = false;
  try {
    for await (const line of rl) {
      if (line.length === 0) continue;
      if (!headerParsed) {
        // 首行 = session header（createdAt / origin / cwd）
        try {
          const head = JSON.parse(line);
          if (head.type === 'session') {
            // 无 origin 字段的 header 即 root 主会话
            const origin = head.origin ?? 'root';
            acc.originCounts[origin] = (acc.originCounts[origin] ?? 0) + 1;
            if (origin === 'subagent') acc.subagentSessions += 1;
            else acc.rootSessions += 1;
            const created = head.createdAt ?? 0;
            if (created > 0) {
              if (acc.firstCreatedAt === null || created < acc.firstCreatedAt) acc.firstCreatedAt = created;
              if (created > acc.lastCreatedAt) acc.lastCreatedAt = created;
            }
            headerParsed = true;
            continue;
          }
        } catch { /* 首行损坏则跳过本文件 header */ }
      }
      // 子串预筛：assistant/message 行必然包含该子串，跳过绝大多数行
      if (!line.includes(USAGE_KEY)) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { acc.parseErrors += 1; continue; }
      if (msg.type !== 'assistant/message' || !msg.data?.usage) continue;
      const u = msg.data.usage;
      acc.assistantMessages += 1;
      acc.inputTokens += u.inputTokens ?? 0;
      acc.outputTokens += u.outputTokens ?? 0;
      acc.totalTokens += u.totalTokens ?? 0;
      acc.cacheReadTokens += u.cacheReadTokens ?? 0;
    }
  } finally {
    child.kill();
  }
  if (!headerParsed) acc.filesWithoutHeader += 1;
}

async function pool(files, worker, size = 8) {
  let i = 0;
  const acc = {
    rootSessions: 0, subagentSessions: 0, assistantMessages: 0,
    inputTokens: 0, outputTokens: 0, totalTokens: 0, cacheReadTokens: 0,
    parseErrors: 0, filesWithoutHeader: 0, originCounts: {},
    firstCreatedAt: null, lastCreatedAt: null,
  };
  await Promise.all(
    Array.from({ length: Math.min(size, files.length) }, async () => {
      while (i < files.length) {
        const idx = i++;
        try {
          await worker(files[idx], acc);
        } catch (e) {
          console.error(`[warn] ${files[idx]}: ${e.message}`);
        }
        if (idx % 200 === 0) console.error(`[progress] ${idx}/${files.length}`);
      }
    })
  );
  return acc;
}

const files = await collectFiles();
console.error(`[scan] ${files.length} session files under ${sessionsDir}`);
const acc = await pool(files, scanFile);

const fmt = (n) => n.toLocaleString('en-US');
const iso = (ms) => (ms === null ? null : new Date(ms).toISOString().slice(0, 10));

const report = {
  files: files.length,
  rootSessions: acc.rootSessions,
  subagentSessions: acc.subagentSessions,
  sessionsTotal: acc.rootSessions + acc.subagentSessions,
  assistantMessages: acc.assistantMessages,
  inputTokens: acc.inputTokens,
  outputTokens: acc.outputTokens,
  tokens: acc.inputTokens + acc.outputTokens,
  cacheReadTokens: acc.cacheReadTokens,
  totalTokens: acc.totalTokens,
  firstSessionDate: iso(acc.firstCreatedAt),
  lastSessionDate: iso(acc.lastCreatedAt),
  originCounts: acc.originCounts,
  parseErrors: acc.parseErrors,
  filesWithoutHeader: acc.filesWithoutHeader,
};

if (args.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`DSH session stats (${sessionsDir})`);
  console.log(`  files:                ${fmt(report.files)} (excl .bak/.corrupt-bak)`);
  console.log(`  root sessions:        ${fmt(report.rootSessions)}`);
  console.log(`  subagent sessions:    ${fmt(report.subagentSessions)}`);
  console.log(`  assistant messages:   ${fmt(report.assistantMessages)}`);
  console.log(`  input tokens:         ${fmt(report.inputTokens)}`);
  console.log(`  output tokens:        ${fmt(report.outputTokens)}`);
  console.log(`  tokens (non-cached):  ${fmt(report.tokens)}`);
  console.log(`  cache-read tokens:    ${fmt(report.cacheReadTokens)}`);
  console.log(`  first session:        ${report.firstSessionDate}`);
  console.log(`  last session:         ${report.lastSessionDate}`);
  console.log(`  origin counts:        ${JSON.stringify(report.originCounts)}`);
  console.log(`  parse errors:         ${fmt(report.parseErrors)}, no-header files: ${fmt(report.filesWithoutHeader)}`);
}
