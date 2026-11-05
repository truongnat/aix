# Decision framework and trade-offs

## Depth vs velocity

| Stance | When |
|--------|------|
| **Deep review** first pass | Security, payments, auth, migrations, data loss paths |
| **Light review + follow-up** | Low-risk internal tools; debt explicitly ticketed |
| **Time-boxed** review | Incident hotfix; document **accepted debt** — **`severity-and-prioritization.md`** |

## Consensus vs escalation

| Situation | Prefer |
|-----------|--------|
| **Two valid engineering options** | Pick one owner (maintainer); document ADR or comment resolution |
| **Product ambiguity** | Stop PR debate; clarify spec — **`review-feedback-system-model.md`** roles |

## Comment placement

| Choice | Trade-off |
|--------|-----------|
| **Inline on diff** | Precise; can fragment narrative |
| **Top summary + inline** | Best for many findings — readers see priorities first — **`tips-and-tricks.md`** |

## Nice-to-have vs must-fix

- **Must-fix** — Violates bar, exploit path, wrong contract, ship-breaking bug.
- **Should** — Quality, maintainability; schedule flex.
- **Optional / nit** — Style; batch or bot — **`decision-tree.md`**.

## Stakeholder alignment

- **`business-analysis-pro`** when feedback ties to **requirement intent** or ROI of rework.
- Domain `*-pro` when **correctness** of the finding needs specialist validation — **`integration-map.md`**.
