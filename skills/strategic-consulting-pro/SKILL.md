---
name: strategic-consulting-pro
description: |
  Production-grade strategic consulting: problem framing, strategic options, scenario planning, portfolio fit, prioritization, and decision-ready leadership memos — plus system model (decision spine, stakeholder governance, evidence loop, execution handoff), failure modes (framework theater, confirmation bias, HiPPO, stale evidence, execution gap), decision trade-offs (where-to-play/how-to-win, build-partner-buy, concentration vs diversification, speed vs certainty), and quality guardrails (confidence tags, no fabricated market facts, not legal advice).

  Use this skill for board/executive-level strategy: growth choices, market-entry sequencing, build/partner/buy, operating model trade-offs, strategic risks, concise strategy memos with assumptions and confidence.

  Combine with **`market-research-pro`** for market evidence, **`web-research-pro`** for source validation, **`data-analysis-pro`** for quantitative baselines, **`business-analysis-pro`** for requirements from chosen strategy, **`planning-pro`** for roadmaps after decisions, **`feedback-pro`** for review cycles, **`security-pro`** when posture or regulation constrains options, and **`auth-pro`** for identity strategy depth.

  Triggers: "strategy", "strategic consulting", "go-to-market strategy", "market entry", "prioritization", "portfolio strategy", "build vs buy", "partner strategy", "operating model", "scenario planning", "decision memo", "north star", "strategic options", "kill criteria", "RACI strategy", "initiative sequencing", "moat", "where to play", "how to win", "strategic risk".

metadata:
  short-description: Strategy — decision spine, options, scenarios, stakeholder model, guardrails
  content-language: en
  domain: business-strategy
  level: professional
---

# Strategic consulting (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use reputable strategy references and **current** evidence; this skill encodes **decision-driven synthesis**, **trade-off clarity**, and **assumption transparency** — not generic framework dumps. Confirm **decision owner**, **time horizon**, **constraints** (capital, people, regulation), and **success metrics**.

## Boundary

**`strategic-consulting-pro`** owns **strategic problem framing**, **option sets**, **criteria-based comparison**, **scenario and portfolio logic**, and **executive-ready recommendations**. **`business-analysis-pro`** owns **requirements and delivery artifacts**. **`planning-pro`** owns **detailed sequencing and dependency plans** once a strategic choice exists. **`market-research-pro`** owns **primary market evidence gathering**.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`market-research-pro`** | Market sizing, competitors, segments |
| **`web-research-pro`** | External claim verification |
| **`data-analysis-pro`** | KPI baselines, scenario quantification |
| **`business-analysis-pro`** | Scope and requirements from chosen strategy |
| **`planning-pro`** | Roadmaps, waves, dependencies |
| **`feedback-pro`** | Review-driven reprioritization |
| **`security-pro`** | Strategy gated by risk/regulation |
| **`auth-pro`** | Build/partner/buy in identity |

## When to use

- Clarify strategic questions before jumping to tactics.
- Compare options on shared criteria with explicit trade-offs.
- Prioritize initiatives under resource constraints.
- Scenario planning under uncertainty.
- Executive memos, decision logs, and kill criteria.

## When not to use

- **Implementation-level** task breakdown without strategic choice — **`planning-pro`** or **`business-analysis-pro`**.
- **Pure market data collection** as the main deliverable — **`market-research-pro`** may lead.
- **Legal, tax, or investment advice** — counsel/finance; this skill flags handoff only.

## Required inputs

- **Decision owner** and **deadline** (or “none” with risk called out).
- **Constraints** (capital, regulatory, capability).
- **Success definition** or metrics when available.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** decision context, owner, horizon, constraints, and metrics. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm the decision to be made, owner, horizon, and constraints before offering strategy. Ask when the real choice or success metric is still fuzzy.
2. **Simplicity First** — Prefer the smallest defensible option set and decision spine. Do not add framework theater or excessive scenario branches without decision value.
3. **Surgical Changes** — Address only the strategic question in scope. Do not drift into implementation plans, detailed requirements, or broad market writeups unless requested.
4. **Goal-Driven Execution** — Done = the recommendation changes a decision, names its assumptions, and shows how to detect if it is wrong.
5. **Decision quality beats presentation polish** — A strategy memo is useful only if trade-offs and commitments are explicit.
6. **Evidence has hierarchy** — Separate hard data, directional signals, and inference; do not flatten them into equal-confidence claims.
7. **Options need kill criteria** — Strategic bets should include conditions for doubling down, revising, or stopping.
8. **Execution handoff is real** — Strategy that cannot hand off into planning or measurement is incomplete.

## Default recommendations by scenario

- **Go/no-go decision** — Frame 2-3 options with explicit criteria and downside, not a generic brainstorm.
- **Portfolio prioritization** — Compare initiatives on shared resource and impact logic before sequencing.
- **High uncertainty** — Use scenarios and trigger points instead of a false single-point forecast.
- **Build/partner/buy** — Separate capability gap, timing, and control trade-offs clearly.

## Decision trees

Summary: choose option breadth, evidence depth, and scenario detail based on decision reversibility, uncertainty, and stakeholder stakes.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: framework theater, confirmation bias, polished but non-decisive memos, and recommendations without downside or kill criteria.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Strategic decision and stakeholder system model (summary)

How decision owners, evidence loops, stakeholders, and execution handoffs interact so strategy stays operationally relevant.

Details: [references/strategic-decision-and-stakeholder-system-model.md](references/strategic-decision-and-stakeholder-system-model.md)

### Problem framing and options (summary)

How to define the real question and generate option sets that are meaningfully different.

Details: [references/problem-framing-and-options.md](references/problem-framing-and-options.md)

### Prioritization and resource allocation (summary)

How to compare strategic bets when capital, people, or time are limited.

Details: [references/prioritization-and-resource-allocation.md](references/prioritization-and-resource-allocation.md)

### Scenario planning and risk (summary)

How to reason about uncertainty, downside, and trigger points without pretending to predict perfectly.

Details: [references/scenario-planning-and-risk.md](references/scenario-planning-and-risk.md)

### Reporting and executive communication (summary)

How to compress strategic reasoning into decision-ready output for leadership consumption.

Details: [references/reporting-and-executive-communication.md](references/reporting-and-executive-communication.md)

## Suggested response format

1. **Context** — Decision owner, horizon, constraints, success metric, and strategic question.
2. **Decision model** — Explain the option frame, criteria, and evidence quality.
3. **Options and recommendation** — Present realistic alternatives, trade-offs, and the preferred path.
4. **Risks and kill criteria** — What could invalidate the recommendation and when to revisit.
5. **Residual risks** — Remaining evidence gaps or execution dependencies outside the current strategy scope.

## Resources in this skill

| Topic | File |
|-------|------|
| Strategic decision and stakeholder system model | [references/strategic-decision-and-stakeholder-system-model.md](references/strategic-decision-and-stakeholder-system-model.md) |
| Problem framing and options | [references/problem-framing-and-options.md](references/problem-framing-and-options.md) |
| Prioritization and resource allocation | [references/prioritization-and-resource-allocation.md](references/prioritization-and-resource-allocation.md) |
| Scenario planning and risk | [references/scenario-planning-and-risk.md](references/scenario-planning-and-risk.md) |
| Reporting and executive communication | [references/reporting-and-executive-communication.md](references/reporting-and-executive-communication.md) |
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

**Input:** "Should we build this capability ourselves or partner?"
- Frame the real decision, criteria, and timing constraints before arguing from preference.
- Compare control, speed, and capability risk explicitly.
- **Verify:** The recommendation names what would make the opposite option better.

**Input (tricky):** "Leadership wants a bold recommendation with thin evidence."
- State evidence confidence honestly and use scenario-based downside framing instead of fake certainty.
- Narrow the option set to what can be defended with current facts.
- **Verify:** The memo distinguishes fact, inference, and open questions clearly.

**Input (cross-skill):** "Pick a market-entry path and show the execution implications."
- Pair **`market-research-pro`** for evidence and **`planning-pro`** for post-decision sequencing.
- Keep strategy and execution handoff distinct but connected.
- **Verify:** The recommended option includes decision rationale plus explicit next-step planning implications.

## Checklist before calling the skill done

- [ ] Decision owner, question, horizon, constraints, and metrics confirmed first (Think Before Coding)
- [ ] Minimum viable option set chosen; no unnecessary framework theater added (Simplicity First)
- [ ] Only the strategic question in scope was addressed (Surgical Changes)
- [ ] Success criteria, assumptions, and revisit triggers are explicit (Goal-Driven Execution)
- [ ] Evidence quality is separated from inference
- [ ] Trade-offs and downsides are stated clearly
- [ ] Kill criteria or revisit conditions are present where relevant
- [ ] Execution handoff implications are documented without drifting into full implementation planning
