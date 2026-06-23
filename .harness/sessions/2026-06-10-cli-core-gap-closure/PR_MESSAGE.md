# PR Message

## Title

fix(core,cli): close CLI/Core gap review — guards, parser, session wrapper

## Body

### Summary

- Fix `guard-scope` reading wrong `STATE.md` path (C2)
- Deduplicate `guard-phase-policy.js` → re-export (C1)
- Wire scope/test-first guards at tool time via router + provider hooks (C3 Option A)
- Harden CLI value-flag parsing and remove dead options (L1–L3)
- Restore Claude `run-with-active-session.js` session resolution (N1)
- Gate Codex file guards to edit tools only — Read no longer false-denied (N2)

### Changes

**Hooks**
- `hooks/core/guard-scope.js` — repo-root STATE lookup; resolve file paths against repo root
- `hooks/core/guard-phase-policy.js` — thin re-export
- `hooks/core/file-edit-guards.js`, `guard-file-edits.js` — shared runtime wiring + `isEditTool()`
- `hooks/core/codex-hook-router.js` — PreToolUse scope/test-first on edit tools only
- `hooks/core/run-with-active-session.js` — `extractField` session parsing (N1)
- `hooks/core/guard-test-first.js` — assertion regex fix (C5)

**CLI**
- `lib/cli-args.ts` — `takeFlagValue()` guard; consistent throws
- `lib/cli-help.ts` — remove `--skip-demo-eval`

**Tests**
- `test/backend/guard-scope.test.js`, `guard-test-first.test.js`
- `test/hooks/run-with-active-session.test.js` (N1)
- `test/hooks/codex-hook-router.test.js` — Read allow + Write deny (N2)
- cli-args, policy-enforcement updates

**Docs**
- hooks README, hooks-and-skills-layer, scope-guard, v1.2.0 release notes (N3/N4)

### Why

Gap review `CLI_CORE_GAP_REVIEW_2026-06-10` identified correctness bugs (scope guard always failing), dead duplication, orphaned guards, CLI flag swallowing, broken Claude session wrapper, and Codex read-tool false denials after initial guard wiring.

### Verification

- [x] `npm run build` — exit 0
- [x] `npm test` — 477 tests pass
- [x] `node bin/validate.js` — exit 0
- [x] `node --test test/hooks/run-with-active-session.test.js` — 4 pass
- [x] `node --test test/hooks/codex-hook-router.test.js` — Read allow / Write deny

### Files changed

| File | Notes |
|---|---|
| `hooks/core/guard-scope.js` | C2 STATE path + file resolution |
| `hooks/core/guard-phase-policy.js` | C1 re-export |
| `hooks/core/file-edit-guards.js` | Shared guard wiring + isEditTool |
| `hooks/core/guard-file-edits.js` | Provider hook entrypoint |
| `hooks/core/codex-hook-router.js` | C3/N2 PreToolUse enforcement |
| `hooks/core/run-with-active-session.js` | N1 session resolution |
| `hooks/core/guard-test-first.js` | C5 regex fix |
| `lib/cli-args.ts` | L1/L3 parser hardening |
| `test/backend/guard-*.test.js` | C4 behavioral coverage |
| `test/hooks/run-with-active-session.test.js` | N1 |
| `test/hooks/codex-hook-router.test.js` | N2 |
| docs (hooks, scope-guard, release notes) | C6/N3/N4 |

### Risks / Rollback

- **Risk:** Test-first guard blocks edits when tests lack failing assertions (documented; N3 Option A).
- **Risk:** `isEditTool()` list may miss a provider-specific edit tool name.
- **Rollback:** Revert hook/router commits independently; N2 gate can roll back without losing C2/C1 fixes.

### Notes for reviewer

- `--skip-demo-eval` removed from parser (documented in release notes post-1.2.3).
- T14 scan/domains test depth intentionally deferred.
- All changes local/uncommitted — stage untracked hook/test files before commit.
