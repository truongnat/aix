# Feature: Google Login With Guest Mode

## Situation

Add Google login to a Flutter app while preserving guest mode so users can still continue into the app without authentication.

## Recommended Workflow

`feature`

## Recommended Skill Pack

`mobile`

If a separate auth API contract is also changing, add `backend`.

## Command Sequence

`harness-map -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

## Artifacts To Produce

- `.harness/GOAL.md`
- `.harness/DISCUSSION.md`
- `.harness/PLAN.md`
- `.harness/TASKS.md`
- `.harness/VERIFY.md`
- `.harness/SHIP.md`
- `.harness/REMEMBER.md`

## Verification Evidence

- guest flow still enters the app
- Google login flow succeeds
- logout returns the app to the expected state
- token or session handling is checked at the app boundary
- targeted simulator, device, or manual flow checks are recorded

## Remembered Lesson

When adding optional authentication, preserve guest mode as an explicit acceptance criterion and verify it separately from the signed-in flow.

## Safety Notes

- do not store provider secrets or tokens in harness artifacts
- keep backend auth redesign out of scope unless it is discussed and planned explicitly
