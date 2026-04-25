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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** decision to support (go/no-go, segment priority, pricing hypothesis), market boundaries, and timeframe. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.