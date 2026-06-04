# harness-status

## Purpose

Summarize harness install and project state for this repository only.

## Minimum Read Set

- `.ai-harness/manifest.json` if present
- `.ai-harness/activation.md` if present
- `.harness/HARNESS.md` if present
- `.harness/STATE.md` if present

## Preconditions

- None. This command may be used before install to confirm missing state.

## When To Use

- after install or update
- when unsure whether `.ai-harness/` and `.harness/` are present
- before starting a new goal

## Step-By-Step Workflow

1. Confirm whether `.ai-harness/` exists and lists expected command metadata.
2. Confirm whether `.harness/` exists or report that project state is not initialized.
3. List detected provider entrypoints for this repo.
4. Summarize active goal status from `.harness/goals/` if any.
5. Recommend the next command based on what is missing.

## Required Outputs

- short status report: cache yes or no, harness state yes or no, detected provider entrypoints, recommended next command

## Redirect Behavior

- If the harness is not installed, redirect to install.
- If the harness is installed but project state is missing, redirect to `harness-start`.

## Failure Conditions

- Do not inspect other repositories or global skill stores.
- Do not report the harness as ready if `.ai-harness/` or required project state is missing.

## Completion Gate

The command is complete when the operator can tell whether the repository is installed, initialized, and ready for the next phase.

## Notes

`harness-status` is a local snapshot, not a repair command.
