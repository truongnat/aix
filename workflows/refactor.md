# Refactor Workflow

## When To Use

Use this for structural improvements that should preserve behavior while improving clarity, maintainability, or boundaries.

## Command Sequence

`harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

## Decision Tree

- Is the work behavior-preserving?
- If no: treat it as feature or bugfix work instead.
- If yes: can you state the invariants before editing?
- If no: stop and define them in the plan.
- If yes: refactor in small steps and verify invariants after each meaningful change.

## Required Artifacts

- `.harness/GOAL.md`
- `.harness/CONTEXT.md`
- `.harness/PLAN.md`
- `.harness/VERIFY.md`

## Recommended Skills

- `using-harness`
- `mapping-codebase`
- `writing-plans`
- `executing-plans`
- `test-driven-development` when behavior safety needs regression coverage
- `verification`

## Verification Expectations

- invariants are stated before execution
- behavior-preserving checks are run after each meaningful step when practical
- any intentional behavior change is treated as feature work instead

## Failure Handling

- if behavior change becomes necessary, return to discussion and re-scope
- if refactor scope balloons, split it into smaller plans
- if verification coverage is weak, state that risk explicitly

## Artifact Checklist

- `GOAL.md` states why the refactor is needed and what behavior must stay stable.
- `PLAN.md` lists invariants, touched areas, and rollback strategy if relevant.
- `VERIFY.md` records the checks that prove behavior still holds.
- `REMEMBER.md` captures any new convention or hazard introduced by the structural change.

## Completion Criteria

The refactor workflow is complete when the structure is improved, behavior is still supported by evidence, and any new conventions worth keeping are remembered safely.
