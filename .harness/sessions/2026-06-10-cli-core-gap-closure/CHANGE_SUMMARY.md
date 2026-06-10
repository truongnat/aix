# Change Summary

## Change Set

base: HEAD (uncommitted)
head: working tree
branch: main

## Stats

files_changed: 23 tracked + 7 untracked implementation paths
insertions: 296
deletions: 389

## Modified (23 tracked)

| Path | Delta |
|---|---|
| `.harness/DECISIONS.md` | DECISION-002 (PLAN-001) |
| `.harness/HAZARDS.md` | HAZARD-004 (PLAN-001) |
| `.harness/INDEX.md` | guard-scope smoke recipe |
| `.harness/STATE.md` | Session routing |
| `docs/hooks-and-skills-layer.md` | Runtime enforcement + N3 limitation |
| `docs/scope-guard.md` | Codex router policy text |
| `docs/v1.2.0-release-notes.md` | N4 `--skip-demo-eval` note |
| `hooks/README.md` | Guard script table + N3 docs |
| `hooks/core/codex-hook-router.js` | File edit guard + N2 isEditTool gate |
| `hooks/core/guard-phase-policy.js` | ~308 lines → re-export |
| `hooks/core/guard-scope.js` | STATE path + file resolution |
| `hooks/core/guard-test-first.js` | Assertion regex |
| `hooks/core/run-with-active-session.js` | N1 extractField session parsing |
| `hooks/providers/claude/settings.example.json` | Write/Edit hook |
| `lib/cli-args.ts` | Flag parsing |
| `lib/cli-help.ts` | Remove `--skip-demo-eval` |
| `runtime/claude/settings.project.fragment.json` | Write/Edit hook |
| `test/cli-args.test.js` | Flag edge tests |
| `test/cli-tests.js` | Runtime alias test update |
| `test/domain-skills.test.js` | ParseOptions shape |
| `test/evals/policy-enforcement.test.js` | Re-export + scope doc |
| `test/hooks/codex-hook-router.test.js` | N2 Read allow + Write deny |

## Added (7 implementation + session)

| Path | Purpose |
|---|---|
| `hooks/core/file-edit-guards.js` | Shared scope/test-first wiring + isEditTool |
| `hooks/core/guard-file-edits.js` | Provider stdin hook CLI |
| `test/backend/guard-scope.test.js` | Behavioral scope tests |
| `test/backend/guard-test-first.test.js` | Assertion + guard tests |
| `test/hooks/run-with-active-session.test.js` | N1 session wrapper tests |
| `.harness/sessions/2026-06-10-cli-core-gap-closure/*` | Harness session artifacts |
| `docs/internal/reports/CLI_CORE_GAP_REVIEW_2026-06-10.md` | Source gap report |

## Main Areas

- Core hooks: scope, phase dedupe, file-edit guards, session wrapper
- Codex router: edit-tool-only enforcement (N2)
- CLI: flag parsing hardening
- Tests: backend guards + hook integration
- Docs: enforcement narrative aligned with wiring

## Durable Notes

- Session STATE lives at repo root, not session dir (HAZARD-004)
- File guards must not run on Read/Grep tools (HAZARD-005)
- Test-first hard deny is intentional (DECISION-003)
