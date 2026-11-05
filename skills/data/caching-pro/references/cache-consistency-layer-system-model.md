# Caching — layers, flows, and consistency class (system model)

## Contents

1. [Layer stack](#layer-stack)
2. [Read and write paths](#read-and-write-paths)
3. [Consistency class per surface](#consistency-class-per-surface)
4. [Degradation mode](#degradation-mode)

Canonical depth: **[cache-architecture-and-data-flows.md](cache-architecture-and-data-flows.md)**, **[distributed-consistency-models.md](distributed-consistency-models.md)**.

---

## Layer stack

Browser, CDN, app L1, shared cache, origin — each layer changes **staleness** and **invalidation** fan-out — **`multi-layer-cache.md`**.

---

## Read and write paths

Hit/miss, **write-through/behind/aside**, and **invalidation** ordering define correctness — **`write-path-and-coherence.md`**.

---

## Consistency class per surface

Same infra can serve **static** assets (loose) vs **balances** (strict) — document per **keyspace** — **`invalidation-and-consistency.md`**.

---

## Degradation mode

Cache down should **fail open or closed** explicitly per risk — **`failure-modes-and-resilience.md`**.
