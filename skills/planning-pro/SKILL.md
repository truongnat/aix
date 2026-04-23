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

1. Confirm objective, scope boundaries, constraints, success criteria, and planning horizon (detail vs rolling wave).
2. Apply summaries below; open `references/` for depth; anchor on **`plan-system-model-and-feedback-loops.md`** when discussing updates to the plan.
3. Respond with **Suggested response format**; include **failure modes** when production delivery is at stake.

### Operating principles

1. **Plan backward from outcomes** — Define done state first, then derive tasks — **`scope-and-decomposition.md`**.
2. **Decompose to verifiable units** — Clear output and acceptance signal per milestone — **`quality-validation-and-guardrails.md`**.
3. **Model dependencies explicitly** — Hidden dependencies kill schedules — **`sequencing-and-dependencies.md`**.
4. **Use ranges, not fake precision** — Assumptions and uncertainty explicit — **`estimation-and-risk-controls.md`**.
5. **Burn down risk early** — Spikes and integration slices before fragile big-bang — **`failure-modes-detection-mitigation.md`**.
6. **Control checkpoints** — Gates that prevent compounding errors — **`plan-system-model-and-feedback-loops.md`**.

### Scope and decomposition (summary)

Objectives → work packages → milestones → acceptance criteria at consistent granularity — **`scope-and-decomposition.md`**.

Details: [references/scope-and-decomposition.md](references/scope-and-decomposition.md)

### Sequencing and dependency management (summary)

Phase order from dependency graph, critical path, parallelization — **`sequencing-and-dependencies.md`**.

Details: [references/sequencing-and-dependencies.md](references/sequencing-and-dependencies.md)

### Estimation and risk controls (summary)

Ranges, assumptions, risk register, mitigations, decision gates — **`estimation-and-risk-controls.md`**.

Details: [references/estimation-and-risk-controls.md](references/estimation-and-risk-controls.md)

### Plan system model and feedback loops (summary)

Goals → decomposition → execution signals → re-plan triggers — **`plan-system-model-and-feedback-loops.md`**.

Details: [references/plan-system-model-and-feedback-loops.md](references/plan-system-model-and-feedback-loops.md)

### Tips and tricks (summary)

Templates for milestones, assumptions, progress signals — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Scope churn, cross-team delays, legacy unknowns, resource volatility, rolling wave — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Outcome-first vs activity-first, MVP vs foundation, adaptive vs predictive — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Fake precision, big-bang integration, planning without DoD — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`business-analysis-pro`**, **`deployment-pro`**, **`ci-cd-pro`**, **`testing-pro`**, **`feedback-pro`**, **`strategic-consulting-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Tooling exports, estimation units, calendar basis — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Goal, horizon (single release vs multi-phase), known deadline/capacity, stakeholder complexity.
2. **Problem / goal** — What must be true when finished; constraints and non-goals.
3. **System design** — Planning loop: milestones ↔ execution feedback — **`plan-system-model-and-feedback-loops.md`**.
4. **Decision reasoning** — MVP vs full scope; spike vs implement; rolling wave vs detailed far future — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Phased table, dependency notes, milestone checklist, or estimation matrix — **`quality-validation-and-guardrails.md`** (no fabricated dates).
6. **Trade-offs** — Scope vs date vs quality vs cost; sequencing alternatives.
7. **Failure modes** — Critical path fragility, scope creep, integration risk — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Unknowns needing spikes; escalation to **`business-analysis-pro`** / **`deployment-pro`** / domain skills.

## Resources in this skill

| Topic | File |
|-------|------|
| **Plan system model & feedback loops** | [references/plan-system-model-and-feedback-loops.md](references/plan-system-model-and-feedback-loops.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Scope and decomposition | [references/scope-and-decomposition.md](references/scope-and-decomposition.md) |
| Sequencing and dependencies | [references/sequencing-and-dependencies.md](references/sequencing-and-dependencies.md) |
| Estimation and risk controls | [references/estimation-and-risk-controls.md](references/estimation-and-risk-controls.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Migrate monolith auth to a separate service in about eight weeks.  
**Expected output:** Full **Suggested response format** — phased plan, dependencies, milestones, ranges, checkpoints, rollback story — **`sequencing-and-dependencies.md`**, **`deployment-pro`** handoff.

### 2 — Tricky (edge case)

**Input:** Scope changes weekly; stakeholders add “small” asks that break sequencing.  
**Expected output:** Change log + re-estimate; per-milestone freeze — **`edge-cases.md`**; governance in **failure modes** — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** Product scope plus infra window for cutover.  
**Expected output:** **`planning-pro`** phases — **`business-analysis-pro`** for acceptance criteria — **`deployment-pro`** for cutover — **`ci-cd-pro`** if pipeline gates matter.

## Checklist before calling the skill done

### Clarity and scope

- [ ] Objective, scope boundaries, and success criteria are explicit — **`quality-validation-and-guardrails.md`**.
- [ ] Non-goals or deferred scope called out when time-boxed — **`scope-and-decomposition.md`**.

### Structure and risk

- [ ] Dependencies and critical path are visible — **`sequencing-and-dependencies.md`**.
- [ ] Estimates are ranges or bands with assumptions — **`estimation-and-risk-controls.md`**.
- [ ] Milestones have verifiable outputs and review gates — **`plan-system-model-and-feedback-loops.md`**.

### Governance

- [ ] Main risks, mitigations, and fallback triggers documented — **`failure-modes-detection-mitigation.md`**.
- [ ] Re-plan triggers stated (scope threshold, slip buffer, new blocker) — **`edge-cases.md`**.
- [ ] Cross-skill owners named (**`deployment-pro`**, **`testing-pro`**, domain **`*-pro`**) — **`integration-map.md`**.

### Integrity

- [ ] No fabricated team size, deadlines, or vendor dates — **`quality-validation-and-guardrails.md`**.
- [ ] **Decision-tree** consulted for spike vs implement when uncertainty is high — **`decision-tree.md`**.
