# Anti-Detect Browser Automation with camoufox-cli

> 选型：日常浏览器自动化默认用 **playwright-cli**；本技能仅用于反检测场景
> （绕过 bot 检测/验证码）或 Firefox 引擎特定能力。借用电脑浏览器、CDP 协议一律走 playwright-cli。

## 铁律：起 session / 关 session

**干一个新的活，总是先起 session；干完，总是要关 session。**

- **开新活先起 session**：`camoufox-cli --tab <唯一名> open <url>`（共享身份/登录态）或 `camoufox-cli --session <唯一名> open <url>`（隔离身份）。
  tab/session 名规则：`<任务slug>-$(openssl rand -hex 2)`，只在任务开始时生成一次并全程复用，不要自己编随机后缀。
- **干完必关 session**：`camoufox-cli --tab <名字> close` 或 `camoufox-cli --session <名字> close`。禁止只开不关——每个 agent 只关自己的，浏览器在最后一个 tab 关闭时自动退出。
- **异常残留兜底**：`camoufox-cli close --all` 强制关所有；开工前发现有残留 daemon 先清理再干活。
- 不要直接裸用默认 session 干活（并发时互相踩）；除非任务是单次一次性操作（如查一个 title）。

## Core Workflow

Every browser automation follows this pattern:

1. **Navigate**: `camoufox-cli open <url>`
2. **Snapshot**: `camoufox-cli snapshot -i` (get element refs like `@e1`, `@e2`)
3. **Interact**: Use refs to click, fill, select
4. **Re-snapshot**: After navigation or DOM changes, get fresh refs
5. **Close**: `camoufox-cli close` when the entire task is complete — with the same `--tab`/`--session` flags as your other commands. Keep it open if the user may have follow-up instructions.

```bash
camoufox-cli open https://example.com/form
camoufox-cli snapshot -i
# Output: - textbox "Email" [ref=e1]
#         - textbox "Password" [ref=e2]
#         - button "Submit" [ref=e3]

camoufox-cli fill @e1 "user@example.com"
camoufox-cli fill @e2 "password123"
camoufox-cli click @e3
camoufox-cli snapshot -i  # Check result
```

## Command Chaining

Commands can be chained with `&&` in a single shell invocation. The browser persists between commands via a background daemon, so chaining is safe and more efficient than separate calls.

```bash
# Chain open + snapshot in one call
camoufox-cli open https://example.com && camoufox-cli snapshot -i

# Chain multiple interactions
camoufox-cli fill @e1 "user@example.com" && camoufox-cli fill @e2 "password123" && camoufox-cli click @e3

# Navigate and capture
camoufox-cli open https://example.com && camoufox-cli screenshot page.png
```

**When to chain:** Use `&&` when you don't need to read the output of an intermediate command before proceeding (e.g., open + screenshot). Run commands separately when you need to parse the output first (e.g., snapshot to discover refs, then interact using those refs).

## Essential Commands

```bash
# Navigation
camoufox-cli open <url>              # Navigate to URL (starts daemon if needed)
camoufox-cli back                    # Go back
camoufox-cli forward                 # Go forward
camoufox-cli reload                  # Reload page
camoufox-cli url                     # Print current URL
camoufox-cli title                   # Print page title
camoufox-cli close                   # Close your tab (browser exits when the last tab closes)
camoufox-cli close --all             # Force-close all sessions

# Snapshot
camoufox-cli snapshot                # Full aria tree of page
camoufox-cli snapshot -i             # Interactive elements only (recommended)
camoufox-cli snapshot -s "#selector" # Scope to CSS selector

# Interaction (use @refs from snapshot)
camoufox-cli click @e1               # Click element
camoufox-cli fill @e1 "text"         # Clear + type into input
camoufox-cli type @e1 "text"         # Type without clearing (append)
camoufox-cli select @e1 "option"     # Select dropdown option
camoufox-cli check @e1               # Toggle checkbox
camoufox-cli hover @e1               # Hover over element
camoufox-cli press Enter             # Press keyboard key
camoufox-cli press "Control+a"       # Key combination

# Data Extraction
camoufox-cli text @e1                # Get text content of element
camoufox-cli text body               # Get all page text (CSS selector)
camoufox-cli eval "document.title"   # Execute JavaScript

# Capture
camoufox-cli screenshot              # Screenshot as JSON {"base64": "..."}
camoufox-cli screenshot page.png     # Screenshot to file (path resolves against YOUR CWD)
camoufox-cli screenshot --full p.png # Full page screenshot
camoufox-cli pdf output.pdf          # Save page as PDF

# Scroll & Wait
camoufox-cli scroll down             # Scroll down 500px
camoufox-cli scroll up               # Scroll up 500px
camoufox-cli scroll down 1000        # Scroll down 1000px
camoufox-cli wait @e1                # Wait for element to appear
camoufox-cli wait 2000               # Wait milliseconds
camoufox-cli wait --url "*/dashboard" # Wait for URL pattern

# Viewport
camoufox-cli viewport                # Print this tab's viewport (default 1280x720)
camoufox-cli viewport 1280x800       # Resize this tab now

# Tabs
camoufox-cli tabs                    # List open tabs (with owner names)
camoufox-cli switch 2                # Switch to tab by index
camoufox-cli --tab <unique-name> open <url> # Named tab: shared browser + login, own page/refs

# Cookies & State
camoufox-cli cookies                 # Dump cookies as JSON
camoufox-cli cookies import file.json # Import cookies
camoufox-cli cookies export file.json # Export cookies

# Sessions
camoufox-cli sessions                # List active sessions
camoufox-cli --session work open <url> # Use named session
camoufox-cli close --all             # Force-close all sessions

# Setup
camoufox-cli install                 # Download Camoufox browser
camoufox-cli install --with-deps     # Download browser + system libs (Linux)
```

## Common Patterns

### Form Submission

```bash
camoufox-cli open https://example.com/signup
camoufox-cli snapshot -i
camoufox-cli fill @e1 "Jane Doe"
camoufox-cli fill @e2 "jane@example.com"
camoufox-cli select @e3 "California"
camoufox-cli check @e4
camoufox-cli click @e5
camoufox-cli snapshot -i  # Verify submission result
```

### Data Extraction

```bash
camoufox-cli open https://example.com/products
camoufox-cli snapshot -i
camoufox-cli text @e5                # Get specific element text
camoufox-cli eval "document.title"   # Get page title via JS
camoufox-cli screenshot results.png  # Visual capture
```

### Cookie Management (Persist Login)

```bash
# Login and export cookies
camoufox-cli open https://app.example.com/login
camoufox-cli snapshot -i
camoufox-cli fill @e1 "user"
camoufox-cli fill @e2 "pass"
camoufox-cli click @e3
camoufox-cli cookies export auth.json

# Restore in future session
camoufox-cli open https://app.example.com
camoufox-cli cookies import auth.json
camoufox-cli reload
```

For long-lived accounts where the site also verifies device stability (not just the cookie), combine this with `--persistent` so the fingerprint stays fixed alongside the cookies — see the Persistent Identity section below.

### Multiple Tabs

```bash
camoufox-cli open https://site-a.com
camoufox-cli eval "window.open('https://site-b.com')"
camoufox-cli tabs                    # List tabs
camoufox-cli switch 1                # Switch to second tab
camoufox-cli snapshot -i
```

### Parallel Tabs (shared identity, one browser)

Named tabs share one browser within a session — same fingerprint, same cookies/login state — but each tab keeps its own page, element refs, and navigation history, so concurrent agents never clobber each other. This is the cheap way to parallelize: one Firefox total, roughly 50-150MB per extra tab.

```bash
camoufox-cli --tab inbox-scan-x4q open https://app.example.com/inbox
camoufox-cli --tab report-pull-9kf open https://app.example.com/reports
camoufox-cli --tab inbox-scan-x4q snapshot -i   # refs are per tab
camoufox-cli tabs                               # Lists every tab with its owner name
camoufox-cli --tab inbox-scan-x4q close         # Frees only this tab; browser stays for the others
```

**Picking your tab name.** Nothing enforces uniqueness — two agents using the same name share one page pointer and will clobber each other. Generate your name ONCE at the start of your task: a short slug of *your specific task* plus a shell-generated random suffix — don't invent the suffix yourself, LLM-"random" characters are biased and concurrent agents may produce the same ones. Then reuse the printed name verbatim in every subsequent command. (If your instructions explicitly assign you a tab name, use that instead.)

```bash
TAB="price-scan-$(openssl rand -hex 2)" && echo "$TAB" && camoufox-cli --tab "$TAB" open https://example.com
# prints e.g. price-scan-9f3c — use that exact name in every later command:
camoufox-cli --tab price-scan-9f3c snapshot -i
```

Use tabs when subagents should act as the same identity (e.g. all operating the same logged-in account). Cleanup needs no coordination: every agent runs `close` when done, addressed to its own tab (`camoufox-cli --tab <name> close`) — it releases only that tab, and the browser exits by itself when the last tab closes.

Tabs share one browser process, so commands from different tabs may queue behind a slow navigation or `wait`; separate sessions run as independent processes and execute fully in parallel. If a few agents are extremely command-heavy, consider giving those their own session and keeping the rest on tabs.

### Parallel Sessions (isolated identities)

Each named session is a separate browser process, so each gets its own randomly-generated fingerprint and its own cookies. Use this when agents must NOT share identity (multi-account work) — it costs a full Firefox (~300-500MB) per session:

```bash
camoufox-cli --session s1 open https://site-a.com
camoufox-cli --session s2 open https://site-b.com
camoufox-cli sessions                # List both
camoufox-cli --session s1 snapshot -i
camoufox-cli --session s2 snapshot -i
```

Separate sessions alone only isolate the browser side. For multi-account work that must survive scrutiny, also give each session its own proxy (sites correlate accounts by IP — use the config file's `sessions.<name>.proxy`) and `--persistent` (otherwise the fingerprint is re-randomized every launch, which looks like a new device on each login).

### Visual Browser (Debugging)

```bash
camoufox-cli --headed open https://example.com
camoufox-cli snapshot -i
camoufox-cli screenshot debug.png
```

### Viewport Control

The viewport defaults to 1280x720 (Playwright's default). Two ways to change it:

```bash
# Per-tab, any time — resizes the addressed tab's page live:
camoufox-cli --session qa viewport 390x844   # mobile-width screenshots
camoufox-cli viewport                        # query current size

# Session-wide default — every new page starts at this size (applies at daemon launch):
camoufox-cli --viewport 1280x800 --session dev open https://example.com
```

The `viewport` command touches only the addressed tab (route it with `--tab`/`--session` like any command); `--viewport` applies to all pages in the session and can also be set per-session in the config file (`"viewport": "1280x800"` or `{"width": 1280, "height": 800}`). File paths given to `screenshot` / `pdf` / `cookies import|export` resolve against the invoking client's CWD with `~` expansion.

## Session Management and Cleanup

When running multiple agents or automations concurrently, give each agent its own name so they don't conflict. Two isolation levels:

- **`--tab <name>`** (shared identity, recommended default): all agents share one browser — same fingerprint and login state — but each gets an independent tab. Cheap: one Firefox total.
- **`--session <name>`** (isolated identity): each agent gets its own browser with its own fingerprint and cookies. Expensive: a full Firefox per session. Use only when identities must be separate.

```bash
# Shared identity: 3 agents, one browser, one login
camoufox-cli --tab orders-audit-p2m open https://app.example.com/a
camoufox-cli --tab user-export-j8w open https://app.example.com/b
camoufox-cli --tab billing-check-r4t open https://app.example.com/c

# Isolated identities: 2 agents, two browsers
camoufox-cli --session shop-a-buyer open https://site-a.com
camoufox-cli --session shop-b-buyer open https://site-b.com
camoufox-cli sessions                  # Check active sessions
```

Names are just strings and nothing enforces uniqueness — follow the "Picking your tab name" rule above (task slug + shell-generated random suffix, chosen once). The same applies to session names.

Always run `close` when done to avoid leaked processes — with the same `--tab`/`--session` flags as your other commands, since `close` releases the tab the command is addressed to. The browser exits when the last tab closes, so every agent cleans up the same way without knowing about the others:

```bash
camoufox-cli --tab orders-audit-p2m close       # Free this tab; browser exits if it was the last
camoufox-cli close                              # Same, for the default tab
camoufox-cli --session shop-a-buyer close       # Same, within a named session
camoufox-cli close --all                        # Force-close all sessions (cleanup escape hatch)
```

If a previous session was not closed properly, the daemon may still be running. Use `camoufox-cli close` (or `close --all`) to clean it up before starting new work.

## Timeouts and Slow Pages

Some pages take time to fully load, especially those with dynamic content or heavy JavaScript. Use explicit waits before taking a snapshot:

```bash
# Wait for a specific element to appear
camoufox-cli wait @e1
camoufox-cli snapshot -i

# Wait for a URL pattern (useful after redirects)
camoufox-cli wait --url "*/dashboard"
camoufox-cli snapshot -i

# Wait a fixed duration as a last resort
camoufox-cli wait 3000
camoufox-cli snapshot -i
```

When dealing with slow pages, always wait before snapshotting. If you snapshot too early, elements may be missing from the output.

## Ref Lifecycle (Important)

Refs (`@e1`, `@e2`, etc.) are **temporary identifiers** assigned by sequential numbering during each snapshot. They are invalidated when the page changes.

**Always re-snapshot after:**

- Clicking links or buttons that navigate
- Form submissions
- Dynamic content loading (dropdowns, modals, lazy-loaded content)
- Scrolling that triggers new content

```bash
# CORRECT: re-snapshot after navigation
camoufox-cli click @e5              # Navigates to new page
camoufox-cli snapshot -i            # MUST re-snapshot
camoufox-cli click @e1              # Use new refs

# CORRECT: re-snapshot after dynamic changes
camoufox-cli click @e1              # Opens dropdown
camoufox-cli snapshot -i            # See dropdown items
camoufox-cli click @e7              # Select item

# WRONG: using refs without snapshot
camoufox-cli open https://example.com
camoufox-cli click @e1              # Ref doesn't exist yet!

# WRONG: using old refs after navigation
camoufox-cli click @e5              # Navigates away
camoufox-cli click @e3              # STALE REF - wrong element!
```

Always take a fresh snapshot before interacting with elements after navigation or page changes.

## Troubleshooting

### "Ref @eN not found"

The ref was invalidated. Re-snapshot to get fresh refs:

```bash
camoufox-cli snapshot -i
```

### Element Not Visible in Snapshot

```bash
# Scroll down to reveal element
camoufox-cli scroll down 1000
camoufox-cli snapshot -i

# Or wait for dynamic content
camoufox-cli wait 2000
camoufox-cli snapshot -i
```

### Too Many Elements in Snapshot

```bash
# Scope to a specific container
camoufox-cli snapshot -s "#main-content"
camoufox-cli snapshot -i -s "form.login"
```

### Page Not Fully Loaded

```bash
# Wait for URL pattern after redirect
camoufox-cli wait --url "*/dashboard"
camoufox-cli snapshot -i

# Wait a fixed duration as last resort
camoufox-cli wait 3000
camoufox-cli snapshot -i
```

### Daemon 挂死 / 命令无响应

camoufox-cli 的 daemon 是**单线程**的——一次只处理一个命令。如果某个命令（尤其是 `eval` 里跑了一个不返回的 Promise 或长轮询 `fetch`）阻塞了，后续所有命令都会排在后面等待，表现为命令无响应。

**判断**：`camoufox-cli --session <name> url` 如果 5s 内不返回，daemon 大概率卡住了。

**修复**：
```bash
# 方式 1（推荐）：close --all 会自动 force-kill 卡住的 daemon 并清理文件
camoufox-cli close --all

# 方式 2：手动清理 stale 文件（更快，跳过重试）
rm -f /tmp/camoufox-cli-*.{lock,pid,sock}
```

**预防**：
- `eval` 里**不要**执行长轮询 `fetch`、`await new Promise(...)` 等可能不返回的操作。`eval` 会等 JS Promise resolve，如果永远不 resolve，daemon 就永远卡住。
- 用 `--timeout <seconds>` 或 `~/.camoufox-cli/config.json` 设 `"timeout": 3600` 防止 daemon 空闲超时退出。
- 长时间不用 session 时，及时 `close`。

### Stale daemon 文件（正常现象）

daemon 被 SIGKILL（OOM、手动 `kill -9`、容器重启）时来不及清理 `/tmp/camoufox-cli-*.{lock,pid,sock}` 文件。这是**正常现象**，不是 bug：

- OS 会在进程死亡时自动释放 `flock`（内核保证），所以新 daemon 总能获取锁
- 客户端 `ensure_daemon()` 对 stale socket 的处理：3 次重试 × 2s 超时 → 连接被拒 → 自动删 socket → 起新 daemon（总卡顿 ≤ 6s）
- 手动清理可跳过 6s 等待：`rm -f /tmp/camoufox-cli-*.{lock,pid,sock}`

### Headless daemon 残留导致 headed 失效

如果之前用不带 `--headed` 的命令启动过 daemon（默认 headless），后续 `--headed open` **不会**新开 headed 实例——`open` 只会复用已有 daemon 导航当前 tab。表现为：明明加了 `--headed` 但浏览器窗口不出现，或 Google 登录页报 "not be secure"。

**修复**：先 `close --all` 关掉残留 daemon，再重新带 `--headed` 启动。

### Google 登录不能自动化（重要）

Google Accounts 登录页（`accounts.google.com`）有极强的 bot 检测，**会拒绝所有自动化输入**：

| 方式 | 结果 |
|------|------|
| `eval` JS 设 `input.value` | ❌ "This browser or app may not be secure" |
| `fill @ref "text"`（Playwright 原生输入） | ❌ 同上 |
| `type @ref "text"`（逐字符输入） | ❌ 同上 |
| **headless 模式 + 手动打字** | ❌ 同上（headless 被检测） |
| **headed 模式 + 手动打字** | ✅ 正常通过 |

Camoufox 虽然伪装了 `navigator.webdriver=false` 和 `window.outerHeight`，但 Google 仍能通过渲染上下文、WebGL/Canvas 指纹等方式检测 headless。

**结论**：任何需要 Google 登录的场景，必须：
1. 用 `--headed` 启动浏览器
2. 提示用户前往 noVNC 桌面（`https://vnc.<your-domain>/vnc.html`，密码 `<vnc-password>`）手动输入凭据
3. 不要尝试用 camoufox-cli 自动填写 Google 登录表单



```
--session <name>       Named session (default: "default")
--tab <name>           Named tab within the session's shared browser: same
                       fingerprint and cookies/login, independent page/refs/
                       history (default: "default")
--headed               Show browser window (default: headless)
--timeout <seconds>    Daemon idle timeout (default: 1800)
--json                 Output as JSON instead of human-readable
--persistent [path]    Persistent identity — reuse the same fingerprint + cookies across launches
                       (default path: ~/.camoufox-cli/profiles/<session>)
--proxy <url>          Proxy server (http:// or https://; auth: http://user:pass@host:port)
--no-geoip             Disable automatic GeoIP spoofing (auto-enabled with --proxy)
--locale <tag>         Force browser locale (e.g. "en-US" or "en-US,zh-CN")
--viewport <WxH>       Default viewport for every page in the session (e.g. 1280x800);
                       takes effect when the daemon launches
--version              Print version and exit
```

**Config file (optional).** To avoid repeating flags, set defaults in `~/.camoufox-cli/config.json` (override path with `$CAMOUFOX_CLI_CONFIG`): a `default` block applies to all sessions, and an optional `sessions.<name>` block layers extra overrides on top whenever you run `--session <name>` (the name is just whatever you pass to `--session` — sessions are never pre-registered). Settable keys: `proxy`, `locale`, `geoip`, `persistent` (`true`/`false`/path), `headed`, `timeout`, `json`, `viewport` (`"1280x800"` or `{"width": 1280, "height": 800}`). Command-line flags always win over the file. Config is read only when a session's daemon first launches.

```json
{
  "default": { "persistent": true, "timeout": 3600 },
  "sessions": { "<your-session-name>": { "proxy": "socks5://127.0.0.1:1080", "locale": "zh-CN" } }
}
```

## Persistent Identity

By default, every launch gets a fresh random fingerprint. Add `--persistent [path]` to reuse the same fingerprint + cookies across launches — fingerprint/OS/canvas+font seeds are frozen on first launch (delete the directory to reset); `--locale` and proxy-derived timezone/geolocation are stored but refreshed whenever you pass the flag; `--proxy` / `--no-geoip` are never stored, so pass them every launch.

**Use it when** the same device should see the same fingerprint across visits (account-bound tasks, parallel independent identities, or when `cookies import/export` alone isn't enough because the site also checks device stability). **Skip it** for one-off scraping or quick debugging.

```bash
# Parallel identities, each with its own fingerprint + cookies
camoufox-cli --session a --persistent ~/.camoufox-cli/profiles/alice open https://app.example.com
camoufox-cli --session b --persistent ~/.camoufox-cli/profiles/bob   open https://app.example.com

# Reset an identity: just remove the directory
rm -rf ~/.camoufox-cli/profiles/alice
```

## 相关方案

playwright-cli 是本机浏览器自动化首选（Chromium/Chrome、CDP、Playwright 测试、借用电脑浏览器）。
camoufox-cli 仅用于反检测场景。以下存档在 `references/`：

- **playwright-cli**（首选，主 skill 见 `~/.agents/skills/playwright-cli/`）→ 旧版存档 `references/playwright-cli/SKILL.md`（子参考 `references/playwright-cli/references/`）
- **patchright-browser**（Chromium 反检测，CTP）→ `references/patchright-browser/SKILL.md`
- **web-browsing / camoufox MCP**（camoufox-js MCP，noVNC 用户协作）→ `references/web-browsing/SKILL.md`

## Documentation

- [camoufox-cli documentation](https://github.com/Bin-Huang/camoufox-cli) -- Full README, setup guide, installation, and command reference

## 本机 Fork 说明（重要）

本机运行的 camoufox-cli **不是上游 PyPI 包**，而是本地 fork（0.7.5，基于上游 0.7.4）：

- **位置**：`~/projects/camoufox-cli`，分支 `fork`（`master` 跟踪上游，`origin` = Bin-Huang/camoufox-cli，MIT）
- **新增能力**：`--viewport <WxH>` flag / `viewport [WxH]` 命令 / config `viewport` 键；`screenshot`/`pdf`/`cookies import|export` 的文件路径按**调用方 CWD** 解析（含 `~` 展开），不再受 daemon 落地目录影响
- **安装方式**：`uv tool install --force --editable ~/projects/camoufox-cli`（editable——fork 工作树内的修改即时生效，无需重装）
- **补丁范围**：仅 Python 实现（本机实际使用的）；`js/` 实现未同步
- **改 fork 代码后**：跑 `cd ~/projects/camoufox-cli && uv run pytest -q -m "not integration"` 验证；改动直接生效（editable）。上游同步：`git fetch origin` 后在 `master` rebase，再 rebase `fork`
