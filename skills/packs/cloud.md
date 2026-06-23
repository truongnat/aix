# Cloud Pack

## Purpose

Route cloud-provider, hosted integration, and environment-sensitive work toward the most relevant core skills, commands, and checks.

## When To Use

- AWS, Azure, GCP, Cloudflare, or serverless integration work
- provider-specific deployment or configuration changes
- environment-sensitive behavior or rollout work

## Recommended Core Skills

- `mapping-codebase`
- `writing-plans`
- `executing-plans`
- `verification`
- `remembering`

## Recommended Commands

- `harness-map`
- `harness-discuss`
- `harness-plan`
- `harness-run`
- `harness-verify`
- `harness-remember`

## Key Checks

- provider validation or dry-run
- deployment or rollout confirmation
- rollback path
- health checks or smoke tests

## Common Failure Modes

| Failure | Symptom | Detection |
| --- | --- | --- |
| Environment drift | local config passes but cloud deploy fails | run provider-specific validation or dry-run |
| Missing rollback | failed deploy cannot be reversed quickly | write and review the revert path |
| Identity mismatch | access works in one environment but not another | verify region, account, and credentials assumptions |
| Hidden platform coupling | one provider behaves differently than the others | test the exact provider boundary |

## Verification Expectations

- provider-level validation
- deployment or configuration smoke test
- rollback/recovery notes when relevant

## Verification Strategy

- Identify the provider boundary before editing.
- Check the exact deployment or hosted consumer path, not just local file syntax.
- Record environment-specific assumptions and fallback steps.
- Verify health or smoke behavior after the change lands.

## Anti-Rationalization

| Shortcut agents take | Counter |
| --- | --- |
| "The config is syntactically valid" | Syntax is not deployability; validate the provider path too. |
| "We can fix rollback later" | Rollback is part of correctness for deploy-sensitive changes. |
| "It worked in one region/account" | Environment-specific drift is the common failure; verify the actual target. |

## When Not To Use

- pure application logic with no cloud boundary
- docs-only work
- local-only changes with no hosted integration

## Notes

Use this pack when the repository's stack signals point to provider-specific or hosted-integrations work.
