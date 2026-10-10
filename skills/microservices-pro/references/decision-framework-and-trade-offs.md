# Decision framework and trade-offs

## Microservices vs modular monolith

| Signal | Prefer split |
|--------|----------------|
| **Independent release cadence per domain** | Strong split candidate |
| **Unclear bounded context** | Prefer **modular monolith** first — **`decision-tree.md`** |

## Sync vs async (cost)

| Sync wins | Async wins |
|-----------|------------|
| User-facing latency budget | Notifications, reconciliation |
| Strong read-after-write single screen | Eventually OK workflows |

## Consistency stance

| Model | Trade-off |
|-------|-----------|
| **Strong ACID across services** | Usually impractical — avoid XA default |
| **Saga / outbox / idempotent consumers** | Operational complexity for autonomy |

## Service mesh / gateway

| Layer | Role |
|-------|------|
| **Gateway** | Edge auth, rate limit, routing |
| **Mesh** (optional) | mTLS, retries at L7 — complexity tax — **`quality-validation-and-guardrails.md`** |

## Org fit

**Conway’s law** — service boundaries should align with **team ownership** or friction grows — **`edge-cases.md`** org section.
