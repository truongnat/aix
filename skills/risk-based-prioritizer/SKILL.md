---
name: risk-based-prioritizer
description: "Rank modules, features, or test cases by risk when test time is limited. Use when a tester must decide what to test first — scoring each item on user impact, usage frequency, change complexity, dependencies, bug history, sensitive data, and detectability, then grouping into Must test / Should test / Can defer."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,risk,prioritization,test-strategy"
---

# Risk-Based Prioritizer

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If prioritization files are created, store them under:

```text
artifacts/YYYY-MM-DD/risk-based-prioritizer/HHmmss-scope/
```

Every artifact must record `Session timestamp`, the input scope, the scoring rules used, the priority table, and assumptions.

## Goal
Help a tester pick the RIGHT things to test first when there isn't time to test everything — with reasons tied to criteria, not gut feeling.

## Scoring model
Score each item 1–5 per criterion:

| Criterion | 1 (low risk) | 5 (high risk) |
|---|---|---|
| User/business impact if broken | Few users notice | Blocks revenue/core flow |
| Usage frequency | Rarely touched | Used constantly |
| Change complexity | Trivial diff | Touches many modules/layers |
| Dependencies | Standalone | Integrates with other systems |
| Bug history / regression-proneness | Never broken | Breaks every release |
| Sensitive data / money / permissions / compliance | None | Directly handles |
| Detectability & rollback | Obvious + easy rollback | Silent failure + hard rollback |

`Risk score = sum of all criterion scores` (max 35).

If data for a criterion is unknown, mark it `Unknown`, do not guess a 3 — and ask if that criterion carries real weight for the decision.

## Process

1. Read the item list (modules, features, or test cases).
2. Normalize into independent items — one row per thing that could be tested separately.
3. Score each criterion. Briefly justify high scores (≥4) so the table is auditable.
4. Group by score bands (adjust to context, but default):
   - `Must test`: score ≥ 24, OR any single criterion at 5 involving money/permissions/data loss
   - `Should test`: 15–23
   - `Can defer`: ≤ 14, assuming nothing critical was Unknown
5. Propose a focus order and explicitly state which areas could have scope reduced.

A single-criterion-5 (e.g. "handles payment data") can override a middling total — say so when it does.

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Scope: [sprint/release/item list source]
Capacity: [days/time available if known]

| Rank | Item | Score | Priority | Rationale | Test focus | Deferrable? |
|---|---:|---:|---|---|---|---|
| 1 | Payment retry flow | 29 | Must test | money + retry logic changed | double-charge, idempotency | No |

Recommendation:
- Test first: [...]
- Test if time remains: [...]
- Can defer: [...]
- Need more info: [...]
```

## Anti-patterns
- Averaging risk so everything lands in "Should test" — force a real ordering.
- Prioritizing by what's easiest or fastest to test — risk decides, not convenience.
- Prioritizing by recency ("it's new so it's risky") — newness is one signal, not the score.
- Treating `Unknown` as low risk — flag it; an unknown on a sensitive criterion should escalate to "Need more info," not quietly defer.
- Ignoring the user's stated capacity — if they give a deadline or QA-days, map Must/Should/Defer onto that realistic capacity.
