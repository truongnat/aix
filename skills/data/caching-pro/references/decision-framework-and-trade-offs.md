# Decision framework and trade-offs (caching)

## Contents

1. [Cache vs fix origin](#cache-vs-fix-origin)
2. [TTL vs active invalidation](#ttl-vs-active-invalidation)
3. [Edge vs origin freshness](#edge-vs-origin-freshness)
4. [Strong vs bounded staleness](#strong-vs-bounded-staleness)

See **`pattern-selection.md`**, **`decision-tree.md`**.

---

## Cache vs fix origin

Masking **O(n²)** queries hurts everyone — optimize access path first — **`anti-patterns.md`**.

---

## TTL vs active invalidation

TTL alone can be **too stale** or too chatty on invalidation — blend strategies — **`invalidation-and-consistency.md`**.

---

## Edge vs origin freshness

CDN wins latency but complicates **purge** — **`multi-layer-cache.md`**, **`deployment-pro`**.

---

## Strong vs bounded staleness

Pick per **entity**; do not claim global strong consistency unless true — **`distributed-consistency-models.md`**.
