---
id: gatekeeper
name: Gatekeeper Skill
status: active
scope: core
version: 1
can_block: true
can_write: false
inputs:
  - VERIFY.md
  - REVIEW.md
  - ship blockers
outputs:
  - gate decision
  - BLOCKED.md or ship-ready note
tools:
  - read-only inspection
---

# gatekeeper

## Purpose

Decide whether the next command is allowed based on available evidence.

## When To Use

- before `harness-ship`
- after verification and optional review
- when a explicit allow/block decision is required

## When Not To Use

- before verification exists
- when the operator has not requested a ship or gate decision

## Inputs

- active session `VERIFY.md`
- optional review artifact
- documented ship blockers

## Procedure

1. Read verification status and evidence.
2. Read review findings if present.
3. Decide allow, block, or defer.
4. Return a structured gate decision for the main agent.

## Reasoning Procedure

1. Restate the gate decision that must be made.
2. Check the current verification and review evidence.
3. Derive the next allowed command from the evidence.
4. Stop and report blocked if the gate cannot be decided safely.

## Action Loop

- Thought: identify the evidence needed for the gate decision.
- Action: inspect the relevant artifacts or hook output.
- Observation: record the real allow/block/defer signal.
- Repeat until the decision is clear.

## Examples

### Example 1

Input: VERIFY.md is fresh and review findings are resolved.

Output:
- Decision: allow.
- Reason: fresh evidence supports ship readiness.
- Next command: harness-ship.

### Example 2

Input: Verification is pending or stale.

Output:
- Decision: block.
- Reason: missing evidence or stale verification.
- Next command: harness-verify.
## Output Contract

Return allow/block/defer with explicit reason and next command.

## Blocking Conditions

Block when verification is pending, blocked, stale, or lacks evidence.

## Common Failure Modes

- approving ship from confidence instead of artifacts
- ignoring documented ship blockers

## References

- `references/gate-contract.md`
- `prompt.md`
