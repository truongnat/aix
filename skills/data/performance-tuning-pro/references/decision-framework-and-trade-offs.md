# Decision framework and trade-offs (performance tuning)

## Contents

1. [Latency vs throughput vs cost](#latency-vs-throughput-vs-cost)
2. [Consistency vs cache freshness](#consistency-vs-cache-freshness)
3. [Scale-out vs optimize-in-place](#scale-out-vs-optimize-in-place)
4. [Structural vs micro optimization](#structural-vs-micro-optimization)

Pair with **`decision-tree.md`** for quick branching and **`latency-and-resources-system-model.md`** for where time goes.

---

## Latency vs throughput vs cost

| Priority | Lean toward |
|----------|-------------|
| **Interactive UX** | Tail latency (p95/p99), bounded work per frame |
| **Batch / pipelines** | Throughput, utilization |
| **Tight budget** | Cheaper structural fixes (fewer round trips) before bigger hardware |

Trade-off: improving peak throughput may increase queueing and hurt p99 unless paired with **concurrency limits** and **capacity** — **`failure-modes-detection-mitigation.md`**.

---

## Consistency vs cache freshness

| Need | Approach |
|------|----------|
| Strong consistency on reads after writes | Short TTL + explicit invalidation, or skip cache on those paths |
| Eventual OK for N seconds | CDN / app cache with documented staleness SLA — **`caching-pro`** |

Never trade **correctness or authorization** for speed — **`anti-patterns.md`**.

---

## Scale-out vs optimize-in-place

| Signal | Prefer |
|--------|--------|
| Flat CPU, linear scaling with replicas | Horizontal scale **after** fixing obvious O(n²) and N+1 |
| Single hot shard / lock | Optimize coordination first |
| Steady-state CPU high on one function | Optimize code/query before buying cores |

Horizontal scale **masks** inefficient paths until cost or coordination breaks — **`latency-and-resources-system-model.md`**.

---

## Structural vs micro optimization

| Type | Examples |
|------|----------|
| **Structural** | Remove N+1, batch I/O, better index, reduce payload size |
| **Micro** | SIMD, tighter loop (after profiler proof) |

Default order: **measure → structural → micro on proven hotspots** — **`tips-and-tricks.md`**.
