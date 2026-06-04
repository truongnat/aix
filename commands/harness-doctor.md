# harness-doctor

## Purpose

Check harness readiness for this repository and report concrete remediation.
This includes install health and workflow-validity signals for the local `.harness/` state.

## Minimum Read Set

- `.ai-harness/manifest.json` if present
- `.ai-harness/activation.md` if present
- `.harness/STATE.md` if present

## Preconditions

- None. This command may be used before or after install.

## When To Use

- after install
- when command routing fails or agents load the wrong skills
- before a critical delivery

## Step-By-Step Workflow

1. Verify whether `.ai-harness/` exists.
2. Verify whether `.ai-harness/runtime-commands/` exists and files reference `activation.md`.
3. Verify whether `.harness/` exists or warn that project state is missing.
4. Verify provider command entrypoints listed in `manifest.json` exist on disk.
5. Check workflow-validity signals such as plan approval, verification evidence, and typed memory presence when `.harness/` exists.
6. Report PASS, WARN, or FAIL per check with remediation.

## Required Outputs

- doctor-style checklist with explicit PASS, WARN, or FAIL results
- remediation guidance such as re-running install or build
- workflow validity signals for plan approval, verification evidence, and typed memory readiness when state artifacts exist

## Redirect Behavior

- If the harness is not installed correctly, redirect to install or update.
- If project state is missing but the install is healthy, redirect to `harness-start`.
- If `PLAN.md` is still draft or blocked, redirect to `harness-discuss` or `harness-plan` before `harness-run`.
- If `VERIFY.md` is missing, pending, or weak, redirect to `harness-verify` before `harness-ship`.

## Failure Conditions

- Do not use sibling-repo or global harness files as evidence for this repo.
- Do not claim readiness if local command entrypoints or activation references are broken.
- Do not treat placeholder `VERIFY.md` tables or empty evidence bullets as real verification evidence.
- Do not silently ignore missing typed memory artifacts when the local workflow expects them.

## Completion Gate

The command is complete when the operator can see whether the local harness surface is healthy, whether the local workflow state is actionable, and what to fix next if it is not.

## Notes

`harness-doctor` diagnoses local readiness. It should not silently repair state.
