# Decision framework and trade-offs

## Trade-off matrix

| Optimize for | Trade-off |
|--------------|-----------|
| **Strict layering** | Slower early velocity; onboarding cost |
| **Pragmatic layering** | Risk of erosion without lint/review discipline |
| **Rich domain model** | More upfront modeling; payoff when rules complex |
| **Thin domain + fat app services** | Faster CRUD apps; logic drifts to services |
| **Many small modules** | Clear ownership vs navigation overhead |
| **Few large modules** | Fewer seams vs merge conflicts |

## Defaults by scenario

| Scenario | Default stance |
|----------|----------------|
| **Greenfield CRUD admin** | Light layering; enforce boundaries **before** complexity spikes |
| **Complex domain (pricing, risk, compliance)** | Invest in domain model + explicit use cases early |
| **Legacy monolith** | Strangler + characterization tests; **no** big-bang |
| **OSS library** | Minimal surface API; stable core; adapters outside |
| **Frontend SPA** | UI state vs domain rules — avoid duplicating server rules blindly; sync contracts — **`api-design-pro`** |

## When **not** to apply full Clean Architecture

- Scripts, one-off ETL, prototype spikes — still use **readable** structure; skip ceremony.

## Decision record

For contentious splits: **option A/B**, **chosen**, **revisit trigger** (e.g. second team consuming module).
