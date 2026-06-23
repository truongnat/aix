# Verification

> Do not include credentials, tokens, customer data, or private business data.

## Goal

Close Round 2 gaps (N1–N5) from `docs/internal/reports/CLI_CORE_GAP_REVIEW_2026-06-10.md`, building on shipped PLAN-001 work.

## Status

status: passed
freshness: 2026-06-10 (fresh run — PLAN-002)
summary: N1 session wrapper fixed and tested; N2 edit-tool gate prevents Read false denials; N3 documented (Option A hard deny); N4/N5 cleanups done. Full suite green.

## Tests Run

| Command | Exit Code | Result | Notes |
|---|---:|---|---|
| `npm run build` | 0 | passed | TypeScript compile clean |
| `npm test` | 0 | passed | **477** tests, 0 failures |
| `node bin/validate.js` | 0 | passed | 576 required files/contracts |
| `node --test test/hooks/run-with-active-session.test.js` | 0 | passed | 4 tests — N1 |
| `node --test test/hooks/codex-hook-router.test.js` | 0 | passed | 12 tests incl. Read allow + Write deny — N2 |
| `node --test test/backend/guard-test-first.test.js` | 0 | passed | hard-deny contract — N3 Option A |

## Manual Checks

| Step | Expected | Observed | Result |
|---|---|---|---|
| N1 session field | `readActiveSession` parses `session: sessions/<id>` | Unit + integration tests pass | passed |
| N1 wrapper invokes hook | Non-silent exit when session present | `run-with-active-session` test: status ≠ 0 | passed |
| N2 Read out-of-scope | `permissionDecision: allow` | Router test with `tool_name: Read` | passed |
| N2 Write out-of-scope | `permissionDecision: deny` | Router test with `tool_name: Write` | passed |
| N3 Option A | Hard deny documented, no severity downgrade | hooks README + hooks-and-skills-layer updated | passed |
| N4 | `--skip-demo-eval` removal noted | Post-1.2.3 note in v1.2.0-release-notes | passed |

## Deferred Human Checks

| Check | Why automation is insufficient | Owner | Blocking for ship? | Status |
|---|---|---|---|---|
| Live Claude hooks via `run-with-active-session.js` in IDE | Requires installed `.ai-harness` + Claude settings | maintainer | no | pending |

## Evidence

- All commands above run fresh in this verify pass (2026-06-10)
- PLAN-001 cumulative: guard-scope smoke, cli-args edge cases still covered by full `npm test`

## Known Gaps

- Live IDE hook smoke for restored Claude wrapper chain (unit tests only)
- N5 `notebook_path` added without dedicated unit test (low impact)

## Ship Blockers

- None for PLAN-002 scope.

## Acceptance Mapping (PLAN-002)

| Criterion | Evidence |
|---|---|
| N1 session resolution | `run-with-active-session.test.js` (4 pass) |
| N2 Read allows / Write denies | `codex-hook-router.test.js` |
| N3 Option A documented | hooks docs; existing guard-test-first tests |
| N4 deprecation note | `docs/v1.2.0-release-notes.md` |
| N5 notebook_path | `file-edit-guards.js` extractFilePaths |
| Full suite | `npm test` 477/477 |

## Prior Verification

PLAN-001 verify (same session): passed 2026-06-10 — see git history / prior VERIFY content in session artifacts.

## Blocking Questions

1. None.
