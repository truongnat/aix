# Release Readiness Workflow

## Purpose

Decide whether verified work is ready to ship or must remain blocked.

## Decision Tree

- Does `VERIFY.md` exist with explicit status and fresh evidence?
- If no: stop and return to verification.
- If yes: are there unresolved blockers or contradictory results?
- If yes: block or defer ship.
- If no: gate the release with explicit residual risk.

## Skills Used

1. verification
2. gatekeeper

## Steps

### Step 1 — Confirm Verification

Use skill: `verification`

Require:

- active session `VERIFY.md`
- explicit status
- evidence or tool-run artifacts

Hook:

- `guard-phase.js --command harness-ship`

### Step 2 — Gate Decision

Use skill: `gatekeeper`

Output:

- allow ship, block ship, or defer

## Stop Conditions

Stop if VERIFY evidence is missing, stale, or contradictory.

## Artifact Checklist

- `VERIFY.md` has explicit status, evidence, and known gaps.
- Gate decision cites what evidence was reviewed.
- Ship blockers are either resolved or explicitly named.
- The final release-ready claim matches the evidence exactly.

## Dispose Rules

Archive session-only skills after handoff. Do not delete disposed skills.

## Related

- [review-and-verify.md](review-and-verify.md)
