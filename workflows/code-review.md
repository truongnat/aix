# Code Review Workflow

## When To Use

Use this when reviewing an implementation, plan, or set of changed artifacts before acceptance or merge.

## Command Sequence

`harness-start -> harness-verify`

Review work usually feeds into `.harness/REVIEW.md`, then returns to `harness-run` or proceeds to `harness-ship`.

## Decision Tree

- Is there enough goal, plan, and verify context to assess the change?
- If no: request the missing artifact and stop.
- If yes: do findings reveal implementation defects, verification gaps, or plan defects?
- If yes: route back to run or plan with concrete findings.
- If no: record explicit no-findings output with residual risk.

## Required Artifacts

- `.harness/GOAL.md`
- `.harness/PLAN.md`
- `.harness/VERIFY.md` if verification already exists
- `.harness/REVIEW.md`

## Recommended Skills

- `using-harness`
- `mapping-codebase`
- `code-review`
- `verification`

## Verification Expectations

- review findings reference concrete risks
- missing tests or missing evidence are recorded as findings
- if there are no findings, residual risk is still stated

## Failure Handling

- return to `harness-run` if findings require fixes
- return to `harness-plan` if findings expose a plan defect
- stop shipping if review identifies unverified risk

## Artifact Checklist

- `REVIEW.md` lists findings or an explicit no-findings result.
- Findings cite concrete evidence, not vibe-based discomfort.
- Missing verification is called out as a finding when relevant.
- Residual risk is stated even when there are no findings.

## Completion Criteria

The code review workflow is complete when findings or an explicit no-findings result are written clearly enough for the next action to be obvious.
