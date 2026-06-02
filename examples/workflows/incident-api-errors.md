# Incident: API Errors After Delete Or Update

## Situation

A production API has repeated `404` or `500` errors after delete or update operations, and the team needs to understand the blast radius, stabilize the system, and capture the mitigation clearly.

## Recommended Workflow

`incident`

## Recommended Skill Pack

`backend` plus `debugging`

## Command Sequence

`harness-start -> harness-map -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

## Artifacts To Produce

- `.harness/GOAL.md`
- `.harness/STATE.md`
- `.harness/CONTEXT.md`
- `.harness/PLAN.md`
- `.harness/VERIFY.md`
- `.harness/SHIP.md`
- `.harness/REMEMBER.md`

## Verification Evidence

- logs or error traces are reviewed
- the likely root cause is identified or narrowed clearly
- mitigation steps are documented
- regression checks are defined for delete and update paths
- partial verification is labeled honestly if full production proof is not available yet

## Remembered Lesson

Delete and update incidents often hide contract or state assumptions, so mitigation should be paired with explicit regression checks for the affected resource lifecycle.

## Safety Notes

- do not paste sensitive production payloads, secrets, or private business data into artifacts
- if only a mitigation is shipped, state that clearly instead of claiming the root cause is fully resolved
