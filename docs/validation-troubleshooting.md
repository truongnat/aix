# Validation Troubleshooting

## Purpose

Help first-time adopters understand common validation failures and fix them quickly without changing validator behavior.

## When To Use

Use this guide when:

- `node validate.js` fails in this harness repository
- target profile validation fails
- target goal validation fails
- you are unsure whether a failure is about a missing file or a missing heading

## Common Commands

```bash
node validate.js
node validate.js --target ../my-project --profile-only
node validate.js --target ../my-project --goal health-check
```

## Common Failure Messages

Examples:

- `Missing required path: .harness/HARNESS.md`
- `.harness/HARNESS.md is missing heading: ## Human Review`
- `Missing required path: .harness/goals/health-check/PLAN.md`
- `.harness/goals/health-check/GOAL.md is missing heading: ## Acceptance Criteria`

Read these literally:

- `Missing required path` means the expected file or directory does not exist at that path
- `is missing heading` means the file exists, but one required heading is absent or spelled differently

## How To Fix Missing Profile Files

If profile validation fails on a required profile file:

1. Confirm the target repository contains `.harness/`
2. Create the missing file at the exact path named by the validator
3. Fill it with the required heading structure
4. Run `node validate.js --target ../my-project --profile-only` again

Required profile files:

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`

Use these references if needed:

- [docs/install-to-profile-walkthrough.md](install-to-profile-walkthrough.md)
- [examples/tiny-repo-adoption/](../examples/tiny-repo-adoption/)

## How To Fix Missing Goal Files

If goal validation fails on a goal artifact:

1. Confirm the goal directory matches the requested goal id exactly
2. Create the missing file under `.harness/goals/<goal-id>/`
3. Add the required heading structure
4. Run `node validate.js --target ../my-project --goal <goal-id>` again

Required goal files:

- `.harness/goals/<goal-id>/GOAL.md`
- `.harness/goals/<goal-id>/PLAN.md`
- `.harness/goals/<goal-id>/TASKS.md`
- `.harness/goals/<goal-id>/VERIFY.md`
- `.harness/goals/<goal-id>/REMEMBER.md`

## How To Fix Missing Headings

If a file exists but a heading is missing:

1. Open the exact file named in the error
2. Add the missing heading with the same spelling and punctuation
3. Keep the heading at markdown heading level `##` when that is what the contract expects
4. Re-run the same validation command

Common causes:

- using `#` instead of `##`
- changing heading wording such as `Acceptance` instead of `Acceptance Criteria`
- using a different capitalization such as `Out of scope` instead of `Out Of Scope`

## What A Passing Validation Means

A passing result means:

- the required harness paths exist
- the required profile or goal files exist
- the required headings are present
- the target repository matches the current structural contract

## What A Passing Validation Does Not Mean

A passing result does not mean:

- the application code is correct
- the feature implementation is complete
- the repository is ready to ship
- the workflow choice is optimal
- the rest of the repository is free of secrets or other risks

Validation is structural only.

## Safety Notes

- do not paste secrets, tokens, or private business data into harness artifacts just to satisfy validation
- do not treat validation as a substitute for planning, review, or verification
- do not broaden the validator mentally into an application-quality check; it is intentionally narrower than that
