# Tiny Repo Adoption Example

This is a tiny target-repository adoption example for `ai-engineering-harness`.

It is not a real app. It shows the expected `.harness/` profile and goal artifact shape for a very small repository.

## Scenario

Add a health check endpoint without changing existing behavior.

## Recommended Read Order

1. `PROJECT.md`
2. `HARNESS.md`
3. `TEAM.md`
4. `SKILLS.md`
5. `WORKFLOW.md`
6. `GATES.md`
7. `MEMORY.md`
8. `goals/health-check/GOAL.md`
9. `goals/health-check/PLAN.md`
10. `goals/health-check/VERIFY.md`

## How To Validate A Similar Target Repo

```bash
node bin/validate.js --target ../my-project --profile-only
node bin/validate.js --target ../my-project --goal health-check
```
