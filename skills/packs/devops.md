# DevOps Pack

## Purpose

Route deployment, CI/CD, infrastructure config, and observability work toward the most relevant core skills, commands, and checks.

## When To Use

- CI/CD changes
- deployment config
- Dockerfiles or infra configuration in host repos
- observability or environment-sensitive changes

## Recommended Core Skills

- `mapping-codebase`
- `writing-plans`
- `executing-plans`
- `verification`
- `code-review`

## Recommended Commands

- `harness-map`
- `harness-discuss`
- `harness-plan`
- `harness-run`
- `harness-verify`
- `harness-remember`

## Key Checks

- secrets safety
- rollback path
- environment differences
- health checks and logs
- deployment blast radius

## Common Failure Modes

| Failure | Symptom | Detection |
| --- | --- | --- |
| Environment drift | config passes locally, fails in CI or prod | compare env vars, runner image, and tool versions |
| Missing rollback path | deploy works once but cannot be safely reverted | no rollback steps or reversible artifact exists |
| Secret exposure | credentials appear in logs or committed config | grep changed files and logs for keys, tokens, passwords |
| Broken health check | deployment is "green" but service is unavailable | smoke check or health endpoint fails |
| Blast-radius mismatch | shared infra is changed by a repo-local task | review target environment and affected services |

## Verification Expectations

- dry-run or config validation when available
- build or pipeline verification
- smoke checks after change where relevant

## Verification Strategy

- Run dry-run or config validation before applying infra-sensitive changes.
- Verify the exact pipeline or deployment command that the repo really uses.
- Run a smoke check against the changed environment or service when possible.
- Document the rollback command or reversal plan in the plan or verify artifact.
- Check logs or health endpoints after the change, not just deploy exit status.

## Anti-Rationalization

| Shortcut agents take | Counter |
| --- | --- |
| "CI is green, so prod is fine" | CI validates one environment; confirm the deployed surface and health checks too. |
| "It is only config, no tests needed" | Config changes often break at runtime; validate the exact consumer path. |
| "Rollback is obvious" | If rollback is not written down, it is not a plan. |
| "Secrets are safe because the repo is private" | Private repos still leak through logs, screenshots, and review artifacts; inspect explicitly. |

## When Not To Use

- feature work limited to application logic or UI
- documentation-only changes

## Notes

Treat secrets handling as a first-class safety concern and keep them out of harness artifacts.
