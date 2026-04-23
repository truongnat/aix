---
name: business-analysis-pro
description: |
  Professional business and product analysis: requirements elicitation, SA-style reasoning, prioritization and traceability, explicit decision frameworks (criteria, weights, sensitivity), product outcomes (segments, value proposition, north star), metrics hierarchy and guardrails, structured risk modeling, stakeholder power and escalation, discovery loops (hypothesize–measure–learn), system constraints and cost bands (scale, latency, data, infra), MoSCoW, FR/NFR, BRD/FRD/RACI, decision logs, and executive-ready reporting.

  Use when clarifying business or product requirements, comparing options with trade-offs, defining success metrics, modeling risks, resolving stakeholder conflict, writing BRD/FRD, gap analysis (as-is vs to-be), acceptance criteria, or producing auditable deliverables. Combine with content-analysis-pro for source documents, data-analysis-pro for evidence, security-pro for compliance, planning-pro for phasing. This skill owns analysis, decisions-as-artifacts, and communication; implementation skills own build details.

  Triggers: "business analysis", "BA", "BRD", "FRD", "SRS", "requirements", "stakeholder", "MoSCoW", "acceptance criteria", "user story", "as-is", "to-be", "gap analysis", "RACI", "traceability", "NFR", "functional requirement", "systems analyst", "SA", "elicitation", "scope", "prioritization", "decision log", "ambiguous requirements", "scope creep", "who decides", "Definition of Ready", "INVEST", "non-functional", "compliance requirement", "stakeholder map", "north star", "KPI", "OKR", "trade-off", "weighted score", "risk register", "RACI", "escalation", "product outcome", "discovery", "experiment", "vanity metric", "guardrail metric".

metadata:
  short-description: Business analysis — requirements, decisions, product outcomes, metrics, risks, reporting
  content-language: en
  domain: business-analysis
  level: professional
---

# Business analysis (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use the [IIBA BABOK Guide](https://www.iiba.org/business-analysis-babok-guide/) as a **professional reference** (overview); this skill encodes **structured requirements thinking**, **decision-quality artifacts**, **outcome-aligned metrics**, **risk discipline**, and **report-ready** outputs — without replacing your org’s templates. Confirm **stakeholders**, **decision authority**, and **delivery model** (project vs product, regulatory or not).

## Boundary

**`business-analysis-pro`** owns **problem framing**, **options and decisions**, **requirements and traceability**, **success measures**, **risk/mitigation narrative**, and **stakeholder process**. It does **not** implement software, write detailed test suites (**`testing-pro`**), or own **architecture** — but it **integrates** feasibility and cost **signals** from stack skills into requirements and trade-offs.

## Related skills (this repo)

| Skill | When to combine with `business-analysis-pro` |
|-------|-----------------------------------------------|
| **`testing-pro`** | Acceptance criteria, testability, Definition of Done |
| **`security-pro`** | Data classification, compliance, abuse cases in requirements |
| **`design-system-pro`** / **`mobile-design-pro`** | UX and platform requirements |
| **`deployment-pro`** | Release / environment constraints in NFRs |
| **`postgresql-pro`** | Data and migration implications when requirements imply schema |
| **`content-analysis-pro`** | Deep read of attached **PDFs, images, video** to extract facts before BRD/user stories |
| **`data-analysis-pro`** | **Metrics**, baselines, EDA, evidence for KPI and decision scoring |
| **`planning-pro`** | Phasing, dependencies, estimates coordination |
| **`strategic-consulting-pro`** | Portfolio-level prioritization and exec narrative |
| **`api-design-pro`** | Latency, evolution, and contract constraints feeding NFRs |

**Implementation:** Stack **`*-pro`** skills = **how** to build; **this skill** = **what**, **why**, **who decides**, and **how we measure success**.

## When to use

- **Eliciting** and **structuring** requirements from vague asks.
- **Comparing options** with explicit criteria, scores, and rejected alternatives.
- **Prioritizing** and documenting **scope** (MVP vs phase 2).
- **As-is / to-be** and **gap** analysis.
- Writing or reviewing **BRD/FRD**, **user stories**, **RACI**, **decision logs**, **risk registers**.
- Defining **outcomes**, **metric hierarchy**, and **guardrails**.
- Producing **reports** for sponsors (executive summary + detail + appendix).

## When not to use

- **Legal sign-off** or **binding regulatory interpretation** — humans + counsel; BA documents questions and decisions given.
- **Pure engineering implementation detail** — defer to stack skills.

## Required inputs (when practical)

- **Sponsor intent** and **constraints** (time, budget, compliance).
- **Decision makers** and **approval** path.
- **Baseline** metrics or assumption that baseline will be captured.

## Expected output

Follow **Suggested response format (STRICT)** — eight sections with **decisions**, **requirements**, and **metrics** aligned.

## Workflow

1. Confirm **problem domain**, **stakeholders**, **decision makers**, **constraints**, and whether **discovery** or **delivery** mode dominates.
2. Apply principles and summaries; open `references/`; defer **test design** to **`testing-pro`** and **threats** to **`security-pro`** when those dominate.
3. Respond using **Suggested response format (STRICT)**; note **residual risks**, **metric conflicts**, and **approval** gaps.

### Operating principles

1. **Problem and outcome before features** — Anchor on measurable outcomes when possible — **`product-thinking-and-outcomes.md`**.
2. **Traceability** — Requirements link to **source**, **decision**, and **tests** where possible.
3. **Decisions are explicit** — Options, criteria, weights (if used), chosen path, **rejected** alternatives — **`decision-making-framework.md`**.
4. **Assumptions visible** — List and validate; tie to **risk** when fragile — **`risk-modeling.md`**.
5. **Stakeholder mechanics** — Power, interest, escalation — **`stakeholder-dynamics.md`** when conflict or vague authority appears.
6. **Readable by two audiences** — Executive summary + detail engineers can implement — **`reporting-and-deliverables.md`**.
7. **Change is managed** — Scope changes get **impact** (time, risk, metrics), not silent edits.
8. **Learn continuously** — Discovery loop for uncertain value — **`discovery-and-iteration.md`**.

### Stakeholder, requirement, and decision artifacts (system model) (summary)

Outcome chain, traceability, decision records, risks — **`stakeholder-requirement-decision-system-model.md`**.

Details: [references/stakeholder-requirement-decision-system-model.md](references/stakeholder-requirement-decision-system-model.md)

### Failure modes — detection and mitigation (summary)

Solution-first, vanity metrics, authority gaps, scope creep — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Depth vs time-box, scoring vs judgment, BRD vs lean — **`decision-framework-and-trade-offs.md`** (numeric criteria in **`decision-making-framework.md`**).

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Evidence for decisions; legal boundaries — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Decision-making framework (summary)

Criteria, scoring, weights, sensitivity, uncertainty — auditable choice.

Details: [references/decision-making-framework.md](references/decision-making-framework.md)

### Product thinking and outcomes (summary)

Segments, value proposition, north star, business impact hooks — BA + product bridge.

Details: [references/product-thinking-and-outcomes.md](references/product-thinking-and-outcomes.md)

### Metrics hierarchy and guardrails (summary)

North star, inputs/outputs, guardrails, conflicting KPIs — **`metrics-hierarchy-and-guardrails.md`**.

Details: [references/metrics-hierarchy-and-guardrails.md](references/metrics-hierarchy-and-guardrails.md)

### Risk modeling (summary)

Probability, impact, mitigation, owner, timeline — structured register.

Details: [references/risk-modeling.md](references/risk-modeling.md)

### Stakeholder dynamics (summary)

Power/interest, authority, conflict, escalation — **`stakeholder-dynamics.md`**.

Details: [references/stakeholder-dynamics.md](references/stakeholder-dynamics.md)

### Discovery and iteration (summary)

Hypothesize → test → learn → refine — **`discovery-and-iteration.md`**.

Details: [references/discovery-and-iteration.md](references/discovery-and-iteration.md)

### System constraints and cost (summary)

Scale, architecture, latency, data model, rough cost bands — feasibility in NFRs.

Details: [references/system-constraints-and-cost.md](references/system-constraints-and-cost.md)

### Requirements and reasoning (summary)

Elicitation, **as-is / to-be**, **MoSCoW**, FR/NFR, **IDs**, **decision records**, contradiction handling.

Details: [references/requirements-and-reasoning.md](references/requirements-and-reasoning.md)

### Reporting and deliverables (summary)

Executive summary + body + appendix; tables and matrices; **RACI**; handoff to **`testing-pro`**.

Details: [references/reporting-and-deliverables.md](references/reporting-and-deliverables.md)

### Tips and tricks (summary)

Workshops, glossary, baseline/target, versioning, lightweight traceability.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Scope creep, stakeholders, metrics conflicts, delivery dependencies, compliance ambiguity — expanded catalog.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

When to deepen vs time-box; solution-first; untestable FRs; vanity metrics.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`content-analysis-pro`**, **`data-analysis-pro`**, **`planning-pro`**, **`api-design-pro`**, stack skills.

Details: [references/integration-map.md](references/integration-map.md)

### Versions and templates (summary)

Org template versions; BABOK edition as external reference only.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Business problem, audience, urgency, constraints.
2. **Problem / goal** — Decision to unblock or delivery outcome to define.
3. **System design** — Outcome → requirements trace spine — **`stakeholder-requirement-decision-system-model.md`**.
4. **Decision reasoning** — Options, criteria, rejected paths — **`decision-framework-and-trade-offs.md`** / **`decision-making-framework.md`**.
5. **Implementation sketch** — FR/NFR table, RACI, or decision log excerpt — **Code** when structured.
6. **Trade-offs** — Scope vs time; metric conflicts; discovery vs big-design.
7. **Failure modes** — Solution-first, vanity KPIs, authority gaps — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Open questions, approvals, delegated skills (**`testing-pro`**, **`security-pro`**, …).

## Resources in this skill

| Topic | File |
|-------|------|
| **Stakeholder & decision artifact model** | [references/stakeholder-requirement-decision-system-model.md](references/stakeholder-requirement-decision-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Decision-making framework | [references/decision-making-framework.md](references/decision-making-framework.md) |
| Product thinking & outcomes | [references/product-thinking-and-outcomes.md](references/product-thinking-and-outcomes.md) |
| Metrics hierarchy & guardrails | [references/metrics-hierarchy-and-guardrails.md](references/metrics-hierarchy-and-guardrails.md) |
| Risk modeling | [references/risk-modeling.md](references/risk-modeling.md) |
| Stakeholder dynamics | [references/stakeholder-dynamics.md](references/stakeholder-dynamics.md) |
| Discovery & iteration | [references/discovery-and-iteration.md](references/discovery-and-iteration.md) |
| System constraints & cost | [references/system-constraints-and-cost.md](references/system-constraints-and-cost.md) |
| Requirements & reasoning | [references/requirements-and-reasoning.md](references/requirements-and-reasoning.md) |
| Reporting & deliverables | [references/reporting-and-deliverables.md](references/reporting-and-deliverables.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions & templates | [references/versions.md](references/versions.md) |

## Quick examples

**Input:** “We need the app to be fast and secure.”  
**Expected output:** **Measurable** NFRs; **metrics/guardrails**; **criteria** if build vs buy options; **`security-pro`** flag; assumptions list.

**Input:** “Legal says GDPR-compliant” — thin context.  
**Expected output:** **Open questions**; **risk rows**; **decision** to spike vs stop; **`security-pro`** for controls wording.

**Input:** “Pick vendor A vs B.”  
**Expected output:** **Decision framework** table; **weights** sensitivity; **risks** per vendor; **residual** approval needs.

## Checklist before calling the skill done

### Core

- [ ] **Problem**, **scope**, and **outcome intent** stated; **stakeholders** / deciders identified.
- [ ] **Decision** path clear — options, criteria, **rejected** alternatives, or explicit deferral with **risk**.
- [ ] Requirements **testable** or explicitly **spiked**; **traceability** to source where feasible.

### Product & measurement

- [ ] **Metrics** hierarchy or targets align with **`metrics-hierarchy-and-guardrails.md`** when success is debated.
- [ ] **Guardrails** named when optimization could harm quality, trust, or compliance.

### Risk & people

- [ ] **Risk register** rows or narrative equivalent for material unknowns — **`risk-modeling.md`**.
- [ ] **Stakeholder tension** or **authority** gaps addressed — **`stakeholder-dynamics.md`** when relevant.

### Delivery

- [ ] **Report structure** fits audience — **`reporting-and-deliverables.md`**.
- [ ] Technical depth **delegated** to **`testing-pro`** / **`security-pro`** / stack skills when implementation dominates.
- [ ] **Assumptions** and **open questions** listed; **change impact** when scope shifts.
