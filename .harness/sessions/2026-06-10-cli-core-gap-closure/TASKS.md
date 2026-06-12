# Tasks — PLAN-002 (Round 2)

## Wave 1 — N1 session wrapper

- [x] **T15** Fix `readActiveSession()` to use `extractField(state, "session")`
- [x] **T16** Normalize session path for `--session` arg
- [x] **T17** Add `test/hooks/run-with-active-session.test.js`

## Wave 2 — N2 edit-tool gate

- [x] **T18** Add `isEditTool(payload)` helper
- [x] **T19** Gate `evaluateFileEditHook` in `codex-hook-router.js`
- [x] **T20** Router tests: Read allows, Write denies out-of-scope

## Wave 3 — N3 (Option A: keep hard deny)

- [x] **T21** Document test-first hard-deny limitation in hooks docs
- [x] **T21b** Existing `guard-test-first.test.js` covers deny contract

## Wave 4 — N4/N5

- [x] **T22** N4 post-1.2.3 note in release notes for `--skip-demo-eval`
- [x] **T23** N5 `notebook_path` in extractFilePaths

## Verification

- [x] **V5** `npm test` — 477/477 pass
- [x] **V6** N1 + N2 targeted tests — pass
