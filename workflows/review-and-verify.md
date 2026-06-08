# Review and Verify Workflow

## Purpose

Review implementation and verify it before shipping.

## Decision Tree

- Is the implementation ready for review?
- If no: return to run and finish the scoped work first.
- If yes: does code review surface findings?
- If yes: route back to run or plan with explicit findings.
- If no: run verification and decide whether ship can proceed or must stay blocked.

## Skills Used

1. tool-discovery
2. code-review
3. verification
4. gatekeeper

## Steps

### Step 1 — Tool Discovery

Use skill: `tool-discovery`

Output:

- `.harness/TOOL_CONTEXT.md`

Hook:

- none required before discovery

### Step 2 — Code Review

Use skill: `code-review`

Output:

- `.harness/REVIEW.md` or session review artifact

Hook:

- optional `record-subagent-result.js` when using delegated reviewer worker

### Step 3 — Verification

Use skill: `verification`

Output:

- active session `VERIFY.md`
- tool-run artifacts under `artifacts/tool-runs/`

Hook:

- `record-tool-output.js` after each verification command

### Step 4 — Gate Decision

Use skill: `gatekeeper`

Output:

- ship-ready decision or blocked state

Hook:

- `guard-phase.js --command harness-ship` before any ship claim

## Stop Conditions

Stop if any skill returns:

- blocked
- failed
- requires_user_decision

## Artifact Checklist

- `TOOL_CONTEXT.md` exists when tool routing or environment affects the review.
- `REVIEW.md` records findings or explicit no-findings output.
- `VERIFY.md` records fresh evidence, not only review opinion.
- Gate output states allow, block, or defer with reasons.

## Dispose Rules

After workflow completion:

- archive session-only skills
- promote reusable skills only with explicit reason
- record disposal in `DISPOSAL.md`

## Related

- [compose-skills.md](compose-skills.md)
- [release-readiness.md](release-readiness.md)
