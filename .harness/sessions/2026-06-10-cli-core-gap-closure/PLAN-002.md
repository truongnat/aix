# Plan

## Goal

Close Round 2 gaps (N1–N5) from `docs/internal/reports/CLI_CORE_GAP_REVIEW_2026-06-10.md` — regressions and over-broad enforcement introduced or exposed by PLAN-001.

## Scope

Fix pre-existing broken Claude hook session resolution (N1) and Codex read-tool false denials (N2) before any re-ship. Resolve test-first over-blocking (N3) per user choice. Clean up docs/edge paths (N4, N5).

## Prerequisites

- PLAN-001 shipped (VERIFY passed); working tree contains Round 1 implementation (uncommitted).

## In Scope

- [ ] N1 — `run-with-active-session.js` session resolution via `extractField`
- [ ] N2 — Codex router: file guards only on write/edit-class tools
- [ ] N3 — test-first severity (branch on user choice)
- [ ] N4 — `--skip-demo-eval` deprecation note or no-op restore
- [ ] N5 — optional `notebook_path` in `extractFilePaths`

## Out Of Scope

- npm release
- Policy-engine rule redesign
- Re-litigating C3 Option A (scope guard wiring stays)

## Success Criteria

- [ ] Claude `run-with-active-session.js` hooks resolve `session: sessions/<id>` and invoke target script (tested)
- [ ] Codex PreToolUse on Read/Grep with out-of-scope path → allow (not deny)
- [ ] Codex PreToolUse on Write/Edit out-of-scope → still deny
- [ ] N3 behavior matches approved option
- [ ] `npm test` passes

## Affected Areas

| Area | Files |
|------|-------|
| Session wrapper | `hooks/core/run-with-active-session.js`, new `test/hooks/run-with-active-session.test.js` |
| Codex router | `hooks/core/codex-hook-router.js`, `hooks/core/file-edit-guards.js` |
| Test-first | `hooks/core/guard-test-first.js`, `file-edit-guards.js`, docs |
| Docs | `docs/v1.2.0-release-notes.md` or `cli-help` (N4) |

## Proposed Approach

### Wave 1 — N1: Fix `run-with-active-session.js` (🔴)

**Problem:** `readActiveSession()` regex expects `` `sessions/...` `` but STATE uses `session: sessions/<id>`.

**Fix:**

- Import `extractField`, `readText` from `_util.js`
- Parse `session:` field (same as `file-edit-guards.js`)
- Normalize to session dir: if value is `sessions/<id>`, pass `--session .harness/sessions/<id>` (current join logic assumes bare id — align with actual field format)
- Export `readActiveSession` for testing

**Tests:** `test/hooks/run-with-active-session.test.js`

- Temp repo with `STATE.md` containing `session: sessions/fixture-id`
- Assert wrapper invokes guard script (mock via spawn or exit code from `--help`)

### Wave 2 — N2: Scope file guards to edit tools only (🔴)

**Problem:** `handleToolEvent` calls `evaluateFileEditHook` for every tool; Read/Grep/Glob set `path` and get denied.

**Fix:**

- Add `isEditTool(payload)` — check `payload.tool_name` / `toolName` against `/Write|Edit|MultiEdit|apply_patch|NotebookEdit/i` (match Claude matcher intent)
- Call `evaluateFileEditHook` only when `isEditTool(payload)` OR shell command implies file write (optional, lower priority)
- Add router tests:
  - Read out-of-scope path → allow
  - Write out-of-scope path → deny (existing test pattern)

### Wave 3 — N3: Test-first severity (Option A — user approved)

**Decision:** Keep hard deny on test-first violations (no code change to severity).

- Document limitation in `hooks/README.md` / `docs/hooks-and-skills-layer.md`: test-first deny requires failing-assertion patterns in corresponding test file; routine edits to tested code may be blocked until test updated.
- Optional: add test asserting deny behavior remains for positive-only test files (documents current contract).

### Wave 4 — Cleanups (N4, N5)

**N4:** Add deprecation bullet to `docs/v1.2.0-release-notes.md` or CHANGELOG noting `--skip-demo-eval` removed; OR restore silent accept with `console.warn` once.

**N5:** Add `notebook_path` to `extractFilePaths` candidates (one-line + test optional).

## Verification Strategy

| Check | Command | Expected |
|-------|---------|----------|
| Build | `npm run build` | exit 0 |
| Full suite | `npm test` | exit 0 |
| N1 | `node --test test/hooks/run-with-active-session.test.js` | pass |
| N2 | `node --test test/hooks/codex-hook-router.test.js` | Read allows, Write denies |
| N1 smoke | run wrapper with fixture STATE | non-zero exit when guard blocks (not silent 0) |

## Risks

- N1 session path normalization may break installs that relied on backtick format (unlikely — template never used backticks)
- N2 tool name list may miss a provider-specific edit tool name

## Rollback

- Revert N2 gate independently if a provider uses unexpected tool names

## Approval Status

status: approved
approved_by: user
approved_at: 2026-06-10
notes: Approved via `/harness-run`. N3 = Option A (document only).

## Blocking Questions

1. Approve PLAN-002 for `harness-run`? (N3 = Option A recorded)
