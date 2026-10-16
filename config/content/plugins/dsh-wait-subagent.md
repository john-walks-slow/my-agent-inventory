# dsh-wait-subagent

<p align="center">
  <a href="https://github.com/john-walks-slow/dsh-wait-subagent/blob/HEAD/README.md"><strong>English</strong></a> ·
  <a href="https://github.com/john-walks-slow/dsh-wait-subagent/blob/HEAD/README.zh-CN.md"><strong>简体中文</strong></a>
</p>

A DeepSeek Harness (cordis) plugin that registers a `wait_subagent` tool: **block until a background continuable subagent settles, then get its stop reason and closing message** in the same call.

It fills a real gap in the subagent workflow: `run_in_background` returns a `subagentId` immediately, but the only way to learn the outcome is an async settlement notice — there was no tool to actively wait for it.

## Real output

Start a subagent in the background, then wait for it:

```
wait_subagent({ subagent_id: "session-<tunnel-id>" })
```

The call blocks while the subagent runs. When it settles, the tool returns:

```json
{
  "status": "settled",
  "subagent_id": "session-<tunnel-id>",
  "stop_reason": "completed",
  "closing_message": "Spec written to docs/plan.md; 3 files changed, ready for review."
}
```

The text the model sees:

```
Subagent session-<tunnel-id> settled: completed
Spec written to docs/plan.md; 3 files changed, ready for review.
```

Other outcomes:

| Situation | Result |
|---|---|
| Subagent already settled before the call | `{ "status": "settled", "subagent_id": "…", "stop_reason": "unknown" }` — *"had already settled before this call; its closing message was delivered separately as a settlement notice."* |
| `timeout_ms` elapsed | `{ "status": "timeout", "subagent_id": "…" }` — *"Timed out waiting for subagent …; it may still be running."* |
| Caller's `AbortSignal` fired | `{ "status": "cancelled", "subagent_id": "…" }` |
| Unknown / foreign subagent id | Rejected with an error: *"… is not one of your subagents — pass the id a background dispatch returned (see list_agents)"* |

## Why

What the subagent system gives you today:

- `subagent` with `run_in_background: true` → returns a `subagentId` at once; work continues asynchronously and a settlement notice arrives later.
- `subagent` with `run_in_background: false` → blocks at **start** time only.
- `send_message` → fire-and-return, never waits for the answer.
- `list_agents` → a snapshot, not a wait (and explicitly "not to poll").

What's missing: after starting a subagent in the background, there is no tool to **block and wait** for it to finish. That is exactly what `wait_subagent` does — use it when your next action depends on the subagent's result, instead of guessing or polling.

## How it works

- Registers the `wait_subagent` tool on every root agent (same pattern as `dsh-proactive`).
- **Membership gate**: `ctx.subagents.listChildren(parent.id)` — the same projection `list_agents` reads — covers live AND storage-only children, so unknown ids are rejected with an error instead of being misreported as settled. A known child absent from the live registry has already settled.
- The tool listens for the `subagent/end` lifecycle event — which fires when a child's activation is disposed — scoped through the plugin context (an ancestor of all agent contexts).
- Settlement removes the child from the live registry and dispatches `subagent/end` in the same synchronous block (`finishDisposal`), so attaching the listener first and then re-checking the registry is race-free.
- Optional `timeout_ms` parameter returns `status: "timeout"` if the subagent does not settle in time. Omit to wait indefinitely — usually the best choice; if set, use a generous value rather than polling with repeated short waits.
- Respects the caller's `AbortSignal` (returns `status: "cancelled"`).

## Tool schema

```
wait_subagent(subagent_id: string, timeout_ms?: integer)
→ { status: "settled" | "timeout" | "cancelled",
    subagent_id: string,
    stop_reason?: "completed" | "aborted" | "error" | "max-tokens" | "refusal" | "unknown",
    closing_message?: string }
```

## Caveat: don't wait and interrupt in the same step

`wait_subagent` is concurrency-safe, but `interrupt_agent` is not — it needs the tool
lane exclusively and queues behind any in-flight call. Issuing `wait_subagent` and
`interrupt_agent` in one parallel step serializes them: the wait runs to its timeout
first, and only then does the interrupt land. Call `interrupt_agent` first, then
`wait_subagent` in the next step (an already-interrupted child settles quickly).

## Install

```bash
dsh plugin --profile web add dsh-wait-subagent
```

Or straight from GitHub (source install — plain ESM JavaScript, no build step, so pnpm ≥ 10 build-script approval is not needed):

```bash
dsh plugin --profile web add github:john-walks-slow/dsh-wait-subagent
```

Restart your DSH instance after installing; the bundled `cordis.patch.yml` registers the loader entry automatically.

## Permissions & compatibility

- **What it touches**: registers exactly one model-facing Agent tool (`wait_subagent`) on every root agent. No web client, no UI changes, no configuration.
- **Blocking semantics**: while waiting, the call holds the calling agent's tool lane until the subagent settles, the optional timeout elapses, or the caller aborts — that is the feature. The wait itself is event-driven (`subagent/end` lifecycle event), not polling; CPU cost while blocked is negligible. An omit-`timeout_ms` wait is unbounded by design; set a generous `timeout_ms` when you need a bound.
- **No side effects**: no network requests, no external services, no filesystem writes.
- **Dependencies**: `@deepseek-ai/dsh-tools` 0.1.2-rc.1 (aligned with the dsh 0.1.2-rc.1 locked version), Node ≥ 22.5.

## Local development

```bash
npm install
```

That's it — `lib/` is plain ESM JavaScript; there is no build step and no test suite.

## Release a new version

```bash
npm run release        # bumps the patch version and packs /tmp/dsh-wait-subagent-<newver>.tgz
```

Then publish the tarball to npm and push the version commit and tag:

```bash
git push --follow-tags
```

Verify with `npm view dsh-wait-subagent version`.

## License

MIT

## Community

- Thanks to the [LINUX DO](https://linux.do/) community for providing the discussion environment.
