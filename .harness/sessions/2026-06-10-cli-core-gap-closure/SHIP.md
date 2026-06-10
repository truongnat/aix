# Ship

> Do not include credentials, tokens, customer data, or private business data.

## Summary

Closed CLI/Core gap review Round 1 (C1–C6, L1–L3) and Round 2 (N1–N5): fixed guard-scope STATE path, deduplicated guard-phase-policy, wired scope/test-first guards at tool time (Option A), hardened CLI flag parsing, restored Claude session wrapper resolution, and gated Codex file guards to edit tools only.

## Status

status: shipped

## Plans Shipped

| Plan | Scope | Verify |
|---|---|---|
| PLAN-001 | C1–C6, L1–L3 | passed 2026-06-10 (472 tests) |
| PLAN-002 | N1–N5 | passed 2026-06-10 (477 tests) |

## Verification Basis

- `.harness/sessions/2026-06-10-cli-core-gap-closure/VERIFY.md` — status `passed` (2026-06-10, PLAN-002 fresh run)
- `npm run build` — exit 0
- `npm test` — **477/477** pass
- `node bin/validate.js` — exit 0
- Targeted: `run-with-active-session.test.js` (4), `codex-hook-router.test.js` (12)

## Follow-Ups

- Optional L4: add scan/domains behavioral tests (T14 deferred from PLAN-001)
- Update `docs/internal/reports/POLICY_ENGINE_IMPLEMENTATION.md` if internal doc parity matters
- Live IDE hook smoke for Claude `run-with-active-session.js` and `guard-file-edits.js`
- Dedicated unit test for N5 `notebook_path` extraction (low impact)

## Not Shipped

- npm release / version bump (out of scope)
- Policy-engine rule redesign beyond router wiring
- Test-first severity downgrade (N3 Option A: hard deny retained)

## Handoff Notes

Changes are local/uncommitted on `main`. Stage new files (`file-edit-guards.js`, `guard-file-edits.js`, backend/hook tests, session artifacts, gap report) before PR. See `PR_MESSAGE.md` for copy-ready text.
