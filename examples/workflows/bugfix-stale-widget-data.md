# Bugfix: Stale Widget Data

## Situation

A mobile widget shows a stale lunar date until the main app is opened, so the widget does not update reliably on day change.

## Recommended Workflow

`bugfix`

## Recommended Skill Pack

`mobile` plus `debugging`

## Command Sequence

`harness-map -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

## Artifacts To Produce

- `.harness/GOAL.md`
- `.harness/CONTEXT.md`
- `.harness/PLAN.md`
- `.harness/VERIFY.md`
- `.harness/SHIP.md`
- `.harness/REMEMBER.md`

## Verification Evidence

- stale state is reproduced or clearly characterized before the fix
- update schedule or timeline behavior is adjusted and documented
- manual day-change simulation or equivalent check is recorded
- any OS-level widget refresh limitations are noted explicitly

## Remembered Lesson

Widget freshness bugs often depend on platform scheduling behavior, so verification should include manual timeline or day-change checks rather than relying only on app-open behavior.

## Safety Notes

- do not over-claim control over OS widget refresh timing
- keep logs and diagnostics free of customer data
