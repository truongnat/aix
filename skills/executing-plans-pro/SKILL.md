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