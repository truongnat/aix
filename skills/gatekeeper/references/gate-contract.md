# Gate Contract

Gatekeeper decisions are only valid when they cite the evidence that justifies the decision.

## Required Inputs

Gatekeeper decisions must reference:
- `VERIFY.md` status
- evidence or tool-run artifacts
- residual risk
- documented ship blockers
- any explicit gaps that remain open

## Allowed Decisions

- `allow`
- `block`
- `defer`

## Decision Rules

### allow

Use only when:
- verification evidence exists
- required gates passed or accepted gaps are explicit
- residual risk is named and acceptable

### block

Use when:
- verification evidence is missing or contradictory
- a required gate failed
- a ship blocker is unresolved
- the final status overstates what the evidence proves

### defer

Use when:
- the change is not ready for a final gate decision
- more evidence or a human decision is still required
- work should return to plan, run, or verify before ship

## Output Requirements

Every gate decision should state:
- decision: allow | block | defer
- evidence reviewed
- blocker or residual risk summary
- next command or next action when not allowed

## Non-Rule

Dispose does not apply to gatekeeper itself; it is a core read-only skill.
