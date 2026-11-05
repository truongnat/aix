# Failure modes — detection and mitigation (performance tuning)

## Contents

1. [Measurement and benchmarking](#measurement-and-benchmarking)
2. [Caching and consistency](#caching-and-consistency)
3. [Concurrency and load](#concurrency-and-load)
4. [Optimization mistakes](#optimization-mistakes)

---

## Measurement and benchmarking

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Wrong bottleneck** | Profile shows hotspot not matching user pain (I/O vs CPU) | End-to-end tracing; split client vs server — **`latency-and-resources-system-model.md`** |
| **Debug / dev numbers** | “Fixed” locally; prod unchanged | Measure prod-like build, flags, data size — **`edge-cases.md`** |
| **Coordinated omission** | Load test omits failures; latency looks great | Track errors + timeouts with latency; open circuits — **`quality-validation-and-guardrails.md`** |
| **Toy datasets** | Good p95 until production scale | Scale-sensitive tests; growth checks — **`anti-patterns.md`** |

---

## Caching and consistency

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Cache stampede** | Spike at TTL expiry | Probabilistic early refresh, single-flight lock — **`caching-pro`**, **`edge-cases.md`** |
| **Stale reads** | Users see wrong state after writes | Invalidate or short TTL on write-heavy paths — **`decision-framework-and-trade-offs.md`** |
| **Caching sensitive paths** | Authz leaks via shared cache keys | Never cache without tenant/user dimension — **`anti-patterns.md`** |

---

## Concurrency and load

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Too much parallelism** | p99 worse, lock contention | Bound pools; reduce sharing — **`edge-cases.md`** |
| **Retry storm** | Downstream melts; latency explodes | Backoff + jitter + budgets — **`anti-patterns.md`** |
| **GC / allocator pressure** | CPU low but long pauses | Allocation profiling; fewer short-lived objects — **`edge-cases.md`** |

---

## Optimization mistakes

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Premature micro-optimization** | Complexity without profile proof | Flame graph first — **`tips-and-tricks.md`** |
| **Throughput-only wins** | Median faster, tail worse | Monitor p99; fairness — **`decision-framework-and-trade-offs.md`** |
| **Regression after release** | Different code path under load | Perf budgets in CI — **`testing-pro`** |
