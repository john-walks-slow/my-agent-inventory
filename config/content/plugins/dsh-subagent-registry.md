# dsh-subagent-registry

Claude-style `.agent.md` subagent registry for DeepSeek Harness.

Scans `.dsh/subagents/`, `.claude/agents/`, and `.agents/subagents/` directories (both project and user level) for Markdown files with YAML frontmatter that define specialized subagents. Each subagent gets its own system prompt (persona), tool whitelist, and model.

## Install

Add to your profile `package.json`:

```jsonc
{
  "dependencies": {
    "dsh-subagent-registry": "link:D:/Personal/dsh-workspace/dsh-subagent-registry"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-subagent-registry"]
    }
  }
}
```

Add to your profile `cordis.patch.yml`:

```yaml
- id: subagent-registry
  name: dsh-subagent-registry
```

Run `pnpm install`, then `node build.mjs` in the plugin directory to fix the pnpm junction. Restart DSH.

## How It Works

The plugin scans for `.agent.md` files in these directories (priority order):

| Priority | Path | Level |
|----------|------|-------|
| 1-3 | `{cwd}/.dsh/subagents/` | Project (walking up to repo root) |
| 1-3 | `{cwd}/.claude/agents/` | Project (walking up to repo root) |
| 1-3 | `{cwd}/.agents/subagents/` | Project (walking up to repo root) |
| 4-6 | `~/.dsh/subagents/` | User |
| 4-6 | `~/.claude/agents/` | User |
| 4-6 | `~/.agents/subagents/` | User |
| 7+ | `scanRoots` config | Custom |

All three directory names are interleaved at each level so proximity to cwd determines priority.

### .agent.md File Format

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
disallowedTools: Write
model: sonnet
maxTurns: 10
color: green
background: false
skills:
  - dsh-plugin-dev
  - bad-smell
mcpServers:
  - firecrawl
memory: project
isolation: worktree
---

You are a meticulous code reviewer. Your responsibilities are:
1. Read and understand the code changes
2. Identify potential bugs and security issues
3. Suggest specific, actionable improvements
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase, hyphens; must not start with `-` or contain `:`) |
| `description` | Yes | When to delegate to this agent |
| `tools` | No | Tool whitelist (comma-separated string or YAML array) |
| `disallowedTools` | No | Tool denylist — overrides `tools` when both are present |
| `model` | No | Model alias (sonnet/haiku/opus/inherit) or full model ID |
| `maxTurns` | No | Max subagent turns *(advisory — DSH API does not support turn limits yet)* |
| `effort` | No | Reasoning effort level *(advisory — not injectable via AgentOptions)* |
| `color` | No | UI display color |
| `background` | No | Prefer background execution |
| `initialPrompt` | No | Auto-submit first prompt *(main-session agents only; ignored for subagent dispatch)* |
| `skills` | No | Skills to preload into context (string array) |
| `mcpServers` | No | MCP servers available to the subagent (array of strings or objects) |
| `hooks` | No | Lifecycle hooks *(parsed; DSH has no hook injection API yet)* |
| `memory` | No | Persistent memory scope: `user`, `project`, or `local` |
| `isolation` | No | Isolation mode: `worktree` *(advisory — DSH has no worktree API yet)* |

The Markdown body becomes the subagent's system prompt (persona).

## Configuration

In your `cordis.patch.yml`:

```yaml
- id: subagent-registry
  name: dsh-subagent-registry
  config:
    toolName: dispatch          # default: "dispatch"
    subagentProvider: spawn      # default: "spawn"
    backgroundMode: one-shot     # default: "one-shot" (or "continuable")
    enableRunInBackground: true   # default: true
    maxDepth: 3                   # default: 3
    watch: true                   # default: true (hot-reload on file changes)
    scanProject: true             # default: true
    scanUser: true                # default: true
    scanDirs:                     # default: [".dsh/subagents", ".claude/agents", ".agents/subagents"]
      - .dsh/subagents
      - .claude/agents
      - .agents/subagents
    scanRoots: []                 # custom directories
    defaultProvider: null         # default: inherit parent
    defaultModel: null            # default: inherit parent
    modelMap:                     # Claude alias → DSH provider/model mapping
      sonnet: { provider: codeagent, model: deepseek-chat }
      haiku: { provider: codeagent, model: deepseek-flash }
      opus: { provider: codeagent, model: deepseek-reasoner }
```

## Model Resolution

Model is resolved through a 4-level chain:

1. **Per-call**: explicit `model` arg in the tool call
2. **Frontmatter**: `model` field in `.agent.md`
3. **Default**: `defaultProvider` + `defaultModel` in config
4. **Inherit**: parent agent's model

Aliases (`sonnet`, `haiku`, `opus`, `inherit`) are resolved through `modelMap`. The default map is empty — deployments must configure it via `config.modelMap`.

## Config Validation

Plugin config is validated at load time through a [schemastery](https://github.com/shigma/schemastery) schema defined in `src/config.ts`. The schema is exported as `Config` from the plugin entry — Cordis calls `Config(rawConfig)` before passing the validated config to `apply()`. All fields are optional with documented defaults, so an empty config block degrades gracefully.

## Development

### Prerequisites

- Node.js 22+
- npm (not pnpm — avoids internal package resolution issues with `@deepseek-ai/*` peer deps)

### Build

```bash
npm install          # install dev dependencies
node build.mjs       # bundle src/index.ts → lib/index.js + deploy to DSH profile
```

The build script also deploys the plugin to `~/.dsh/profiles/web/node_modules/dsh-subagent-registry/`, fixing the pnpm junction issue on Windows.

### Type Check

```bash
npx tsc --noEmit
```

### Tests

```bash
npm test
# or directly:
node --import tsx --test src/parser.test.ts src/scanner.test.ts
```

Tests use Node.js built-in test runner (`node:test`) with `node:assert/strict`. TypeScript execution via `tsx`.

- **Parser tests** (40+ cases): frontmatter extraction, required-field validation, YAML edge cases, optional-field normalization, Claude spec fields, all-fields integration.
- **Scanner tests** (13+ cases): basic discovery, recursive scanning, duplicate-name resolution, error collection, helper methods, scan directory configuration, scope assignment. Scanner tests use temporary directories so no real project/user paths are touched.

## Advanced Example

An agent using Claude spec fields (skills, mcpServers, hooks, memory, isolation):

```markdown
---
name: full-stack-reviewer
description: Full-stack code reviewer with MCP tools and persistent memory
tools:
  - Read
  - Glob
  - Grep
disallowedTools: Write, Bash
model: opus
maxTurns: 20
effort: high
color: purple
background: true
skills:
  - dsh-plugin-dev
  - bad-smell
mcpServers:
  - firecrawl
  - name: custom-search
    command: node
    args: ["search-server.js"]
hooks:
  PreToolUse:
    - matcher: Read
      hooks:
        - type: command
          command: "echo 'Reading file'"
memory: project
isolation: worktree
---

You are a full-stack code reviewer with access to web search and persistent project memory.

## Capabilities
- Search the web for latest best practices
- Review code changes across the entire stack
- Remember review decisions across sessions

## Process
1. Read and understand the code changes
2. Search for relevant documentation and best practices
3. Identify potential bugs, security issues, and performance problems
4. Check for adherence to project coding standards
5. Provide a summary of findings with severity levels
```

## License

MIT
