---
name: writing-plans-pro
description: |
  Production-grade detailed implementation planning: converting goals into step-by-step execution plans with task breakdown, dependency mapping, acceptance criteria, risk identification, and verification checkpoints — plus system model (goal → tasks → dependencies → execution), failure modes (vague tasks, missing dependencies, unrealistic estimates, incomplete acceptance criteria), decision trade-offs (detail vs speed, granularity vs overhead, flexibility vs specificity), and quality guardrails (verifiable tasks, explicit dependencies, realistic estimates).

  Use this skill when the user asks to create a detailed implementation plan, break down a feature into tasks, define acceptance criteria for tasks, or create an execution roadmap.

  Use **with** **`planning-pro`** for high-level planning and sequencing, **`business-analysis-pro`** for requirements validation, domain **`*-pro`** skills for technical task breakdown, and **`feedback-pro`** for plan review.

  Triggers: "write a plan", "implementation plan", "task breakdown", "detailed plan", "step-by-step", "execution plan", "task list", "acceptance criteria".

metadata:
  short-description: Writing plans — detailed implementation, task breakdown, acceptance criteria
  content-language: en
  domain: planning
  level: professional
---

# Writing detailed implementation plans (professional)

Skill text is **English**; answer in the user's preferred language when rules or the conversation specify it.

Use references such as [Software Project Planning](https://www.amazon.com/Software-Project-Management/dp/0321637722) and [Agile Estimating and Planning](https://www.amazon.com/Agile-Estimating-Planning-Software-Projects/dp/0131479215) for methodology; this skill encodes **detailed task breakdown**, **explicit dependencies**, **verifiable acceptance criteria**, and **execution readiness** — not generic task lists.

## Boundary

**`writing-plans-pro`** owns **detailed task breakdown**, **acceptance criteria definition**, **dependency mapping**, and **execution readiness**. **`planning-pro`** owns **high-level sequencing, milestone structure, and dependency modeling**. **`business-analysis-pro`** owns **requirements validation and acceptance criteria alignment**. Domain **`*-pro`** skills own **technical task breakdown within their stack**.

## Related skills (this repo)

| Skill | When to combine with `writing-plans-pro` |
|-------|------------------------------------------|
| **`planning-pro`** | High-level sequencing and milestone structure before detailed planning |
| **`business-analysis-pro`** | Requirements validation and acceptance criteria alignment |
| **Domain `*-pro` skills** | Technical task breakdown and feasibility assessment |
| **`feedback-pro`** | Plan review and quality validation |
| **`ci-cd-pro`** | Integration checkpoints and deployment task breakdown |

## When to use

- Converting a feature or goal into detailed implementation tasks.
- Breaking down complex work into verifiable, executable steps.
- Defining acceptance criteria for individual tasks.
- Creating execution plans for developers or teams.
- Preparing work for sprint planning or assignment.

- Trigger keywords: `write a plan`, `implementation plan`, `task breakdown`, `detailed plan`, `step-by-step`, `execution plan`, `task list`, `acceptance criteria`

## When not to use

- **High-level roadmap or milestone planning** — **`planning-pro`** first.
- **Requirements discovery** without implementation focus — **`business-analysis-pro`** first.
- **Technical feasibility assessment** without task breakdown — domain **`*-pro`** skills.
- **Strategic portfolio decisions** — **`strategic-consulting-pro`**.

## Required inputs

- **Goal or feature** to implement.
- **Requirements** or acceptance criteria for the feature.
- **Context**: team capacity, constraints, technical stack.
- **Planning horizon**: immediate vs future work.

## Expected output

Follow **Suggested response format** strictly — detailed task list with dependencies, acceptance criteria, and risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** goal, requirements, team context, constraints, and planning horizon. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.