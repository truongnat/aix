# Feature Workflow

## When To Use

Use this for new capabilities, user-visible behavior changes, or meaningful internal features.

## Command Sequence

`harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

## Decision Tree

- Are the acceptance criteria explicit?
- If no: stay in discussion until scope and success criteria are concrete.
- If yes: is the feature small enough for one approved plan?
- If no: split the work or reduce scope before run.
- If yes: implement in steps, verify each criterion directly, then ship.

## Required Artifacts

- `.harness/STATE.md`
- `.harness/sessions/<active-session>/GOAL.md`
- `.harness/sessions/<active-session>/DISCUSSION.md`
- `.harness/sessions/<active-session>/PLAN-001.md` or the current numbered plan
- `.harness/sessions/<active-session>/TASKS.md` when the work spans multiple steps
- `.harness/sessions/<active-session>/VERIFY.md`

## Recommended Skills

- `using-harness`
- `discussing-goals`
- `brainstorming` when the feature shape is not stable yet
- `writing-plans`
- `executing-plans`
- `using-git-worktrees` when isolation reduces branch risk
- `test-driven-development` when behavior changes
- `requesting-code-review` when an explicit review gate is warranted
- `verification`
- `verification-before-completion`

## Verification Expectations

- acceptance criteria in `.harness/REQUIREMENTS.md` are checked directly
- behavior changes have regression protection where practical
- anything not run is documented in `.harness/VERIFY.md`
- deferred human checks and ship blockers are explicit when automation is insufficient

## Failure Handling

- reduce scope if the feature is too large for one plan
- re-plan if implementation uncovers a materially different design need
- stop before ship if any acceptance criterion is still unknown or unverified

## Artifact Checklist

- `GOAL.md` states the user-visible outcome and boundaries.
- `DISCUSSION.md` records tradeoffs or unresolved shape questions when needed.
- `PLAN-*.md` maps changed files, tasks, and verification strategy.
- `VERIFY.md` checks acceptance criteria directly and documents any deferred human checks.
- `SHIP.md` summarizes what shipped versus what remains follow-up work.

## Completion Criteria

The feature workflow is complete when scope is implemented in small tasks, acceptance criteria are verified, follow-ups are recorded, and durable lessons are captured safely.
