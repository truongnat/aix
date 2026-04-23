---
name: market-research-pro
description: |
  Production-grade market research: evidence and sizing system model, failure modes (single-source TAM, spurious precision, category mismatch, stale data), decision trade-offs (top-down vs bottom-up, breadth vs depth, speed vs rigor), quality guardrails (no fabricated market sizes; cite source+date+geo).

  Use this skill when the user asks to validate market opportunity, compare competitors, estimate market size with assumptions, identify ICP segments, prioritize country/vertical expansion, or produce an executive-style market brief with citations and explicit confidence levels.

  Use **with** **`web-research-pro`** for official and current external sources, **`business-analysis-pro`** to convert findings into requirements/roadmaps, and **`data-analysis-pro`** when survey or tabular datasets need numeric analysis. This skill (`market-research-pro`) owns **research framing and synthesis quality**; other skills own deep implementation or analytics details.

  Triggers: "market research", "TAM", "SAM", "SOM", "competitor analysis", "ICP", "go-to-market", "positioning", "pricing", "market size", "industry trends", "benchmark", "category landscape", "entry strategy", "bottom-up sizing", "top-down", "wedge", "category creation", "SAM vs SOM", "evidence scorecard", "substitute competitor".

metadata:
  short-description: Market research — sizing, competitors, ICP, evidence, failure modes
  content-language: en
  domain: market-research
  level: professional
---

# Market research (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official company sources, regulatory filings, and high-quality industry reports as preferred evidence; this skill encodes **assumption-driven sizing**, **source reliability ranking**, and **decision-ready** synthesis. Confirm **market definition**, **geography**, **time horizon**, and **decision context** (invest, build, expand, price).

## Boundary

**`market-research-pro`** owns **what market signals mean for decisions**, **sizing methods**, **competitive framing**, and **evidence quality**. **`web-research-pro`** owns **how** to gather and verify external sources. **`business-analysis-pro`** owns **requirements and delivery** artifacts from decisions.

## Related skills (this repo)

| Skill | When to combine with `market-research-pro` |
|-------|--------------------------------------------|
| **`web-research-pro`** | Collect and verify external sources, changelogs, and citation quality |
| **`business-analysis-pro`** | Convert findings into initiative scope, requirements, and priority |
| **`data-analysis-pro`** | Analyze survey/usage/exported datasets numerically |
| **`seo-pro`** | Search-demand and organic visibility angle for web-first products |

## When to use

- Market sizing with transparent assumptions (TAM/SAM/SOM).
- Competitor landscape and differentiated positioning.
- ICP/segment prioritization and expansion hypotheses.
- Pricing and packaging hypothesis framing (not final finance model).
- Trend scan for strategic direction with citation discipline.

## When not to use

- **Legal or investment advice** as binding opinion — surface evidence and defer to counsel/investors.
- **Primary survey design** as the main topic — pair **`data-analysis-pro`** for instrument and stats.

## Required inputs

- **Decision** the research supports (or explicit “exploratory”).
- **Market boundary** draft (category, geo, timeframe) when sizing.

## Expected output

Follow **Suggested response format (STRICT)** — eight sections including explicit confidence.

## Workflow

1. Confirm decision to support (go/no-go, segment priority, pricing hypothesis), market boundaries, and timeframe.
2. Apply the principles and topic summaries below; open `references/` when you need depth; gather external evidence via **`web-research-pro`** and cite source quality.
3. Respond using **Suggested response format (STRICT)**; note uncertainty, assumption sensitivity, and data freshness risk.

### Operating principles

1. **Define market before sizing** — avoid mixing categories and geographies.
2. **Assumptions are first-class** — every number has a method and confidence.
3. **Evidence quality matters** — official and recent sources outweigh generic blogs.
4. **Compare like-for-like** — competitors by segment, price tier, and use case.
5. **Decision orientation** — outputs must support a concrete choice, not only description.
6. **Freshness and reproducibility** — keep source dates and calculation steps visible.

### Market signal and evidence (system model) (summary)

Market definition, evidence stack, sizing chain, decision link — **`market-signal-and-evidence-system-model.md`**.

Details: [references/market-signal-and-evidence-system-model.md](references/market-signal-and-evidence-system-model.md)

### Failure modes — detection and mitigation (summary)

Single paid report, spurious precision, category mismatch, stale data — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Top-down vs bottom-up, scan depth, desk vs primary research — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No fabricated TAM; conflicting sources explicit — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Market sizing and assumptions (summary)

TAM/SAM/SOM methods (top-down, bottom-up, value-theory), sensitivity checks, confidence bands.

Details: [references/market-sizing-and-assumptions.md](references/market-sizing-and-assumptions.md)

### Competitor and positioning analysis (summary)

Competitor map, feature/price matrix, differentiation wedges, moat and switching-cost notes.

Details: [references/competitor-and-positioning.md](references/competitor-and-positioning.md)

### Segment prioritization and GTM hypotheses (summary)

ICP scoring, segment attractiveness vs accessibility, entry sequencing and risks.

Details: [references/segment-prioritization-and-gtm.md](references/segment-prioritization-and-gtm.md)

### Reporting and evidence quality (summary)

Source scorecard, confidence levels, assumptions appendix, contradiction handling.

Details: [references/reporting-and-evidence-quality.md](references/reporting-and-evidence-quality.md)

### Tips and tricks (summary)

Fast framing questions, anti-bias checks, and concise executive storytelling.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Emerging markets with sparse data, conflicting reports, and hype-cycle noise.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

Question type (sizing vs positioning); spurious precision and vendor-report bias.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`web-research-pro`**, **`strategic-consulting-pro`**, **`data-analysis-pro`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions, geo, currency (summary)

Fiscal vs calendar year; FX date; regional market definitions.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Geography, timeframe, category definition, decision type.
2. **Problem / goal** — What leadership must decide after reading.
3. **System design** — Evidence stack and sizing chain — **`market-signal-and-evidence-system-model.md`**.
4. **Decision reasoning** — Methods and segment focus — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Tables (assumptions, competitor matrix, scorecards), formulas — **Code**.
6. **Trade-offs** — Breadth vs depth; speed vs rigor; top-down vs bottom-up reconciliation.
7. **Failure modes** — Single-source, false precision, substitutes — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Data gaps, execution risk, handoff to **`business-analysis-pro`** / **`data-analysis-pro`**.

## Resources in this skill

| Topic | File |
|-------|------|
| **Market signal & evidence model** | [references/market-signal-and-evidence-system-model.md](references/market-signal-and-evidence-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Market sizing | [references/market-sizing-and-assumptions.md](references/market-sizing-and-assumptions.md) |
| Competitor and positioning | [references/competitor-and-positioning.md](references/competitor-and-positioning.md) |
| Segment and GTM | [references/segment-prioritization-and-gtm.md](references/segment-prioritization-and-gtm.md) |
| Reporting quality | [references/reporting-and-evidence-quality.md](references/reporting-and-evidence-quality.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions (geo, FX, fiscal) | [references/versions.md](references/versions.md) |

## Quick examples

**Input (simple):** "Should we launch B2B payroll SaaS in Vietnam first, then Thailand?"  
**Expected output:** Full **Suggested response format (STRICT)** — assumptions per country, competitor intensity, ICP fit, sequence, confidence.

**Input (tricky):** "TAM is $50B from one paid report — use it in the board deck."  
**Expected output:** Triangulate; sensitivity; vendor bias; ranges; **`web-research-pro`**.

**Input (cross-skill):** "Survey CSV + decide EU vs US first."  
**Expected output:** **`data-analysis-pro`** for stats; this skill for market framing and decision narrative.

## Checklist before calling the skill done

- [ ] Market boundaries (category, geo, timeframe) are explicit.
- [ ] Sizing assumptions and confidence are visible.
- [ ] Source quality and recency are stated.
- [ ] Recommendation is tied to a specific business decision.
- [ ] Follow-up handoff to **`business-analysis-pro`** / **`data-analysis-pro`** when needed.
- [ ] **Substitutes** and **category** definition sanity-checked.
- [ ] **Spurious precision** avoided — ranges where data is thin.
