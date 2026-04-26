---
name: executing-plans-pro
description: |
  Production-grade plan execution: batch execution with checkpoints, dependency-aware task execution, progress tracking, adaptive replanning, and completion verification — plus system model (plan → execute → checkpoint → adapt), failure modes (ignoring dependencies, skipping checkpoints, rigid adherence to outdated plans), decision trade-offs (speed vs quality, adherence vs adaptation, batch vs incremental), and quality guardrails (checkpoint gates, dependency respect, completion verification).

  Use this skill when the user asks to execute a detailed plan, run tasks in sequence, manage plan execution with checkpoints, or adapt execution based on progress.

  Use **with** **`writing-plans-pro`** for plan creation, **`planning-pro`** for high-level coordination, domain **`*-pro`** skills for technical execution, and **`feedback-pro`** for execution review.

  Triggers: "execute plan", "run tasks", "implement plan", "batch execution", "checkpoint", "track progress", "adapt plan".

metadata:
  short-description: Executing plans — batch execution, checkpoints, adaptive replanning
  content-language: en
  domain: execution
  level: professional
---

# Executing detailed plans (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use references such as [Making Things Happen](https://www.amazon.com/Making-Things-Happen-Project-Management/dp/0201633857) and [Project Execution](https://www.pmi.org/) for methodology; this skill encodes **checkpoint discipline**, **dependency awareness**, **adaptive execution**, and **completion verification** — not blind plan following.

## Boundary

**`executing-plans-pro`** owns **batch task execution**, **checkpoint enforcement**, **dependency-aware sequencing**, and **adaptive replanning**. **`writing-plans-pro`** owns **detailed plan creation**. **`planning-pro`** owns **high-level coordination and milestone tracking**. Domain **`*-pro`** skills own **technical execution within their stack**.

## Related skills (this repo)

| Skill | When to combine with `executing-plans-pro` |
|-------|-------------------------------------------|
| **`writing-plans-pro`** | Plan creation before execution |
| **`planning-pro`** | High-level coordination and milestone tracking |
| **Domain `*-pro` skills** | Technical execution of specific tasks |
| **`feedback-pro`** | Execution review and quality validation |
| **`git-operations-pro`** | Version control during execution |

## When to use

- Executing a detailed implementation plan with multiple tasks.
- Running tasks in sequence with dependency awareness.
- Managing execution with checkpoints and progress tracking.
- Adapting execution based on progress or blockers.
- Verifying completion of planned work.

- Trigger keywords: `execute plan`, `run tasks`, `implement plan`, `batch execution`, `checkpoint`, `track progress`, `adapt plan`

## When not to use

- **Creating a plan** — **`writing-plans-pro`** first.
- **Single task execution** without coordination — domain skill.
- **High-level milestone tracking** — **`planning-pro`**.
- **Technical implementation** of specific task — domain **`*-pro`** skill.

## Required inputs

- **Detailed plan** with tasks, dependencies, and acceptance criteria.
- **Execution context**: environment, resources, constraints.
- **Checkpoint strategy**: where to pause and verify.
- **Adaptation rules**: when and how to replan.

## Expected output

Follow **Suggested response format** strictly — execution progress, checkpoint results, adaptation decisions, completion status.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** plan, execution context, checkpoint strategy, and adaptation rules. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm the current plan, dependencies, checkpoints, and adaptation rules before executing. Ask when the next blocking step is unclear.
2. **Simplicity First** — Execute the smallest meaningful batch that preserves momentum and verification. Do not over-batch just to look efficient.
3. **Surgical Changes** — Work only on the current execution slice and its direct blockers. Do not silently rewrite the larger plan mid-flight.
4. **Goal-Driven Execution** — Done = the batch outcome is verified, checkpoint evidence is recorded, and the next step is explicit.
5. **Dependencies are gating facts** — Respect prerequisite order even when a downstream task looks easy.
6. **Checkpoints are not optional** — Pause at defined verification points instead of assuming progress implies correctness.
7. **Adapt with evidence** — Replan only when blockers, results, or constraints actually change the path.
8. **Completion means verified state** — “Task done” requires acceptance evidence, not just code or note output.

## Default recommendations by scenario

- **Well-defined batch** — Execute sequentially with one checkpoint at the end of the batch.
- **Risky batch** — Insert intermediate checkpoints before irreversible or high-cost steps.
- **Blocked execution** — Surface blocker, adjust sequence, and resume from the next valid dependency edge.
- **Unclear plan detail** — Hand back to **`writing-plans-pro`** or **`planning-pro`** instead of guessing execution order.

## Decision trees

Summary: decide batch size, checkpoint density, and replanning threshold based on dependency risk and verification cost.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: skipping checkpoints, executing downstream tasks before prerequisites, and following an outdated plan after evidence changed.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Execution cycle (summary)

How plans should move through execute, checkpoint, adapt, and close so progress stays observable and correct.

Details: [references/execution-cycle.md](references/execution-cycle.md)

### Dependency-aware execution (summary)

How to respect prerequisite order and avoid false parallelism that only creates rework.

Details: [references/dependency-aware-execution.md](references/dependency-aware-execution.md)

### Checkpoint discipline (summary)

Where to pause, what to verify, and how to avoid checkpoint theater.

Details: [references/checkpoint-discipline.md](references/checkpoint-discipline.md)

### Completion verification (summary)

How to prove a batch is actually finished rather than merely attempted.

Details: [references/completion-verification.md](references/completion-verification.md)

## Suggested response format

1. **Context** — Current plan slice, dependencies, environment, and checkpoint strategy.
2. **Execution status** — What batch is being executed now and why this order is correct.
3. **Actions** — Specific tasks completed or next to run.
4. **Checkpoint results** — What was verified, what passed, and what failed or blocked.
5. **Adaptation** — Any replanning decision and its trigger.
6. **Residual risks** — Remaining blockers, unknowns, or follow-up dependencies.

## Resources in this skill

| Topic | File |
|-------|------|
| Execution cycle | [references/execution-cycle.md](references/execution-cycle.md) |
| Dependency-aware execution | [references/dependency-aware-execution.md](references/dependency-aware-execution.md) |
| Checkpoint discipline | [references/checkpoint-discipline.md](references/checkpoint-discipline.md) |
| Completion verification | [references/completion-verification.md](references/completion-verification.md) |
| Adaptive replanning | [references/adaptive-replanning.md](references/adaptive-replanning.md) |
| Progress tracking | [references/progress-tracking.md](references/progress-tracking.md) |
| Execution documentation | [references/execution-documentation.md](references/execution-documentation.md) |
| Decision framework | [references/decision-framework.md](references/decision-framework.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Failure modes | [references/failure-modes.md](references/failure-modes.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

**Input:** "Execute phase 2 of this migration plan."
- Confirm phase 1 outputs and dependencies before starting phase 2 tasks.
- Run the smallest coherent batch, then stop at the defined checkpoint.
- **Verify:** Each phase-2 acceptance criterion is checked before moving to phase 3.

**Input (tricky):** "Half the tasks are done but a new blocker changes the path."
- Do not keep executing stale downstream tasks.
- Record the blocker, re-sequence the remaining work, and restart from the next valid dependency.
- **Verify:** Updated execution order removes the blocked edge and preserves already verified work.

**Input (cross-skill):** "Execute this rollout plan with app, DB, and CDN steps."
- Pair domain and deployment skills for technical truth, while **`executing-plans-pro`** owns batch order and checkpoints.
- Keep rollback or hold points explicit between each subsystem boundary.
- **Verify:** Each subsystem checkpoint passes before the next one starts.

## Checklist before calling the skill done

- [ ] Plan slice, dependencies, and checkpoints confirmed before execution (Think Before Coding)
- [ ] Minimum meaningful batch selected; no oversized execution chunking (Simplicity First)
- [ ] Only the current execution slice and its direct blockers were touched (Surgical Changes)
- [ ] Success criteria and checkpoint evidence are explicit and validated (Goal-Driven Execution)
- [ ] Dependency order was respected
- [ ] Replanning decisions were evidence-based rather than ad hoc
- [ ] Completion status is tied to verified outcomes, not just attempted work
- [ ] Remaining blockers or next-step handoffs are documented clearly
