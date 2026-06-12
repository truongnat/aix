# Gap Report — CLI phase & Core phase

**Date:** 2026-06-10
**Reviewer:** Claude (Opus 4.8)
**Scope reviewed:** `lib/cli-*.ts`, `lib/cli-commands/*`, `bin/*` (CLI) and `hooks/core/*` + `rules/core/*` (Core), plus their tests.
**Gap lenses:** correctness/bugs · missing functionality · test coverage · consistency/docs.

Severity: 🔴 high · 🟠 medium · 🟡 low.

---

## CORE phase

### 🔴 C1 — `guard-phase.js` and `guard-phase-policy.js` are duplicate files

`diff` (ignoring comments/help text) shows the two files are **functionally identical** — same `guardPhase()`, same policy-engine path, same legacy fallback. `guard-phase.js:181-208` already contains the policy-engine logic, so `guard-phase-policy.js` is pure dead duplication.

- This is a **known, unexecuted task**: `docs/superpowers/plans/2026-06-07-shell-to-typescript-consolidation.md:589` Step 1 says "merge the policy-engine path … keep `guard-phase-policy.js` as a thin re-export or delete," still unchecked `[ ]`.
- Hazard: any edit to enforcement logic must be made in two places or they silently diverge. 295 lines duplicated.
- The only thing keeping `guard-phase-policy.js` alive is an **existence test** (`test/evals/policy-enforcement.test.js:284-296`) — not a behavioral one.

**Fix:** delete `guard-phase-policy.js` (or make it `module.exports = require('./guard-phase.js')`), update the existence test.

### 🔴 C2 — `guard-scope.js` reads a non-existent `STATE.md` and hard-fails

`hooks/core/guard-scope.js:39`:

```js
extractField(readText(path.join(sessionDir, "STATE.md")), "current_plan")
```

`STATE.md` lives at `<repoRoot>/.harness/STATE.md` (that's where `guard-phase.js:111` reads it), **not** inside the session dir (`.harness/sessions/<id>/`, which only holds `SESSION_START.md`, `GOAL.md`, `PLAN.md`, …). `readText` throws `ENOENT`, `guardScope()` throws, `main()` catches it and returns `{ok:false, status:"failed"}` → **exit 1 (blocked)**. So whenever scope-guarding is actually attempted, it errors out instead of guarding. It also doesn't guard the `existsSync` like the `GOAL.md` branch above it does.

### 🟠 C3 — `guard-scope.js` and `guard-test-first.js` are orphaned (never wired)

Repo-wide, the only references to these two hooks are themselves, the existence test, and one doc:

- Not in `hooks.json` (every event routes only to `codex-hook-router.js`).
- Not dispatched by `codex-hook-router.js` (`handleToolEvent` at `:191-229` only runs `isDangerous`/`isPromptWorthy`).
- Not referenced by any `providers/*.json`.

The docs even concede it: the policy doc must state *"No default scope-guard rule is enabled."* (`test/evals/policy-enforcement.test.js:276`). So two of the three "enforcement core" guards are **dead code** at runtime — a missing-functionality gap between the enforcement narrative and what actually runs.

### 🟠 C4 — No behavioral tests for `guardScope()` / `guardTestFirst()`

The only coverage is "file exists" + "starts with `#!/usr/bin/env node`" (`test/evals/policy-enforcement.test.js:282-307`). Zero tests exercise the actual logic — which is how C2 (the `STATE.md` throw) and C5 below went unnoticed. `guard-phase.js` by contrast has real tests (`test/backend/guard-phase-policy.test.js`, `test/run-tests.js:693`).

### 🟡 C5 — `guard-test-first.js` assertion heuristic is fragile / can't match real syntax

`hasFailingAssertion()` (`:45-56`) uses `/expect\.\w+\.toBe\(false\)/` and `/expect\.\w+\.not\./`. Real Jest/Vitest is `expect(x).toBe(false)` — call syntax, not `expect.x.toBe`. These patterns will essentially never match real test code, producing false "no failing assertion" violations. Combined with C3 it's latent, but the heuristic is incorrect as written.

### 🟡 C6 — Runtime enforcement narrower than documented

`codex-hook-router.js` `PreToolUse`/`PermissionRequest` enforcement is just two regex checks (`isDangerous`, `isPromptWorthy`). Phase/scope/test-first guards are never invoked at tool time — they only run when a `harness-*` command workflow calls them manually. Worth a docs note so "guard" coverage isn't overstated.

---

## CLI phase

### 🟠 L1 — Value-flags swallow the next flag as their value

In `lib/cli-args.ts`, `--scope` (`:130`), `--visibility` (`:134`), `--target` (`:138`), `--provider/--runtime` (`:113`), `--analysis-file` (`:206`), `--live-provider-command` (`:213`) all take `args[++i]` **without checking whether the next token is another flag**. So `aih install --scope --yes` sets `scope = "--yes"` and silently consumes `--yes`. Compare `hooks/core/_util.js:35`, which correctly rejects `value.startsWith("--")`. The CLI parser should apply the same guard for consistency and to avoid silently-wrong installs.

### 🟡 L2 — Dead parsed options `providerAlias` / `runtimeAliasUsed`

Both are set in `cli-args.ts:123-125` but read **nowhere** in `lib/` or `bin/`. Either wire them into the messaging that distinguishes `--provider` vs the `--runtime` alias, or drop them from `ParseOptions`.

### 🟡 L3 — Inconsistent missing-value handling

`--analysis-file` / `--live-provider-command` throw on empty, but `--scope` / `--visibility` / `--target` silently fall back to `""`/`"."`. Pick one policy. `--skip-demo-eval` (`:220`) is also accepted as a silent no-op — either implement or remove.

### 🟡 L4 — Thin command-level test coverage

Wizards are reasonably covered (`runInstallWizard`×24, `runUpdateWizard`×9, etc.), but `runScanCommand` has no behavioral references beyond `test/cli-commands/scan.test.ts` (2 tests), and `domains`/`diagnostics` are lightly touched (≈5–6 refs). No tests assert the L1 flag-parsing edge cases.

---

## Priority summary

| #  | Area | Gap                                                          | Severity | Type                  |
| -- | ---- | ----------------------------------------------------------- | -------- | --------------------- |
| C1 | Core | `guard-phase` / `guard-phase-policy` duplicate files        | 🔴       | consistency/maint     |
| C2 | Core | `guard-scope` reads wrong `STATE.md` path → always errors    | 🔴       | correctness           |
| C3 | Core | scope + test-first guards unwired (dead at runtime)         | 🟠       | missing functionality |
| C4 | Core | no behavioral tests for the two guards                      | 🟠       | test coverage         |
| C5 | Core | `hasFailingAssertion` regex can't match real syntax         | 🟡       | correctness           |
| C6 | Core | runtime enforcement narrower than docs imply                | 🟡       | consistency/docs      |
| L1 | CLI  | value-flags swallow following flag as value                 | 🟠       | correctness           |
| L2 | CLI  | dead `providerAlias`/`runtimeAliasUsed` options             | 🟡       | consistency           |
| L3 | CLI  | inconsistent missing-value handling; no-op `--skip-demo-eval` | 🟡     | consistency           |
| L4 | CLI  | thin tests for scan/domains/diagnostics + no flag-edge tests | 🟡      | test coverage         |

**Suggested order:** C2 (real bug) → C1 (dedupe, already planned) → L1 (parser guard + tests) → C3/C4 (decide: wire the guards *or* delete them, then test whichever survives) → cleanups C5/L2/L3.

**Theme:** the "enforcement core" has **three guards built but only one (`guard-phase`) actually wired and tested** — the other two are duplicated/orphaned/buggy. The cleanest win is deciding whether scope/test-first are real features (wire + test + fix C2) or scaffolding to remove.

---

## Round 2 — review of the in-progress `2026-06-10-cli-core-gap-closure` work

A session is mid-flight closing the gaps above (working tree dirty; `STATE.md` at `phase: ship`). All 472 tests pass. Verification of the fixes:

| Original | Status | Notes |
| -------- | ------ | ----- |
| C1 dedupe | ✅ correct | `guard-phase-policy.js` → `module.exports = require("./guard-phase.js")` + spawn delegation |
| C2 `STATE.md` path | ✅ correct | `guard-scope.js` now reads repo-root `STATE.md` with `existsSync` guard; also resolves file paths to absolute first |
| C5 assertion regex | ✅ correct | patterns rewritten to real `expect(...)` call syntax |
| C3 wiring | ⚠️ wired but over-broad | scope + test-first now run at tool time via `file-edit-guards.js` |
| L1/L2/L3 cli-args | ✅ correct | `takeFlagValue` rejects `--`-prefixed values; dead options + `--skip-demo-eval` removed |
| C4 tests | ✅ added | `test/backend/guard-scope.test.js`, `guard-test-first.test.js` |

### New gaps introduced / still open

#### 🔴 N1 — `run-with-active-session.js` silently disables four Claude hooks (pre-existing, NOT fixed)
`run-with-active-session.js:12` matches the active session with `/##\s+Active Session\s*\n+`([^`]+)`/` — a **backtick-wrapped** value. But every `STATE.md` (and `templates/STATE.md`) uses `session: sessions/<id>` with **no backticks**, so `readActiveSession()` returns `null` and the wrapper "skips silently" (`:27-30`, exit 0). In `hooks/providers/claude/settings.example.json` this wrapper is the entry point for **four hooks**, all now no-ops:
- PreToolUse/Bash → `guard-phase` (plan-approval enforcement) — **disabled**
- PostToolUse/Bash → `record-tool-output` — **disabled**
- SubagentStop → `record-subagent-result` — **disabled**
- Stop → `compact-session-memory` — **disabled**

The new `file-edit-guards.js` resolves the session correctly via `extractField(state, "session")` — so the repo now has **two divergent session resolvers, one broken**. Fix: replace the regex in `run-with-active-session.js` with the `extractField` approach (and add a test — the wrapper's session resolution is currently untested, which is why this slipped).

#### 🔴 N2 — Tool-time guards fire on read-only tools in the Codex path
`codex-hook-router.js` `handleToolEvent` now calls `evaluateFileEditHook` for **every** tool (hooks.json matcher `.*`, no tool-name filter). `extractFilePaths` pulls `path`/`file_path`, which **Read, Grep, and Glob also set**. So with an active session whose GOAL lists some files, a plain `Read`/`Grep` of any other source file is **denied**. The Claude settings correctly scope the guard to `"matcher": "Write|Edit"`; the Codex router has no equivalent gate. The new test (`test/hooks/codex-hook-router.test.js`) uses `tool_input: { path: ... }` and asserts deny — confirming the mechanism but not distinguishing read vs write. Fix: gate `evaluateFileEditHook` on edit-class tool names (`Write|Edit|MultiEdit`/`apply_patch`) before denying.

#### 🟠 N3 — `guardTestFirst` as a hard DENY over-blocks normal editing
Now default-on (`docs/scope-guard.md` updated to say enforcement runs at tool time). But `hasFailingAssertion` only **greps for negative-assertion patterns** (`.not.`, `toThrow(`, `assert.fail`…) — it cannot run the test, so it does not actually verify the test fails. Consequence: editing an existing source file whose test file contains only positive assertions is **blocked** ("no failing assertion"), making routine bug-fixes/refactors impossible. Recommend downgrading test-first to a **warn** action, or restricting it to newly-created files, rather than a hard deny.

#### 🟡 N4 — `--skip-demo-eval` removal is an undocumented breaking change
The flag was a silent no-op; it's now an `Unknown argument` error, but it's still documented in `docs/v1.2.0-release-notes.md`. Either keep accepting it as a deprecated no-op or add a removal note to the release notes/changeset.

#### 🟡 N5 — `extractFilePaths` misses some path keys
Covers `path`/`file_path`/`filePath`/`target_path`/`file`/`paths[]`, but not `notebook_path` (NotebookEdit). Low impact; note for completeness.

### Round-2 priority
N1 (four dead Claude hooks) and N2 (reads denied in Codex) are the two that change real runtime behavior — fix before this ships. N3 is a design call (warn vs deny). N4/N5 are cleanups.
