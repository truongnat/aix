# Failure modes (production-oriented)

Model how systems **fail partially** — not only “exception thrown”.

## Common modes

| Mode | Symptoms | Investigation |
|------|----------|----------------|
| **Timeout** | Intermittent 504, client hangs | Tail latency, upstream slowness, pool exhaustion |
| **Partial failure** | A ok, B failed; orphan state | Saga compensation, **outbox**, idempotency keys |
| **Retry storm** | Amplified load, duplicate side effects | Backoff, jitter, **max attempts**; **exactly-once** design — **`api-design-pro`** |
| **Cascading failure** | Upstream outage fans out | Circuit breaker, bulkheads — **`network-infra-pro`** |
| **Stale cache** | New deploy “invisible”; old config | TTL, purge, cache key versioning |
| **Split-brain** | Dual primary, conflicting writes | Quorum, fencing — infra/domain specific |

## Config / flag drift

- **Staging works, prod fails** — env matrix, secret version, **feature flag** cohort.

## Pairing with graph

Use **`impact`** to find **shared dependency** paths; use **failure mode** table to decide **runtime** vs **code** experiments.
