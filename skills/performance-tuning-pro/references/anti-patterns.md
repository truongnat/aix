# Anti-patterns — performance tuning

1. **Optimizing without profiling** — Random changes; real bottleneck elsewhere.
2. **Micro-optimizing cold paths** — Complexity for no user-visible win.
3. **Unbounded caches** — Memory leaks and stale reads.
4. **Retry without backoff** — Retry storms on downstream failures.
5. **Benchmarks on toy data** — Misses O(n²) and lock contention at scale.
6. **Caching as authz** — Never use cache to hide unauthorized data paths.
7. **Single-number metrics only** — p50 looks fine while p99 is on fire.

See [decision-tree.md](decision-tree.md) and [edge-cases.md](edge-cases.md).
