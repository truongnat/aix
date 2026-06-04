# Install-To-Profile Walkthrough

## Purpose

Show the shortest practical path from install to validated profile and goal artifacts for a first-time adopter.

This is the recommended current consumption flow, not the only possible future mode.

## When To Use

Use this walkthrough when:

- adopting the harness into a repository for the first time
- learning the minimum install-to-profile flow
- setting up a small or toy repository before real feature work

## Prerequisites

- a local clone of `ai-engineering-harness` as the harness source pack
- a local target repository path such as `../my-project`
- Node.js available to run `install.js` and `validate.js`

The source clone is only the harness source.

The target repository is the actual project where product work happens.

## Step 1: Dry Run Install

Preview the plugin-like operating surface first:

```bash
node install.js --target ../my-project --dry-run
```

Review the `WOULD COPY` lines and confirm the target path is correct.

## Step 2: Run Install

If the dry run looks correct, perform the real install into the target project:

```bash
node install.js --target ../my-project
```

Read the printed next-step guidance at the end of the install output. The install copies the markdown operating surface into the target repository.

## Step 3: Read The Installed Entry Points

Inside the target repository, start with:

- `AGENTS.md`
- `docs/adoption-guide.md`
- `docs/target-repo-validation.md`
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

When using richer examples such as flutter-google-login, map `examples/...` paths to `.harness/` in the target repo. See [harness-example-to-target-layout.md](harness-example-to-target-layout.md).

## Step 5: Validate Profile

Run profile validation **from the harness source pack** (not from inside the target repo):

```bash
# cwd: ai-engineering-harness clone
node validate.js --target ../my-project --profile-only
```

`validate.js` is not copied into the target repo by default. Use `--target` to check the host repository’s `.harness/` artifacts.

Fix any missing files or headings before moving on.

If validation fails, use [docs/validation-troubleshooting.md](validation-troubleshooting.md).

## Step 6: Create Goal Artifacts

Create a goal artifact set such as:

- `.harness/goals/health-check/GOAL.md`
- `.harness/goals/health-check/PLAN.md`
- `.harness/goals/health-check/TASKS.md`
- `.harness/goals/health-check/VERIFY.md`
- `.harness/goals/health-check/REMEMBER.md`

## Step 7: Validate Goal

Run goal validation from the source pack:

```bash
node validate.js --target ../my-project --goal health-check
```

Treat the result as a structural artifact check, not as proof that the application is correct.

If validation fails, use [docs/validation-troubleshooting.md](validation-troubleshooting.md).

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
