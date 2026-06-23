# Goal

## Summary

Close correctness, consistency, and test-coverage gaps identified in `docs/internal/reports/CLI_CORE_GAP_REVIEW_2026-06-10.md` across Core hooks (`hooks/core/*`) and CLI parsing (`lib/cli-args.ts`).

## Acceptance

- **C2 fixed:** `guard-scope.js` reads `current_plan` from repo-root `.harness/STATE.md` (same pattern as `guard-phase.js`), never throws on missing session-local `STATE.md`.
- **C1 fixed:** `guard-phase-policy.js` deduplicated — thin re-export or deleted with references/tests updated.
- **L1 fixed:** Value-taking CLI flags reject a following `--flag` token (parity with `hooks/core/_util.js:35`).
- **C3 resolved:** Explicit product decision recorded — wire scope/test-first guards, keep as manual workflow hooks only, or remove.
- **Tests:** Behavioral coverage added for surviving guard logic and CLI flag edge cases; `npm test` passes.
- **Docs:** Enforcement scope documented accurately (C6) — no overstated runtime guard claims.

## Out of Scope

- Full PreToolUse wiring of all guards into `codex-hook-router.js` unless C3 option A is chosen.
- npm release or version bump.
- Unrelated refactors in `lib/cli-commands/*` beyond parser/consistency fixes (L2/L3/L4 scope only).

## Source

- `docs/internal/reports/CLI_CORE_GAP_REVIEW_2026-06-10.md`
