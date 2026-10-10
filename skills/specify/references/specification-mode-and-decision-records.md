# Specification mode and decision records

Choose exactly one document mode and preserve stable trace IDs across revisions.

| Need | Primary mode | Evidence to retain |
|---|---|---|
| Whole-product vision/features | `prd` | Goals, users, scope, success measures, assumptions |
| Prioritized delivery horizons | `roadmap` | Now/Next/Later criteria, dependencies, decision owner |
| Idea validation or go/no-go | `discover` | Hypotheses, interview evidence, falsifiers, decision |
| Personas and journeys | `urd` | Actor needs, journey evidence, unmet needs |
| Business goals, ROI and risk | `brd` | Baseline, options, trade-offs, benefits and risks |
| One capability/epic | `prd-epic` | P0/P1/P2 scope, release boundary, AC and dependencies |
| Task FR/NFR/rules | `srs` | `FR-*`, `NFR-*`, rule/error matrix and verification |

Decision record minimum: decision, date/status, context, options considered, chosen option, rationale, consequences, assumptions, owner, and superseded links. Do not mix modes to avoid an artifact that is impossible to review or hand off. If mode or a blocking policy is unclear, stop and ask before authoring.
