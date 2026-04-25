---
name: planning-pro
description: |
  Production-grade planning: turning goals into executable plans with scope framing, decomposition, dependency mapping, sequencing, estimation ranges, risk controls, delivery checkpoints — plus system model (goals → work graph → execution feedback → re-plan), failure modes (planning fallacy, hidden dependencies, scope creep, milestone theater, stale plans), decision trade-offs (outcome-first vs activity-first, MVP vs foundation-first, predictive vs adaptive, spikes), and quality guardrails (verifiable milestones, honest estimates, no fabricated constraints).

  Use this skill when the user asks to create an implementation plan, break a complex project into phases, define milestones, estimate effort, review whether a plan is realistic, or design execution controls and dependency order.

  Combine with **`business-analysis-pro`** before fixing scope, **`deployment-pro`** and **`ci-cd-pro`** for release integration, **`testing-pro`** for quality gates, **`feedback-pro`** when reviews drive reprioritization, **`strategic-consulting-pro`** for portfolio-level sequencing, and domain **`*-pro`** skills for technical depth per phase.

  Triggers: "planning", "plan", "roadmap", "milestone", "phase breakdown", "execution plan", "timeline", "dependency", "effort estimate", "delivery plan", "implementation plan", "critical path", "rolling wave", "spike".

metadata:
  short-description: Planning — scope graph, sequencing, estimation, failure modes, guardrails
  content-language: en
  domain: delivery-planning
  level: professional
---

# Planning and execution (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use references such as [PMI PMBOK](https://www.pmi.org/pmbok-guide-standards/foundational/pmbok) and [Atlassian agile planning](https://www.atlassian.com/agile/project-management/project-planning) for terminology; this skill encodes **goal-backward planning**, **dependency-aware sequencing**, **risk-first controls**, and **explicit feedback loops** — not organizational PM methodology replacement.

## Boundary

**`planning-pro`** owns **executable sequencing**, **milestone structure**, **dependency and risk framing**, and **delivery checkpoints**. **`business-analysis-pro`** owns **requirements discovery and acceptance criteria**. **`deployment-pro`** owns **release mechanics and rollout policy**. Domain **`*-pro`** skills own **implementation choices** inside phases.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`business-analysis-pro`** | Scope, acceptance criteria, traceability before dates harden |
| **`strategic-consulting-pro`** | Portfolio prioritization and initiative sequencing |
| **`deployment-pro`** | Cutover windows, rollback, rollout checkpoints |
| **`ci-cd-pro`** | Integration cadence and pipeline-sensitive ordering |
| **`testing-pro`** | QA gates and environments tied to milestones |
| **`feedback-pro`** | Review-driven reprioritization |
| **`security-pro`** | Compliance gates affecting order of work |
| Domain **`*-pro`** | Technical tasks and spikes per phase |

## When to use

- Breaking large goals into phases, milestones, and deliverables.
- Building realistic execution plans with dependencies and constraints.
- Prioritizing MVP vs later phases under deadline pressure.
- Estimating effort ranges and surfacing critical path risks.
- Reviewing plans for sequencing errors, hidden dependencies, or governance gaps.
- Designing **rolling-wave** updates when uncertainty is high.

## When not to use

- **Pure requirements elicitation** without scheduling — **`business-analysis-pro`** first.
- **Executive strategy** without execution breakdown — **`strategic-consulting-pro`** may lead.
- **Technical deep dive** on one stack — route to domain **`*-pro`** skills.
- **Incident response / firefighting runbooks** — operational runbooks, not portfolio planning.

## Required inputs

- **Goal or outcome** (what “done” means at a high level).
- **Constraints** when known: deadline, budget, team capacity, risk tolerance.
- **Stakeholders / dependencies** affecting external deliverables.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** objective, scope boundaries, constraints, success criteria, and planning horizon (detail vs rolling wave). → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.