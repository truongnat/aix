# Scope Guard

Scope guard ensures that edits stay within the approved scope defined in the goal or plan.

## Policy

No default scope-guard rule is enabled.
Add a custom scope policy in `.harness/policies.json` when a repository needs it.

## Scope Definition

Scope is defined by files referenced in:
- GOAL.md: Files mentioned in the goal description
- PLAN.md: Files listed in the implementation plan

## Enforcement

- Edits to files outside the defined scope will be blocked or warned
- If no scope is defined, all edits are allowed (conservative)
