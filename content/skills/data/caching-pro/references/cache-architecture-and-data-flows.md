# Cache architecture and data flows

Describe **paths** explicitly — caching bugs live at **junctions**.

## Canonical layers (conceptual)

```text
Client → CDN / edge (optional)
      → Application (L1 in-process optional)
      → Distributed cache L2 (Redis/Memcached)
      → Origin service / DB
```

Not every system uses every hop — document **your** truth table.

## Read path

1. Resolve **cache key** (auth-aware namespacing — **`cache-security-and-isolation.md`**).
2. **Hit** → validate **version**/TTL policy; optionally **refresh async** if soft TTL exceeded.
3. **Miss** → single-flight/coalesce → load origin → **populate** cache → return.
4. **Origin error** → do not permanently cache failure responses (**`anti-patterns.md`**).

## Write path

See **`write-path-and-coherence.md`** — cache-aside usually **updates DB first**, then **delete/invalidate** cache entries (not blindly write-through unless designed).

## Invalidation path

- **Synchronous** — delete keys in same request as DB commit (strongest common pattern for cache-aside).
- **Async** — queue invalidation; risk **lag** — document **bounded staleness** — **`distributed-consistency-models.md`**.

## Warm path

- **Cold start** — preload hot keys after deploy; throttle to protect origin.
- **Refresh** — background jobs refresh before hard expiry (stale-while-revalidate style).

## Multi-hop coherence

When **L1 + L2 + CDN** coexist — **`multi-layer-cache.md`**.
