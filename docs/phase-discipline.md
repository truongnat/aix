# Phase Discipline

Phase discipline ensures that work progresses through a structured workflow: Session Start → Discuss → Plan → Run → Verify → Ship → Remember.
Each phase has specific requirements that must be met before proceeding to the next.

## Phase Gates

### Plan Approval Required

harness-run requires an approved plan before implementation can begin

**When enforced:** command equals harness-run AND state not_exists current_plan:approved
**Action:** block - Plan must be approved before implementation
**Next step:** Run `harness-plan`

### Verification Required Before Ship

harness-ship requires verified VERIFY.md with explicit status and evidence

**When enforced:** command equals harness-ship AND state not_exists verify:approved
**Action:** block - Verification must be completed and approved before shipping
**Next step:** Run `harness-verify`

### Implementation Evidence Required

harness-verify requires implementation evidence (completed tasks or tool runs)

**When enforced:** command equals harness-verify AND state not_exists implementation_evidence
**Action:** block - No implementation evidence found for verification
**Next step:** Run `harness-run`

## Workflow

1. **Session Start**: Establish session state and active goal
2. **Discuss Phase**: Clarify requirements and scope
3. **Plan Phase**: Create and approve a plan in PLAN.md
4. **Run Phase**: Implement according to the approved plan
5. **Verify Phase**: Collect evidence and run verification checks
6. **Ship Phase**: Ship only when verification passes
7. **Remember Phase**: Capture lessons and update memory

## Default Phase Chaining

Some adjacent phases chain by default so the agent does not stop between closely related steps.

### Ship → Remember (default on)

When `harness-ship` completes with status `shipped` (verification passed, gaps documented or none):

1. Continue in the same turn with the `harness-remember` workflow.
2. Promote only durable, safe lessons to typed memory artifacts.
3. If nothing is worth remembering, write a short session `REMEMBER.md` note and stop.

Skip auto-remember when:

- Ship status is `shipped-with-gaps`, `failed`, or blocked pending human acceptance.
- The user explicitly requests ship-only handoff.
- No durable lesson exists and the outcome is purely transient.

Hard gates (plan approval, verification before ship) stay separate. Chaining applies only after the ship decision is allowed and complete.
