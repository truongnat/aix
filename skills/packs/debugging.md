# Debugging Pack

## Purpose

Route bugs, regressions, flaky behavior, and performance issues toward the most relevant core skills, commands, and checks.

## When To Use

- bugs and regressions
- flaky tests or unstable behavior
- performance or correctness issues

## Recommended Core Skills

- `mapping-codebase`
- `discussing-goals`
- `writing-plans`
- `executing-plans`
- `test-driven-development`
- `verification`

## Recommended Commands

- `harness-map`
- `harness-discuss`
- `harness-plan`
- `harness-run`
- `harness-verify`
- `harness-remember`

## Key Checks

- reproduce the issue
- isolate the affected area
- identify root cause
- keep the fix minimal
- add regression protection where practical

## Common Failure Modes

| Failure | Symptom | Detection |
| --- | --- | --- |
| Symptom-only fix | bug returns in a nearby code path | repro still fails in a variant scenario |
| Unreproduced bug | "fix" lands without proof the issue existed | no failing test or explicit repro steps |
| Multiple hypotheses at once | investigation drifts without clear signal | notes cannot state one falsifiable cause |
| Hidden environment dependency | issue only appears in CI, prod, or one machine | compare env flags, data shape, and versions |
| Collateral regression | original bug fixed but adjacent flow breaks | related-behavior check fails after the patch |

## Verification Expectations

- failing-before or clearly reproduced-before evidence when possible
- passing-after evidence
- explicit regression check for the original issue

## Verification Strategy

- Capture a failing test or reliable repro before changing code whenever possible.
- State one root-cause hypothesis at a time and run a targeted check against it.
- Confirm the original failure is gone after the fix.
- Check at least one adjacent flow for collateral damage.
- Record the root cause in session artifacts, not only the fix.

## Anti-Rationalization

| Shortcut agents take | Counter |
| --- | --- |
| "The fix is obvious" | If the bug shipped once, reproduce it first and prove the cause. |
| "I cannot reproduce it, but I know the line" | Unreproduced bugs do not have confirmed causes; keep investigating or document the gap. |
| "I will add the regression test after the fix" | A post-fix test validates the implementation, not the requirement. |
| "The bug is gone on my machine" | One environment is not evidence; run the targeted verification that matches the reported failure. |

## When Not To Use

- planned feature work with no debugging element
- documentation-only changes

## Notes

Do not let the pack replace systematic debugging discipline; it only routes the agent toward the right core skills and commands.
