# Edge cases

## Read / hot data

- **Hot-key amplification**: a tiny key set receives most traffic; use sharding/coalescing and tighter monitoring.
- **Thundering herd**: popular keys expire together; jitter TTL and allow single-flight refresh.

## Cardinality & memory

- **High-cardinality keys**: unbounded key space can exhaust memory quickly; add admission controls and caps.

## Geography & replication

- **Multi-region deployments**: replication lag can create cross-region stale reads; define region-local consistency policy.

## Invalidation & operations

- **Partial invalidation failure**: one mutation path forgets to invalidate; add mutation contract tests.
- **Silent invalidation job failure** — entries stale until TTL; alert on job success rate.

## Tenancy & security

- **Tenant isolation**: missing tenant scope in keys can leak data across customers — **`cache-security-and-isolation.md`**.

---

## Consistency bugs

- **Read-after-write violation** — replica or CDN serves older than writer’s expectation — **`distributed-consistency-models.md`**.
- **Stale read from replica** — cache invalidated but DB replica lags — route critical reads or tighten replica lag SLA.
- **Cross-region inconsistency** — disparate TTL or purge delay — **`multi-layer-cache.md`**.

## Write-path bugs

- **Cache updated, DB failed** — poisoned cache — **`write-path-and-coherence.md`**.
- **DB committed, cache not invalidated** — long-lived wrong value — mutation coverage tests.
- **Write-behind lost data** — crash before durable flush — **`write-path-and-coherence.md`**.

## Distributed / cluster bugs

- **Replication lag inside cache tier** — uneven reads — cluster topology awareness.
- **Shard mismatch** — wrong routing key → perpetual miss / wrong shard — **`cache-architecture-and-data-flows.md`**.
- **Split-brain (rare in managed Redis)** — documented by vendor operations — **`failure-modes-and-resilience.md`**.

## Performance bugs

- **Cache thrash** — working set exceeds RAM; churn evictions — capacity model — **`cost-and-capacity-modeling.md`**.
- **Eviction storm** — correlated expirations — jitter, staggered TTL.
- **Serialization overhead** — large JSON on hot path — payload slimming.

## Security bugs

- **Shared cache leak** — user A’s payload served to B — auth-scoped keys — **`cache-security-and-isolation.md`**.
- **Key collision / guessing** — predictable keys — opaque IDs + auth partition.
- **Cache poisoning** — hostile response cached — validate origin — **`anti-patterns.md`**.
