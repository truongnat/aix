# Incident Workflow

## When To Use

Use this for urgent failures, outages, security-sensitive breakages, or broken critical paths that require disciplined but compressed action.

## Command Sequence

`harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

The same loop applies, but planning and discussion may be shorter because urgency is high.

## Decision Tree

- Is the current issue actively impacting users or critical systems?
- If yes: confirm blast radius first, then choose the smallest safe mitigation.
- If the cause is unknown: avoid speculative high-risk fixes and favor containment.
- If mitigation restores service but not the root cause: ship with explicit gaps and follow-up work.

## Required Artifacts

- `.harness/GOAL.md`
- `.harness/STATE.md`
- `.harness/CONTEXT.md`
- `.harness/PLAN.md`
- `.harness/VERIFY.md`
- `.harness/REMEMBER.md`

## Recommended Skills

- `using-harness`
- `mapping-codebase`
- `discussing-goals`
- `writing-plans`
- `executing-plans`
- `verification`
- `remembering`

## Verification Expectations

- confirm the blast radius
- verify containment or restoration with fresh evidence
- separate mitigation from long-term fix if both cannot happen safely in one pass

## Failure Handling

- if the cause is unknown, avoid risky speculative fixes
- if restoration is partial, state that clearly in verification and ship notes
- if incident pressure tempts secret leakage into memory, stop and sanitize the artifact

## Artifact Checklist

- `GOAL.md` states impact, blast radius, and current urgency.
- `PLAN.md` distinguishes containment from long-term fix when both matter.
- `VERIFY.md` records mitigation or restoration evidence with exact current status.
- `REMEMBER.md` captures durable incident lessons without sensitive detail.

## Completion Criteria

The incident workflow is complete when the immediate issue is mitigated or fixed, the current status is verified honestly, and the durable lesson is captured without exposing sensitive data.
