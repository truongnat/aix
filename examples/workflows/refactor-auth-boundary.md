# Refactor: Auth Boundary Separation

## Situation

Separate auth and session handling from feature code without changing user-visible behavior.

## Recommended Workflow

`refactor`

## Recommended Skill Pack

Use `backend` if the auth boundary is service-oriented.

Use `frontend` if the auth boundary is client-side session orchestration.

## Command Sequence

`harness-map -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

## Artifacts To Produce

- `.harness/GOAL.md`
- `.harness/CONTEXT.md`
- `.harness/PLAN.md`
- `.harness/TASKS.md`
- `.harness/VERIFY.md`
- `.harness/SHIP.md`
- `.harness/REMEMBER.md`

## Verification Evidence

- no intended behavior changes are recorded
- existing tests pass
- login and session flows remain unchanged
- any moved boundaries are reviewed for regressions at integration points

## Remembered Lesson

Refactoring auth boundaries is safer when behavior-preserving checks are stated up front and login/session flows are verified explicitly after structural changes.

## Safety Notes

- keep secrets and session tokens out of harness artifacts
- if behavior starts changing, re-scope the work as feature or bugfix instead of hiding it inside a refactor
