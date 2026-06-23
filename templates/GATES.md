# Quality Gates

## Status: draft — replace commands with this repository's actual test/lint/build commands

## Universal Gates (apply to all repositories)

| Gate | Command | Pass condition | Evidence required |
|---|---|---|---|
| Tests | `npm test` | exit 0, all pass | command output |
| Type check | `tsc --noEmit` | exit 0, no errors | command output |
| Lint | `eslint .` | exit 0 or warnings only | command output |
| Build | `npm run build` | exit 0, no errors | command output |

> Replace `npm test`, `tsc --noEmit`, etc. with this repo's actual commands.
> Remove rows for tools this repo does not use.

## Optional Gates (add when applicable)

| Gate | Command | When to add |
|---|---|---|
| Security scan | `npm audit --audit-level=high` | When dependencies are user-facing |
| Coverage | `npm run test:coverage` | When coverage threshold is enforced |
| Schema migration | `<migrate-tool> --dry-run` | When persistence schema changes |
| API contract | `<contract-test-tool>` | When API has external consumers |

## Evidence Requirements

- Each gate must produce command output recorded in `VERIFY.md`
- Exit code must be 0 or explicitly documented as acceptable
- "Looks like it passed" is not evidence - run the command and record output

## Stop Conditions

- Do not ship if any universal gate fails and the failure is unresolved
- Do not ship if `VERIFY.md` is missing, has no evidence, or status is `blocked`
- Do not ship if this file requires human sign-off and it is not recorded
