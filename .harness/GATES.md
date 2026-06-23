# Quality Gates

## Purpose

Describe the quality gates that protect repository changes.

## Current Status

- Status: draft
- Last calibrated: YYYY-MM-DD
- Replace example commands with this repository's real commands before first ship

## Quality Gates

| Gate | Command | Pass condition | Evidence |
| --- | --- | --- | --- |
| Tests | `npm test` | exit 0, all required tests pass | command output in `VERIFY.md` |
| Type check | `npm run build` | exit 0 (tsc via build script) | command output |
| Validate | `node bin/validate.js` | exit 0, contract checks pass | command output |
| Build | `npm run build` | exit 0, no build errors | command output |
| CI | repo CI workflow | required checks conclude success | linked run id or URL |

## Evidence Requirements

- Record the exact commands executed
- Capture pass/fail status, not intent
- Note skipped checks and why they were skipped
- Treat "looks good" or "should pass" as non-evidence

## Stop Conditions

- Plan missing or not approved
- Acceptance criteria unclear
- Verification failed or is blocked
- Required human sign-off is missing

## Human Review

List temporary waivers and who approved them.

## Example Gates

| Gate | Command | Pass condition | Evidence |
| --- | --- | --- | --- |
| Regression tests pass | `npm test` | target behavior passes without new failures | test output copied into `VERIFY.md` |
| Shipping evidence is concrete | review `VERIFY.md` | every required check has proof or documented gap | CI run id plus exact verification commands |
