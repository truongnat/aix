# Session Report — CLI/Core Gap Closure

**Date:** 2026-06-10  
**Session:** `2026-06-10-cli-core-gap-closure`  
**Source:** `docs/internal/reports/CLI_CORE_GAP_REVIEW_2026-06-10.md`  
**Plans:** PLAN-001 (Round 1) + PLAN-002 (Round 2)

## Summary

Shipped fixes for Core hook correctness, CLI parser parity, runtime scope/test-first enforcement, Claude session wrapper restoration, and Codex read-tool false-denial prevention.

## What Changed

### Round 1 — Core hooks & CLI (PLAN-001)

- **C2:** `guard-scope.js` reads `current_plan` from repo-root `.harness/STATE.md`.
- **C1:** `guard-phase-policy.js` reduced to thin re-export of `guard-phase.js`.
- **C3/C5:** New `file-edit-guards.js` + `guard-file-edits.js`; router invokes scope/test-first on PreToolUse; fixed `hasFailingAssertion()` regex.
- **L1/L3:** Value flags reject following `--flag` tokens; removed dead aliases; dropped `--skip-demo-eval` parser acceptance.
- Provider settings: Write/Edit hooks in Claude example + project fragment.

### Round 2 — Regressions & over-broad enforcement (PLAN-002)

- **N1:** `run-with-active-session.js` uses `extractField(state, "session")` instead of backtick regex; resolves session dir correctly.
- **N2:** `isEditTool()` gates file guards — Read/Grep allow out-of-scope; Write/Edit still deny.
- **N3:** Option A — hard deny on test-first retained; limitation documented in hooks docs.
- **N4:** Post-1.2.3 note for `--skip-demo-eval` removal in release notes.
- **N5:** `notebook_path` added to `extractFilePaths`.

### Tests & docs

- New: `test/backend/guard-scope.test.js`, `guard-test-first.test.js`, `test/hooks/run-with-active-session.test.js`
- Updated: router, cli-args, policy-enforcement tests
- Docs: `hooks/README.md`, `docs/hooks-and-skills-layer.md`, `docs/scope-guard.md`, `docs/v1.2.0-release-notes.md`

## Verification

| Check | Result |
|---|---|
| `npm run build` | pass |
| `npm test` | 477/477 pass |
| `node bin/validate.js` | pass |
| N1 session wrapper | 4 tests pass |
| N2 Read allow / Write deny | router tests pass |

## Risks / Notes

- Scope extraction regex may be greedy on GOAL/PLAN paths (conservative allow when no refs).
- Test-first hard deny may block routine edits until failing assertion exists in test file (documented).
- Live provider hook path not manually smoke-tested in IDE.

## Follow-ups

- Live Claude IDE hook smoke
- Optional L4 scan/domains test depth
- POLICY_ENGINE_IMPLEMENTATION.md parity

## Status

status: ready-for-pr
