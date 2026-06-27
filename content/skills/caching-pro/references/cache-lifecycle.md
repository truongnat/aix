# Cache entry lifecycle

Operational states from **birth** to **death**.

## Phases

1. **Cold** — Key absent.
2. **Warm** — Explicit preload (deploy, cron) or first organic hit populates.
3. **Active** — Served hits; monitor age and hit rate.
4. **Refresh** — Soft TTL / background revalidation before hard expiry (optional).
5. **Expire** — Hard TTL reached — entry removed or marked invalid.
6. **Evict** — Memory pressure removes entries early (LRU/LFU policy).
7. **Rebuild** — Miss path or warm job repopulates.

## Operations

- **Version bump** — `namespace:vN` mass migration — coordinate with **`invalidation-and-consistency.md`**.
- **Emergency flush** — Global or pattern delete — script + observability spike expected.

## Observability

- Track **staleness age** distribution and **warm job** success — **`performance-and-observability.md`**.
