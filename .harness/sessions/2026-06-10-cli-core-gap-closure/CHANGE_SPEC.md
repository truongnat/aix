# Change Spec

> Do not include credentials, tokens, customer data, or private business data.

## Goal

Behavior deltas for CLI/Core gap closure (2026-06-10).

## Scope

Parser validation, guard-scope STATE lookup, guard deduplication; optional guard removal or wiring per C3.

## Current Behavior

- [ ] `guard-scope.js` throws when resolving plan name (reads non-existent session `STATE.md`).
- [ ] CLI accepts `--scope --yes` and treats `--yes` as scope value.
- [ ] `guard-phase-policy.js` duplicates `guard-phase.js`.
- [ ] Scope/test-first guards exist but are not invoked at runtime.

## ADDED Requirements

- [ ] CLI value flags reject a following token that starts with `--`.
- [ ] Behavioral tests for `guardScope()` and CLI flag edge cases.
- [ ] Documentation clarifying runtime vs manual guard invocation (C6).

## MODIFIED Requirements

- [ ] `guard-scope.js` reads `current_plan` from `<repoRoot>/.harness/STATE.md` with exists guard.
- [ ] `guard-phase-policy.js` becomes thin re-export or is removed.
- [ ] Missing-value handling for `--scope`, `--visibility`, `--target` throws consistently (L3).

## REMOVED Requirements

- [ ] (Option B only) `guard-scope.js` and `guard-test-first.js` removed from pack.
- [ ] (L2 if chosen) `providerAlias` / `runtimeAliasUsed` removed from `ParseOptions`.

## Validation

- Command: `npm run build && npm test`
- Expected result: exit 0; new guard/CLI tests pass.

## Approval Status

status: draft
approved_by:
approved_at:
notes: Tied to PLAN-001 approval and C3 disposition.
