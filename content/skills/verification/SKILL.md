---
name: verification
description: 'Skill: verification'
x-kind: process
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---
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

## Reasoning Procedure

1. Restate the claim that must be proven.
2. Identify the smallest check that can prove it.
3. Read the result completely before concluding.
4. Stop and report blocked if the evidence is missing or stale.

## Action Loop

- Thought: identify the proof obligation.
- Action: run the verification command or inspect the evidence.
- Observation: record the real result and exit code.
- Repeat until the claim is proven or blocked.

## Examples

### Example 1

Input: node bin/validate.js and npm test both ran fresh.

Output:
- Verification summary: prompt standard changes are validated.
- Evidence list: validator passed, tests passed, no contract regressions found.
- Residual gaps or risk: the worktree still contains unrelated dirty files.

### Example 2

Input: The required test command is unknown or was not run.

Output:
- Verification summary: blocked.
- Evidence list: none fresh.
- Residual gaps or risk: missing proof prevents completion.
## Output Contract

This skill must produce:

- a verification summary
- an evidence list
- explicit residual gaps or risk

## Blocking Conditions

Block or escalate when:

- required checks failed or were not run fresh
- evidence is partial, stale, or missing for the stated claim
- VERIFY.md would need to claim pass without proof

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
