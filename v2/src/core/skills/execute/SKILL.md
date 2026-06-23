---
name: execute
description: Use when an approved plan exists and its next task needs to be implemented without drifting scope or skipping state updates.
metadata:
  version: 0.1.0
---

## Skill name

execute

## Instruction

Implement the plan's next task, one at a time, staying inside what was actually approved — and stop to re-plan rather than improvising when reality doesn't match the plan.

## When to use

- a plan from `plan` has been approved and confirmed via `visualize-result`
- resuming implementation work that's already partway through a plan
- progress needs to stay tightly aligned to documented, ordered tasks

## When not to use

- no approved plan exists yet — run `plan` first
- the request changed enough that the plan no longer fits — re-run `plan`, don't improvise
- the work is pure review with nothing to implement

## Inputs

- the approved, confirmed plan
- the current task list and its state
- the files and systems the next task touches

## Workflow

1. Re-read the plan and identify the next unfinished task — not the most interesting one.
2. Implement only what that task specifies, nothing adjacent "while already in the file".
3. Run that task's defined verification step immediately, not deferred to the end.
4. Update the task list state before moving to the next task.
5. If the task turns out to need something the plan didn't anticipate, stop and route back to `plan` instead of deciding unilaterally.

## Operating Principles

- The plan is the source of execution truth, not a suggestion.
- One task at a time, verified before moving on, beats a large unverified batch.
- Discovering a gap in the plan is normal; silently filling it yourself is not.

## Output Contract

This skill must produce:

- the implemented task, scoped exactly to what the plan specified
- evidence from that task's verification step
- an updated task list state

## Common Failure Modes

| Excuse | Reality |
|---|---|
| "I'm already in this file, might as well fix this other thing too" | That's scope creep outside the approved plan. Log it for a future task, don't fold it in. |
| "I'll verify everything at the end instead of per task" | Batched verification hides which task actually broke something. Verify per task. |
| "The plan didn't cover this edge case, I'll just decide" | Undocumented decisions during execution are exactly what `plan` exists to avoid. Stop and re-plan. |

## Checklist Before Done

- [ ] The implemented task matches exactly what the plan specified
- [ ] That task's verification step ran and produced evidence
- [ ] Task list state was updated before moving on
- [ ] Any plan gap was routed back to `plan`, not decided unilaterally

## Example

Plan task 2 says "branch the existing-install check on `--force`, verified by an integration test that overwrites an existing `.ai-harness/`." `execute` implements exactly that branch, runs the integration test, confirms it passes, marks task 2 done, and moves to task 3 — without also refactoring the unrelated `versioning/index.ts` file it happened to open.

## Output

One completed, verified task and an updated task list — handed to the next `execute` pass or to `verify` once all tasks are done.

## References

- `FORMS.md` — guide for logging task attempts
- `assets/task-log-template.md` — blank execution log template
- `scripts/log-task.sh` — appends a task-attempt row to the execution log
- `references/scope-discipline.md` — how to handle out-of-scope discoveries
