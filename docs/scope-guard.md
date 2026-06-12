# Scope Guard

Scope guard ensures that edits stay within the approved scope defined in the goal or plan.

## Policy

Scope enforcement runs at tool time through `hooks/core/codex-hook-router.js` when an active session is present in `.harness/STATE.md`.
Repositories can add custom scope policies in `.harness/policies.json` when needed.

## Scope Definition

Scope is defined by files referenced in:
- GOAL.md: Files mentioned in the goal description
- PLAN.md: Files listed in the implementation plan

## Enforcement

- Edits to files outside the defined scope will be blocked or warned
- If no scope is defined, all edits are allowed (conservative)
