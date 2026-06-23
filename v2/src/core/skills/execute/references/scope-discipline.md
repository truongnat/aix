# Scope Discipline

Reference for step 2 of the `execute` `Workflow`.

## The rule

A task touches exactly the files and behavior its plan entry named. Anything else noticed along the way gets logged for a future task, not folded into the current one.

This is the same discipline behind small, single-purpose commits in any mature SDLC: a change is easiest to review, bisect, and revert when it does exactly one thing.

## Handling "while I'm in here" discoveries

1. Note what was found and where (file, line, symptom).
2. Finish the current task and its verification, unmodified by the discovery.
3. Hand the discovery to `plan` as a candidate new task — don't decide unilaterally that it's in scope.

## Anti-patterns

- Expanding a task's diff because an adjacent function "could use a quick cleanup."
- Treating "the plan didn't say not to" as permission — the plan is additive, not a blocklist.
- Silently renaming, reformatting, or restructuring code outside the task's stated change.
