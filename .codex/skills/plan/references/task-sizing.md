# Task Sizing

Reference for breaking work into tasks in the `plan` `Workflow`.

## A task is sized right when

- it changes one thing a verification step can check in isolation
- it can be described in one line without "and" joining two unrelated changes
- failing it blocks exactly the next task, not the whole plan

This mirrors the standard agile sizing heuristics (independent, small, testable) without needing the full INVEST checklist for a single-implementer plan.

## Splitting a task that's too big

- "add the feature and update its tests" → split into the behavior change and the regression-test task, each independently verifiable
- "refactor X and fix bug Y" → split into the refactor (verified by no behavior change) and the fix (verified by the bug's repro case)

## Anti-patterns

- One task covering an entire plan ("implement the feature") — that's the plan, not a task.
- A task with no verification step — if it can't be checked, it can't be marked done.
- Tasks ordered by convenience instead of dependency — a later task that secretly depends on an earlier one being skipped causes silent breakage.
