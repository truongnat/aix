# Plan

## Goal

Close CLI/Core gaps from `docs/internal/reports/CLI_CORE_GAP_REVIEW_2026-06-10.md`.

## Scope

Fix 🔴 correctness bugs first, then parser parity, then resolve scope/test-first guard disposition with tests and docs.

## In Scope

- [ ] C2 — `guard-scope.js` STATE path bug
- [ ] C1 — `guard-phase-policy.js` deduplication
- [ ] L1 — CLI value-flag `--` guard + tests
- [ ] C3/C4 — wire scope/test-first into provider hooks/router + behavioral tests (**Option A chosen**)
- [ ] C5 — fix `hasFailingAssertion()` regex before wiring test-first guard
- [ ] C6 — docs accuracy for enforcement scope
- [ ] L2/L3 — parser cleanup (dead fields, consistent missing-value policy, `--skip-demo-eval`)
- [ ] L4 — targeted test additions (flag edges; optional scan/domains smoke)

## Out Of Scope

- [ ] npm release
- [ ] Policy-engine rule design beyond minimal wiring for scope/test-first
- [ ] Unrelated CLI command refactors

## Current Understanding

- `guard-phase.js` already reads repo-root `.harness/STATE.md` via `buildExecutionContext()` (`hooks/core/guard-phase.js:110-111`).
- `guard-scope.js` incorrectly reads `sessionDir/STATE.md` (`hooks/core/guard-scope.js:38-39`).
- `guard-phase-policy.js` duplicates policy-engine logic already present in `guard-phase.js`.
- CLI parser lacks the `value.startsWith("--")` guard that `_util.js` applies (`hooks/core/_util.js:35`).
- Only `guard-phase.js` is referenced in provider settings; scope/test-first are existence-tested only.

## Success Criteria

- [ ] `guardScope()` runs without ENOENT when session has GOAL/PLAN and repo-root STATE exists.
- [ ] Single source of truth for phase guard policy logic (`guard-phase.js`).
- [ ] `parseArgv(["install", "--scope", "--yes"])` throws or rejects `--yes` as scope value (does not silently consume `--yes`).
- [ ] Behavioral tests cover fixed guard paths and CLI flag edges.
- [ ] `npm run build && npm test` pass.
- [ ] Docs state which guards run at tool time vs manual workflow invocation.

## Assumptions

- [ ] Wave 1 (C2, C1, L1) lands before Wave 2 wiring work.
- [ ] **C3 = Option A:** wire scope/test-first at tool time via provider hooks and/or `codex-hook-router.js`.
- [ ] Thin re-export of `guard-phase-policy.js` is acceptable short-term if external refs exist; prefer delete + test update if grep shows no importers beyond tests.

## Affected Areas

| Area | Files | Reason |
|------|-------|--------|
| Core guards | `hooks/core/guard-scope.js`, `guard-phase-policy.js`, `guard-test-first.js` | C1–C5 |
| Core docs | `hooks/README.md`, `docs/hooks-and-skills-layer.md`, `docs/internal/reports/POLICY_ENGINE_IMPLEMENTATION.md` | C6 |
| CLI parser | `lib/cli-args.ts` | L1–L3 |
| CLI tests | `test/cli-args.test.js` | L1, L3, L4 |
| Guard tests | `test/backend/guard-phase-policy.test.js`, new `test/backend/guard-scope.test.js` (or eval test expansion) | C1, C4 |
| Policy evals | `test/evals/policy-enforcement.test.js` | C1, C3 branch |
| Harness state | `.harness/HAZARDS.md` (optional promotion) | durable hazard for C2 class |

## Proposed Approach

### Wave 1 — Correctness (no product fork)

**Task 1 — C2: Fix `guard-scope` STATE path**

- In `extractReferencedFiles()`, mirror `guard-phase.js`:
  - Resolve `repoRoot` via `findHarnessRoot(sessionDir)` (already available in `guardScope()`).
  - Read `path.join(repoRoot, ".harness", "STATE.md")` with `existsSync` guard before `readText`.
  - Fall back to `"PLAN-001.md"` when `current_plan` absent.
- Add behavioral test with temp fixture (pattern from `test/backend/guard-phase-policy.test.js`):
  - Session with `GOAL.md` referencing `lib/foo.ts`; repo-root `STATE.md` with `current_plan: PLAN-001.md`; plan lists scoped files.
  - Assert `guardScope({ session, files })` returns `ok: true` for in-scope file and blocks out-of-scope file — not `{ status: "failed" }`.

**Task 2 — C1: Deduplicate `guard-phase-policy.js`**

- Confirm `guard-phase.js` already contains policy-engine path (lines ~181–208 per gap report).
- **Preferred:** Replace `guard-phase-policy.js` body with `module.exports = require("./guard-phase.js");` OR delete file if no runtime imports.
- Update `test/evals/policy-enforcement.test.js` — assert behavioral equivalence via `guard-phase.js` tests, not duplicate file existence.
- Close Task B3 Step 1 checkbox in consolidation plan doc (reference only).

**Task 3 — L1: CLI value-flag guard**

- Add helper in `lib/cli-args.ts`, e.g. `takeFlagValue(args, i, flagName)`:
  - If next token missing or starts with `--`, throw `Missing value for ${flagName}` (match `_util.js`).
- Apply to: `--provider`/`--runtime`, `--scope`, `--visibility`, `--target`, `--analysis-file`, `--live-provider-command`, `--domains`.
- Add tests in `test/cli-args.test.js`:
  - `install --scope --yes` throws (and `--yes` remains parseable on re-parse or same parse fails before consuming).
  - `install --provider --dry-run` throws.

### Wave 2 — C3 Option A: Wire scope/test-first at tool time (user approved)

**Task 4 — C5: Fix `hasFailingAssertion()` before wiring**

- Replace brittle property-access regexes with call-syntax patterns, e.g.:
  - `expect\([^)]+\)\.toBe\(\s*false\s*\)`
  - `expect\([^)]+\)\.not\.`
- Add unit tests in `test/backend/guard-test-first.test.js` with sample Jest/Vitest snippets.

**Task 5 — Wire guards into runtime**

- Extend `hooks/core/codex-hook-router.js` `handleToolEvent` (PreToolUse / PermissionRequest path):
  - Extract file paths from tool payload (match existing dangerous/prompt-worthy extraction).
  - Resolve active session from env or `.harness/STATE.md` (same pattern as other hooks).
  - Invoke `guardScope({ session, files })` — block on `ok: false`.
  - Invoke `guardTestFirst({ session, files })` for write/edit tools targeting source files.
- Add provider hook entries mirroring `guard-phase` pattern:
  - `runtime/claude/settings.project.fragment.json`
  - `hooks/providers/claude/settings.example.json`
  - Cursor/generic provider docs if applicable
- Consider policy-engine hooks in `.harness/policies.json` for scope/test-first rules (optional follow-up if router wiring suffices).

**Task 6 — C4: Behavioral + integration tests**

- `test/backend/guard-scope.test.js` — in-scope vs out-of-scope file paths.
- `test/backend/guard-test-first.test.js` — failing assertion detection.
- `test/hooks/codex-hook-router.test.js` (or extend existing) — assert PreToolUse blocks out-of-scope edit and surfaces JSON reason.
- Update `test/evals/policy-enforcement.test.js` — replace existence-only checks with behavioral smoke or document enabled default rules.

### Wave 3 — Cleanups

**Task 7 — L2/L3 parser consistency**

- Remove unused `providerAlias` / `runtimeAliasUsed` from `ParseOptions` OR wire into install/update messaging when `--runtime` alias used (pick one; removal is smaller diff).
- Standardize missing-value policy: throw for all value flags (align `--scope`/`--visibility`/`--target` with `--analysis-file`).
- **`--skip-demo-eval`:** implement in eval command path or remove flag acceptance from parser (grep usages first).

**Task 8 — L4 test depth**

- Extend `test/cli-args.test.js` for L3 cases.
- Optional: add 1–2 behavioral tests for `scan` / `domains` if timeboxed in same PR (lower priority than guard/flag fixes).

**Task 9 — C6 documentation**

- Add short section to `hooks/README.md` and `docs/hooks-and-skills-layer.md`:
  - Runtime (`codex-hook-router.js`): dangerous-command, prompt-worthy, scope, and test-first checks (after Wave 2).
  - Workflow guards (`guard-phase.js`): phase preconditions via harness commands / provider settings.
- Update `test/evals/policy-enforcement.test.js` to reflect enabled scope-guard behavior (remove "no default scope-guard" assertion if wiring makes it default).

## Tasks

See `TASKS.md` for checkbox tracking.

## Approval Checkpoints

| Checkpoint | Trigger | Approval needed from |
|------------|---------|----------------------|
| C3 disposition | Before Wave 2 implementation | User — **Option A approved 2026-06-10** |
| Plan execution | Before `harness-run` | User approves PLAN-001 |

## Verification Strategy

| Check | Command | Expected |
|-------|---------|----------|
| Build | `npm run build` | exit 0 |
| Full suite | `npm test` | exit 0 |
| Guard scope manual | `node hooks/core/guard-scope.js --files lib/cli-args.ts --session .harness/sessions/2026-06-10-cli-core-gap-closure --json` | JSON `ok` (not `failed` from ENOENT) |
| CLI flag edge | `node -e "require('./dist/lib/cli-args.js').parseArgv(['node','aih','install','--scope','--yes'])"` | throws |
| Policy tests | `node --test test/backend/guard-phase-policy.test.js` (+ new guard tests) | all pass |

## Risks

- Tool-time scope guard may block legitimate agent edits if GOAL/PLAN path extraction regex is too greedy — tune patterns and allow empty referenced-files fallback.
- Router wiring increases PreToolUse latency; keep guard calls synchronous but fast (no subprocess spawn if require() in-process).
- Deleting `guard-phase-policy.js` may break external docs/links — grep before delete.
- Throwing on `--scope --yes` is behavior change; may break scripts that relied on silent mis-parse (intended fix).

## Rollback Plan

- Revert guard/CLI commits independently by wave.
- Keep thin re-export for `guard-phase-policy.js` if deletion causes unexpected consumer breakage.

## Approval Status

status: approved
approved_by: user
approved_at: 2026-06-10
notes: Approved via `/harness-run`. Implementation complete; verification pending.

## Human Approval

Use **Approval Status** above as the canonical approval record.

## Blocking Questions

1. Approve PLAN-001 for `harness-run`? (C3 = Option A already recorded in DISCUSSION.md)
