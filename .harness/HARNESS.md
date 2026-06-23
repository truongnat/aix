# Harness Profile

> Do not include credentials, tokens, customer data, or private business data.

## Purpose

Describe the repository-specific harness operating model, the artifacts it owns, and the workflow it enforces.

## Current Status

- Status: draft
- Last updated: YYYY-MM-DD
- Owner: team-or-person
- Review cadence: weekly | release-based | ad hoc

## Scope

- This harness owns `.harness/` profile artifacts, session state, and verification records.
- This harness does not own production architecture decisions; document those in `DECISIONS.md` and source code.
- Primary artifacts: session goal, plan, verify, blocked, ship, and remember files under `.harness/sessions/`
- Optional durable behavior specs live under `.harness/specs/` when the spec layer is enabled.
- Optional delegated-worker memory lives under `.harness/memory/workers/` when worker memory is enabled.

## Operating Model

This repository uses the core loop:
`harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

Working rules:
1. Start every session by reading state and goal artifacts.
2. Record scope and plan before editing code.
3. Verify with commands and evidence before claiming completion.
4. Capture durable lessons only after verified work ships.

## Assumptions

| Assumption | Why it matters | How to verify |
| --- | --- | --- |
| CI is the main release gate | local pass alone is not enough | link CI run in `VERIFY.md` |
| `.harness/` is project-local state | users may have multiple concurrent goals | keep artifacts scoped to one repo |

## Unknowns

| Question | Blocking? | Owner | Next step |
| --- | --- | --- | --- |
| What are this repo's real test, lint, and build commands? | yes/no |  | update `GATES.md` before first ship |

## Human Review

List any policy, scope, or release decisions that still need a human sign-off.

## Example Profile

- Repository: example-service
- Purpose: keep API changes tied to written goals, explicit verification, and release notes
- Active artifacts: active session `GOAL.md`, `PLAN.md`, `VERIFY.md`, `SHIP.md`
- Default verification: `npm test`, contract validation, and CI confirmation before ship
