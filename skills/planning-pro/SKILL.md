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

### Operating principles

1. **Think Before Coding** — Confirm outcome, scope boundary, constraints, and planning horizon before decomposing work. Ask when “done” or ownership is unclear.
2. **Simplicity First** — Prefer the smallest executable plan that creates forward motion. Do not invent phases, committees, or governance layers that the request did not need.
3. **Surgical Changes** — Change only the plan slices, dependencies, or milestones relevant to the request. Do not reframe the whole roadmap without cause.
4. **Goal-Driven Execution** — Done = the plan has verifiable milestones, explicit assumptions, and a clear way to detect if execution is off track.
5. **Outcome before activity** — Milestones should represent evidence of progress, not just meetings or generic tasks.
6. **Dependency truth beats optimism** — Hidden blockers, external approvals, and environment constraints belong in the plan even when inconvenient.
7. **Uncertainty should change detail level** — Use rolling-wave planning when facts are unstable instead of pretending precision exists.
8. **Plans must adapt** — A plan is a control loop, not a frozen artifact; reprioritization triggers should be stated up front.

## Default recommendations by scenario

- **Ambiguous project** — Clarify scope and acceptance before estimating dates.
- **Complex delivery** — Map dependencies and critical path before expanding task detail.
- **High uncertainty** — Use phased checkpoints and spikes rather than detailed long-range commitments.
- **Recovery plan** — Focus first on blockers and sequencing fixes before polish or parallel expansion.

## Decision trees

Summary: choose plan depth and sequencing based on certainty, dependency density, and external constraints rather than producing one generic roadmap shape.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: milestone theater, optimistic estimates without dependencies, oversized phase plans under uncertainty, and task lists that never tie back to outcomes.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Plan system model and feedback loops (summary)

How goals, work breakdown, checkpoints, and re-planning should connect so plans remain executable instead of decorative.

Details: [references/plan-system-model-and-feedback-loops.md](references/plan-system-model-and-feedback-loops.md)

### Scope and decomposition (summary)

How to carve scope into increments that are small enough to execute and meaningful enough to evaluate.

Details: [references/scope-and-decomposition.md](references/scope-and-decomposition.md)

### Sequencing and dependencies (summary)

How to order work around prerequisites, external owners, and critical path constraints.

Details: [references/sequencing-and-dependencies.md](references/sequencing-and-dependencies.md)

### Estimation and risk controls (summary)

How to express uncertainty honestly, size work in ranges, and add validation checkpoints where optimism would otherwise dominate.

Details: [references/estimation-and-risk-controls.md](references/estimation-and-risk-controls.md)

### Failure modes and mitigation (summary)

How plans fail through hidden dependencies, stale assumptions, and fake milestones, plus how to make those failures visible early.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes for planning references, terminology, or framework-specific execution contexts when they affect recommended structure.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Objective, scope boundary, constraints, stakeholders, and planning horizon.
2. **Planning model** — Explain the decomposition, dependency shape, and why this level of detail is appropriate.
3. **Plan** — Phases, milestones, owners/dependencies, and verification points.
4. **Risks and controls** — Key assumptions, blockers, and re-planning triggers.
5. **Residual risks** — What remains uncertain or outside current scope.

## Resources in this skill

| Topic | File |
|-------|------|
| Plan system model and feedback loops | [references/plan-system-model-and-feedback-loops.md](references/plan-system-model-and-feedback-loops.md) |
| Scope and decomposition | [references/scope-and-decomposition.md](references/scope-and-decomposition.md) |
| Sequencing and dependencies | [references/sequencing-and-dependencies.md](references/sequencing-and-dependencies.md) |
| Estimation and risk controls | [references/estimation-and-risk-controls.md](references/estimation-and-risk-controls.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Break this platform rewrite into phases we can actually ship."
- Start by naming the outcome, boundaries, and irreversible dependencies before listing tasks.
- Use a phase plan with checkpoints tied to user-visible or operational evidence.
- **Verify:** Each phase has a clear exit criterion and no hidden prerequisite is left unstated.

**Input (tricky):** "Leadership wants a quarter-long plan but requirements are still moving weekly."
- Use rolling-wave detail: near-term milestones precise, later phases intentionally coarse.
- Surface uncertainty explicitly instead of fabricating confidence.
- **Verify:** The plan includes re-planning triggers and assumptions that can be revisited.

**Input (cross-skill):** "Plan a feature that needs app changes, API work, and zero-downtime rollout."
- Pair domain skills for implementation depth and **`deployment-pro`** for rollout ordering.
- Sequence compatibility work before the cutover milestone instead of treating deploy as an afterthought.
- **Verify:** Cross-team dependencies and release checkpoints are visible in the plan.

## Checklist before calling the skill done

- [ ] Objective, scope boundary, constraints, and planning horizon confirmed first (Think Before Coding)
- [ ] Minimum executable plan chosen; no unnecessary process layers added (Simplicity First)
- [ ] Only the relevant plan slices or milestones were changed (Surgical Changes)
- [ ] Success criteria, checkpoints, and re-planning triggers are explicit (Goal-Driven Execution)
- [ ] Milestones describe outcomes or evidence, not just activity
- [ ] Dependencies and external owners are surfaced honestly
- [ ] Estimate uncertainty is represented appropriately for the current facts
- [ ] Residual unknowns and off-scope items are documented clearly
