# Failure modes and resilience

Plan **degradation**, not only happy path hit ratio.

## Failure modes

| Scenario | Symptoms | Mitigation |
|----------|-----------|------------|
| **Cache cluster down** | Miss storm on origin | Circuit breaker on origin; shed load; temporary scale origin |
| **Partial cluster failure** | Split reads / uneven skew | Client retry other nodes; cluster health checks |
| **Network partition** | Timeouts, split brain risk in distributed stores | Prefer CP vs AP per product; quorum docs from vendor |
| **Stale forever** | Bad invalidation code path | Monitoring on **staleness age**; synthetic **canary** reads |
| **Eviction storm** | Sudden RAM pressure, mass eviction | Memory limits; admission control; alerts on eviction rate |

## Response patterns

- **Fallback to origin** with **concurrency limits** — protect DB from thundering herd.
- **Circuit breaker** — stop hammering unhealthy cache or DB.
- **Retry with backoff + jitter** — avoid synchronized retries.

## Retry / stampede

Pair **`tips-and-tricks.md`** stampede controls — **`failure-modes`** focuses on **operational** failure, not algorithm-only.
