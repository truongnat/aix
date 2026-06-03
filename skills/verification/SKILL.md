# verification

## Purpose

Prove the current state of the work with fresh evidence before any completion or shipping claim.

## When To Use

- after implementation changes
- before handoff, merge, or completion claims
- after bug fixes, refactors, or risky content updates

## When Not To Use

- before any relevant work has been done
- when only discussing possible future approaches
- when the operator is unwilling to record blocked or partial evidence honestly

## Inputs

- goal and plan artifacts
- the work to verify
- the checks or review steps that can prove the claim

## Workflow

1. Identify the command, check, or review that proves the claim.
2. Run it fresh.
3. Read the result completely.
4. Record pass, fail, blocked, or pending status honestly.
5. Block shipping if the evidence is insufficient.

## Operating Principles

- Fresh evidence outranks confidence.
- Partial verification should be labeled as partial or blocked.
- Verification should map back to the stated goal.
- Unverified work is not complete.

## Output Contract

This skill must produce:

- a verification summary
- an evidence list
- explicit residual gaps or risk

## Common Failure Modes

- claiming success from stale command output
- recording only passing checks
- confusing “not run yet” with “passed”

## Checklist Before Done

- [ ] A proving check was identified
- [ ] The check was run fresh
- [ ] The result was read fully
- [ ] Any gaps were stated explicitly
- [ ] The final claim matches the evidence
