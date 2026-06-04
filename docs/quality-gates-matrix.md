# Quality Gates Matrix

This matrix operationalizes the harness loop with explicit, phase-by-phase entry/completion/failure gates.

**See the canonical phase discipline rules:** [`phase-discipline.md`](./phase-discipline.md)

This document provides a detailed gate checklist for each phase. Use it during `harness-run` to verify you're ready to move forward.

## Map

| Gate | Details |
|---|---|
| Entry Criteria | A task exists and the affected area is not yet fully understood. |
| Required Evidence | Relevant `.harness/` artifacts were read and repository areas or boundaries were inspected. |
| Completion Criteria | The likely impact area, observed facts, and key unknowns are explicit enough to support discussion or planning. |
| Common Failure Modes | Guessing architecture, mapping too broadly, skipping active artifacts. |
| Stop / Escalate When | The codebase state conflicts with the recorded artifacts or the likely scope is much larger than expected. |

## Start

| Gate | Details |
|---|---|
| Entry Criteria | A session is beginning or resuming. |
| Required Evidence | `AGENTS.md` and the active goal, state, and plan artifacts were reviewed when present. |
| Completion Criteria | The current state is refreshed and the next harness command is explicit. |
| Common Failure Modes | Starting implementation from memory, assuming the last session ended cleanly, skipping stale state updates. |
| Stop / Escalate When | The recorded plan is invalid, the state is inconsistent, or no clear next command can be chosen. |

## Discuss

| Gate | Details |
|---|---|
| Entry Criteria | The goal, scope, or tradeoffs are still ambiguous. |
| Required Evidence | Constraints, assumptions, and alternatives are captured in discussion artifacts or session notes. |
| Completion Criteria | The goal, boundaries, and recommended approach are clear enough to plan without inventing requirements. |
| Common Failure Modes | Silent scope expansion, fake certainty, mixing assumptions with confirmed facts. |
| Stop / Escalate When | Material tradeoffs need human approval or requirements remain too unclear to plan safely. |

## Plan

| Gate | Details |
|---|---|
| Entry Criteria | The goal is understood well enough to break into tasks. |
| Required Evidence | Scope, affected areas, verification strategy, and risks are written into `.harness/PLAN.md`. |
| Completion Criteria | The plan is concrete, ordered, and explicit about verification, and implementation has not started. |
| Common Failure Modes | Vague tasks, no verification strategy, mixing planning with implementation. |
| Stop / Escalate When | The plan changes scope materially, requires risky operations, or still leaves major ambiguity. |

## Run

| Gate | Details |
|---|---|
| Entry Criteria | An approved plan exists. |
| Required Evidence | Work follows the plan, task or state artifacts are updated, and deviations are recorded. |
| Completion Criteria | The current planned step is implemented or explicitly paused with blockers documented. |
| Common Failure Modes | Scope drift, opportunistic cleanup, stale task tracking, unplanned destructive changes. |
| Stop / Escalate When | The work needs a materially different approach, a destructive action, or a broader scope than planned. |

## Verify

| Gate | Details |
|---|---|
| Entry Criteria | A change or result is ready to be checked. |
| Required Evidence | Fresh verification commands, manual checks, and any not-run items are recorded. |
| Completion Criteria | Pass, fail, or partial status is explicit and supported by evidence. |
| Common Failure Modes | Claiming success from confidence, hiding skipped checks, using stale verification. |
| Stop / Escalate When | Evidence is missing, contradictory, or partial in a way that affects shipping decisions. |

## Ship

| Gate | Details |
|---|---|
| Entry Criteria | Verification has been completed or its gaps are clearly documented. |
| Required Evidence | `.harness/SHIP.md` reflects what changed, what was verified, and what remains open. |
| Completion Criteria | The summary, follow-ups, and residual risk match reality and are ready for handoff. |
| Common Failure Modes | Overstating confidence, hiding residual risk, treating partial verification as a full pass. |
| Stop / Escalate When | Shipping requires accepting known risk or deferred verification that has not been approved. |

## Remember

| Gate | Details |
|---|---|
| Entry Criteria | Verified work produced a durable lesson, decision, or constraint. |
| Required Evidence | The remembered note is concise, reusable, and checked for sensitive data. |
| Completion Criteria | Future sessions can reuse the lesson without replaying the whole task. |
| Common Failure Modes | Saving transient notes, storing secrets, recording narrative noise instead of durable guidance. |
| Stop / Escalate When | The lesson cannot be written safely without exposing sensitive or private information. |

## Universal Completion Rules

- Do not claim completion without evidence.
- Document what was not run.
- Do not hide uncertainty.
- Do not persist secrets.
- Prefer the smallest sufficient change.
- Update memory only with durable, sanitized lessons.
