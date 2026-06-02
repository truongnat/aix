# Install-To-Profile Walkthrough

## Purpose

Show the shortest practical path from install to validated profile and goal artifacts for a first-time adopter.

## When To Use

Use this walkthrough when:

- adopting the harness into a repository for the first time
- learning the minimum install-to-profile flow
- setting up a small or toy repository before real feature work

## Prerequisites

- a local clone of `ai-engineering-harness`
- a local target repository path such as `../my-project`
- Node.js available to run `install.js` and `validate.js`

## Step 1: Dry Run Install

Preview the copy surface first:

```bash
node install.js --target ../my-project --dry-run
```

Review the `WOULD COPY` lines and confirm the target path is correct.

## Step 2: Run Install

If the dry run looks correct, perform the real install:

```bash
node install.js --target ../my-project
```

Read the printed next-step guidance at the end of the install output.

## Step 3: Read The Installed Entry Points

Inside the target repository, start with:

- `AGENTS.md`
- `docs/adoption-guide.md`
- `docs/harness-build-usage.md`
- `docs/target-repo-validation.md`

If the repository is very small, also read:

- `docs/small-repo-memory.md`

## Step 4: Create Profile Artifacts

Create the required `.harness/` profile artifacts:

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`

For a minimal reference shape, use:

- `examples/tiny-repo-adoption/`

## Step 5: Validate Profile

Run profile validation:

```bash
node validate.js --target ../my-project --profile-only
```

Fix any missing files or headings before moving on.

## Step 6: Create Goal Artifacts

Create a goal artifact set such as:

- `.harness/goals/health-check/GOAL.md`
- `.harness/goals/health-check/PLAN.md`
- `.harness/goals/health-check/TASKS.md`
- `.harness/goals/health-check/VERIFY.md`
- `.harness/goals/health-check/REMEMBER.md`

## Step 7: Validate Goal

Run goal validation:

```bash
node validate.js --target ../my-project --goal health-check
```

Treat the result as a structural artifact check, not as proof that the application is correct.

## Step 8: Proceed To Planning

Once the profile and goal artifacts validate:

- refine the plan
- confirm verification expectations
- proceed into the normal command loop

## Common Mistakes

- skipping the dry run
- assuming install creates `.harness/` profile artifacts automatically
- treating a passing validator result as proof of application correctness
- creating a heavy memory structure too early for a tiny repository

## Safety Notes

- keep markdown as the source of truth
- do not store secrets or private business data in `.harness/`
- keep validation structural-only
- use small-repo memory conventions when the repository does not need a heavier memory surface
