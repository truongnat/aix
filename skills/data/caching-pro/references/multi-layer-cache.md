# Multi-layer caching (L1 / L2 / edge)

Performance comes from **hierarchy** — correctness from **invalidation choreography**.

## Layers

| Layer | Examples | Latency | Scope |
|-------|-----------|---------|--------|
| **L1** | In-process LRU, embed worker | μs–ms | Single instance |
| **L2** | Redis cluster, Memcached | ms | Shared across instances |
| **L3** | CDN, reverse proxy edge | ms–100ms+ | Geographic / HTTP |

## Invalidation propagation

Order of truth:

1. Invalidate **origin-facing** truth first conceptually — **delete L2 keys** before relying on **CDN purge** if CDN could serve stale HTML/API incorrectly — policy depends on **asset type**.
2. **L1** — flush process-local entries on pub/sub invalidation message or short TTL only.

## Coherence strategies

- **TTL-only L1** — simplest; stale window bounded by shortest TTL.
- **Pub/sub** — Redis channels / messaging to drop L1 entries on change.
- **Version in response** — Clients send `If-None-Match`; cheap validation.

## Duplication vs hierarchy

- **Duplicate** same payload at every layer — simpler but **triple memory** at edge cases.
- **Hierarchy** — L1 holds hot subset only; **admission** policy avoids RAM explosion.

## Anti-pattern

- **Different TTL at each layer** without matrix → “**stale forever**” relative to user expectation — document **effective staleness**.
