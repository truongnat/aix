# Caching — anti-patterns

1. **Caching before fixing the query** — N+1 or missing index will still hurt at scale; cache masks symptoms.

2. **Unbounded key cardinality** — User id in key without namespace → memory explosion; per-user cache storms.

3. **Same TTL for all entities** — Hot vs cold data need different TTL and invalidation.

4. **No cache stampede protection** — Thundering herd on expiry; use single-flight, locks, or probabilistic early expiration.

5. **Caching non-idempotent or sensitive error responses** — Do not cache 500s or personalized errors broadly.

6. **Writing to cache without source-of-truth discipline** — Write-through mis-implemented can diverge from DB.

7. **Ignoring cache failure** — Redis down should degrade to origin with timeouts; circuit breakers.

8. **HTTP `Cache-Control` wrong for authenticated APIs** — Private data cached as public is a data leak.

9. **Distributed cache without serialization versioning** — Deploying new app version reading old blob shape → subtle bugs.

10. **Invalidation list that never runs** — Background jobs fail silently; monitor invalidation lag.

When NOT to cache: financial balances, legal audit trails, or strongly consistent reads — prefer **`postgresql-pro`** tuning first.
