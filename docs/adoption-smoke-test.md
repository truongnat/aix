# Adoption Smoke Test

## Purpose

Use this smoke test to verify that the harness can be copied into another local repository and used in a minimal markdown-only workflow without requiring any real runtime integration.

## Prerequisites

- a local clone of `ai-engineering-harness`
- Node.js available to run `bin/aih.js install` and `bin/validate.js`
- a safe local directory where a temporary smoke-test repository can be created

## Test Repository Setup

Create a temporary local repository directory next to the harness repository:

```bash
mkdir ../harness-smoke-test
```

Optional:

```bash
cd ../harness-smoke-test
git init
cd ../ai-engineering-harness
```

## Dry Run Install

Run the installer in dry-run mode first:

```bash
node bin/aih.js install --target ../harness-smoke-test --dry-run
```

Review the output and confirm the expected files would be copied.

## Real Install

If the dry run looks correct, perform the real copy:

```bash
node bin/aih.js install --target ../harness-smoke-test
```

## Verify Copied Surface

Inspect the copied files locally:

```bash
find ../harness-smoke-test -maxdepth 2 -type f
```

At minimum, confirm the presence of:

- `AGENTS.md`
- `commands/`
- `skills/`
- `workflows/`
- `patterns/`
- `templates/`
- the selected `docs/`

## Create Minimal `.harness/` Artifacts

Inside the smoke-test repository, create a small `.harness/` directory with a minimal goal and plan:

```bash
mkdir ../harness-smoke-test/.harness
cp templates/GOAL.md ../harness-smoke-test/.harness/GOAL.md
cp templates/PLAN.md ../harness-smoke-test/.harness/PLAN.md
cp templates/VERIFY.md ../harness-smoke-test/.harness/VERIFY.md
```

Then edit the copied templates with a harmless fake goal such as:

- Goal: add a health check endpoint
- Scope: planning only
- Verification: no real checks yet

## Run A Simulated Command Loop

Use prompts like these with your preferred local agent tool:

- “Read `AGENTS.md` and run `harness-start` for this empty smoke test repo.”
- “Use `harness-plan` for a fake goal: add a health check endpoint. Do not implement.”
- “Use `harness-verify` to record that no real checks were run because this is a smoke test.”

The point is not to build anything. The point is to confirm that the copied harness surface is understandable and usable in a local repository.

## Validate The Harness Repository

Run the repository validator from the harness repository:

```bash
node bin/validate.js
```

This confirms the source harness still satisfies its required documentation and structure checks.

## Optional Target Validation Smoke Checks

If the temporary smoke-test repository also contains adopted `.harness/` profile artifacts, run:

```bash
node bin/validate.js --target ../harness-smoke-test --profile-only
```

Use this to confirm the smoke-test repository passes structural profile validation.

If the smoke-test repository also contains `.harness/goals/<goal-id>/` artifacts, run:

```bash
node bin/validate.js --target ../harness-smoke-test --goal smoke-goal
```

Use this to confirm the smoke-test repository passes structural goal validation for that goal artifact set.

## Cleanup

Remove the temporary local repository when finished:

```bash
rm -rf ../harness-smoke-test
```

If you initialized git in the smoke-test directory, deleting the directory is enough.

## Expected Result

- the dry run shows the correct copy surface
- the real install copies the expected files
- a minimal `.harness/` directory can be created locally
- the simulated command loop is understandable without adding runtime code
- `node bin/validate.js` passes in the source harness repository
- optional target profile validation passes when profile artifacts are created
- optional target goal validation passes when goal artifacts are created

## Common Failures

- installer output is not reviewed before a real copy
- the smoke test is run inside a real or sensitive repository first
- `.harness/` artifacts are not created, so the simulated loop has no state to read
- the user expects implementation or runtime integration rather than a documentation-only smoke test

## Safety Notes

- do not run this against a sensitive company repo first
- use `--dry-run` before real install
- do not store secrets in `.harness/`
- inspect copied files before committing
