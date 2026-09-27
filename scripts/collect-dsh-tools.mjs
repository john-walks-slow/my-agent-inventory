#!/usr/bin/env node
/**
 * 从本机 DSH 安装提取工具 inputSchema，写入 config/schemas/<itemId>.json。
 *
 * 来源两棵 node_modules 树：
 *   - DSH 核心：/usr/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/
 *   - 宿主 profile 插件：~/.dsh/profiles/web/node_modules/
 *
 * 提取方式：逐模块加载 cordis 插件，以最小 ctx 桩执行 apply()，
 * 捕获 ctx.tools.register 的 defineTool 定义，经 parameterSchemaSpecToJsonSchema
 * 转成标准 JSON Schema。dsh-mnemon 的 apply 深度耦合运行时无法 mock，
 * 改从其产物源码提取 parameters 字面量（纯 JSON Schema + 常量注入）。
 *
 * 用法：node scripts/collect-dsh-tools.mjs [--check]
 *   --check 只校验 harness.yaml tools 段全覆盖，不写文件。
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { parse } from 'yaml';

const repoRoot = new URL('..', import.meta.url).pathname;
const CORE_TREE = '/usr/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai';
const HOST_TREE = join(homedir(), '.dsh/profiles/web/node_modules');
const SCHEMA_DIR = join(repoRoot, 'config/schemas');

/** mock 加载源：pkg（按树 require）或 file（直接 URL import） */
const SOURCES = [
  { pkg: '@deepseek-ai/dsh-tool-bash', tree: CORE_TREE },
  { pkg: '@deepseek-ai/dsh-tool-fs', tree: CORE_TREE },
  { pkg: '@deepseek-ai/dsh-tool-fs-search', tree: CORE_TREE, config: { sampleOverCapGlobResults: true } },
  { pkg: '@deepseek-ai/dsh-tool-todo', tree: CORE_TREE },
  { pkg: '@deepseek-ai/dsh-tool-web', tree: CORE_TREE },
  { pkg: '@deepseek-ai/dsh-tool-workflow', tree: CORE_TREE },
  { pkg: '@deepseek-ai/dsh-tool-subagent', tree: CORE_TREE, config: { provider: 'spawn', toolName: 'subagent' } },
  { pkg: '@deepseek-ai/dsh-tool-subagent', tree: CORE_TREE, label: 'subagent-fork', config: { provider: 'spawn', toolName: 'subagent_fork' } },
  { pkg: '@deepseek-ai/dsh-tool-subagent-control', tree: CORE_TREE },
  { file: join(CORE_TREE, 'dsh-tool-subagent-control/lib/types/list-agents.js'), label: 'list-agents' },
  { pkg: 'dsh-set-model', tree: HOST_TREE },
  { pkg: 'dsh-clear-mind', tree: HOST_TREE },
  { pkg: 'dsh-wait-subagent', tree: HOST_TREE },
  { pkg: 'dsh-mcp-panel', tree: HOST_TREE },
  { pkg: '@changfenhuang/dsh-genui', tree: HOST_TREE },
  { pkg: '@aiwayds/dsh-subagent-registry', tree: HOST_TREE },
];

const kebab = (name) => name.replace(/_/g, '-');

/** 深度桩：任意属性可链式访问/调用，覆盖插件 apply 里的杂项副作用 */
const deepStub = () => new Proxy(function stub() { return deepStub(); }, {
  get(_t, key) {
    if (key === 'then') return undefined;
    if (key === Symbol.toPrimitive) return () => '';
    return deepStub();
  },
});

/** 最小 cordis ctx：捕获 tools.register，驱动 inject/effect/agents.roots 三类注册路径 */
function makeCtx(captured) {
  const base = {
    tools: { register: (tool) => { captured.push(tool); return { dispose() {} }; } },
    effect(fn) {
      // cordis effect 收 generator 函数/对象或普通函数，统一执行一次；
      // 桩环境下回调可能抛错，吞掉以免中断同一 inject 块内的后续注册
      try {
        const gen = typeof fn === 'function' ? fn() : fn;
        if (gen && typeof gen.next === 'function') while (!gen.next().done);
      } catch { /* 注册副作用可能已完成 */ }
      return () => {};
    },
    on: () => () => {},
    inject: (_deps, cb) => { try { cb(base); } catch { /* 同上 */ } },
  };
  // 同一冻结数组：插件会用 roots().includes(agent) 去重
  base.agents = { roots: () => ROOT_AGENTS };
  const ROOT_AGENTS = Object.freeze([{ ctx: base, session: { header: {} } }]);
  return new Proxy(base, { get(t, key) { if (key in t) return t[key]; return deepStub(); } });
}

async function collectFromSource(source) {
  const mod = source.file
    ? await import(pathToFileURL(source.file).href)
    : createRequire(pathToFileURL(source.tree + '/'))(source.pkg);
  const captured = [];
  const ctx = makeCtx(captured);
  let config = { ...source.config };
  if (mod.Config) {
    try { config = mod.Config(config); } catch { /* required 项缺失时保留 override */ }
  }
  try {
    await mod.apply(ctx, config);
  } catch (err) {
    return { label: source.label ?? source.pkg, tools: [], err: String(err?.message ?? err).slice(0, 120) };
  }
  return { label: source.label ?? source.pkg, tools: captured, err: null };
}

/** 从 dsh-mnemon 产物源码提取 parameters 字面量（字符串感知的括号平衡 + 常量注入） */
function extractMnemonSchemas() {
  const src = readFileSync(join(HOST_TREE, 'dsh-mnemon/lib/index.js'), 'utf8');
  const constants = {
    CATEGORIES: ['preference', 'decision', 'fact', 'insight', 'context', 'general'],
    SOURCES: ['user', 'agent', 'external'],
  };
  const out = {};
  for (const tool of ['mnemon_recall', 'mnemon_remember']) {
    const nameIdx = src.indexOf(`name: "${tool}"`);
    if (nameIdx < 0) throw new Error(`dsh-mnemon 源码中找不到 ${tool}`);
    const start = src.indexOf('parameters: {', nameIdx) + 'parameters: '.length;
    let depth = 0;
    let i = start;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '"' || ch === "'") {
        i++;
        while (i < src.length && src[i] !== ch) i += src[i] === '\\' ? 2 : 1;
      } else if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) break;
      i++;
    }
    const literal = src.slice(start, i + 1);
    out[tool] = vm.runInNewContext(`(${literal})`, constants);
  }
  return out;
}

async function main() {
  const checkOnly = process.argv.includes('--check');

  const harness = parse(readFileSync(join(repoRoot, 'config/harness.yaml'), 'utf8'));
  const toolsSection = harness.sections.find((s) => s.id === 'tools');
  const wanted = new Set(toolsSection.items.map((item) => item.id));

  const { parameterSchemaSpecToJsonSchema } = createRequire(
    pathToFileURL(join(CORE_TREE, 'dsh-tools/')),
  )('@deepseek-ai/dsh-tools');

  const schemas = new Map(); // toolName -> JSON Schema
  for (const source of SOURCES) {
    const { tools, err } = await collectFromSource(source);
    if (err) console.warn(`! ${source.label ?? source.pkg}: ${err}`);
    for (const tool of tools) {
      if (!tool?.parameters) continue;
      // 两种约定并存：schemastery 属性映射 vs 完整 JSON Schema（如 host 插件）
      const p = tool.parameters;
      const isPlainJsonSchema = p.type === 'object' && typeof p.properties === 'object';
      schemas.set(tool.name, isPlainJsonSchema ? p : parameterSchemaSpecToJsonSchema(p));
    }
  }
  for (const [name, schema] of Object.entries(extractMnemonSchemas())) {
    schemas.set(name, schema);
  }

  const collected = new Set([...schemas.keys()].map(kebab));
  const written = [];
  const unchanged = [];
  for (const id of wanted) {
    const schema = schemas.get(id.replaceAll('-', '_'));
    if (!schema) continue;
    const file = join(SCHEMA_DIR, `${id}.json`);
    const content = `${JSON.stringify(schema, null, 2)}\n`;
    if (existsSync(file) && readFileSync(file, 'utf8') === content) { unchanged.push(id); continue; }
    if (!checkOnly) writeFileSync(file, content);
    written.push(id);
  }

  const missing = [...wanted].filter((id) => !collected.has(id) && !existsSync(join(SCHEMA_DIR, `${id}.json`)));
  const extra = [...collected].filter((id) => !wanted.has(id));

  const verb = checkOnly ? '已就绪' : '已写入';
  console.log(`schemas ${verb}: ${[...written, ...unchanged].length}/${wanted.size}`);
  if (written.length && !checkOnly) console.log(`  写入: ${written.join(', ')}`);
  if (missing.length) console.warn(`  缺失: ${missing.join(', ')}`);
  if (extra.length) console.log(`  未收录(不在 tools section): ${extra.join(', ')}`);
  process.exit(missing.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
