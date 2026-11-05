# Optimization and trade-offs

- Optimize in layers: asymptotic improvement first, then constant-factor tuning.
- Choose data structures by operation mix and memory budget.
- Consider iterative forms to avoid recursion depth limits when needed.
- Trade memory for speed intentionally (memoization, prefix tables, bitsets) with limits.
- Benchmark with representative and adversarial datasets before final choice.

## Real-world constraint layer

- **Memory ceiling** — may rule out O(n²) memory even if time ok.
- **Cache locality** — sequential access vs pointer chasing; matters at 1e8+ ops.
- **IO** — streaming input; avoid reading full file if one-pass suffices.
- **Language** — Python/JavaScript constant factors vs C++/Rust for inner loops at tight limits.
- **JIT warm-up** — benchmark methodology for JVM/JS (**`data-analysis-pro`**).

See **`algorithms-in-systems.md`** for pipelines, concurrency, and failure modes.
