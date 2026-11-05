# Algorithms in systems — beyond asymptotic correctness

Correct Big-O is not enough when **memory**, **IO**, **concurrency**, or **partial failure** dominate. Pair with **`network-infra-pro`**, **`deployment-pro`**, **`caching-pro`** when relevant.

## Execution shape

| Shape | Typical concerns |
|-------|------------------|
| **Batch offline** | Full dataset in memory vs external sort; checkpoint/restart |
| **Streaming / online** | Bounded memory; one-pass or sliding window; late/out-of-order data policies |
| **Stateful service** | Where state lives; durability; replay vs recomputation |
| **Request-scoped** | Per-query algorithm; cold start; allocation churn |

## Resources

- **Memory ceiling** — fits RAM vs spill to disk / distributed chunks.
- **Cache locality** — array-of-struct vs struct-of-array; contiguous traversal.
- **IO-bound** — batch reads/writes; avoid random seeks in inner loops.

## Concurrency and distribution

- **Parallelism** — partition strategy; merge step complexity; determinism if needed.
- **Distributed** — cannot assume global view cheaply; map-reduce style aggregation; consistency vs availability trade-offs (product-level).

## Reliability

- **Partial failure** — idempotent stages; checkpoint; retry with backoff on transient errors.
- **Numerical pipelines** — detect NaN/Inf propagation early.

## Caching

- Safe memoization of **pure** subproblems; **invalidate** when inputs are streams with TTL.

## Review checklist

- [ ] Bottleneck identified as **CPU vs memory vs IO vs network**, not only asymptotics.
- [ ] **Failure** and **restart** behavior defined for long batch jobs.
