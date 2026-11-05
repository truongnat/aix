# Distributed consistency models for cache

Formalize **what readers may observe** — complements TTL rules in **`invalidation-and-consistency.md`**.

## Levels (informal industry usage)

| Model | Meaning | Typical mechanism |
|-------|---------|-------------------|
| **Strong / read-your-writes** | Writer sees own update immediately | Sync invalidate same session; sticky routing + version check |
| **Bounded staleness** | Everyone sees data ≤ Δ old | TTL + jitter; async invalidation with known lag |
| **Eventual consistency** | All replicas converge later | Replication + periodic refresh; tolerate temporary divergence |
| **Session consistency** | Coherent within one client session | Session-bound cache partition or token |
| **Monotonic reads** | Never see older than prior read in same flow | Version or timestamp checks per client cursor |

## Read-after-write violations

- **Replica lag** — DB reader hits stale replica while cache invalidated — coordinate **read routing** or **primary read** for critical reads.
- **Cross-region** — CDN/L2 diverge — define **region authority** or **short TTL** for volatile data.

## Choosing

- Match **business SLA** per entity (prices vs profile avatar).
- Document **exceptions** (“search index may lag 1 min”) — **`api-design-pro`** for external promises.
