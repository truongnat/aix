# Write path complexity and coherence

Reads dominate tutorials; **writes** cause production incidents.

## Cache-aside write (typical)

1. **Commit** to authoritative store.
2. **Invalidate** or **update** cache keys affected — order matters vs readers.

**Dual-write risk** — If you **write cache before DB commit** and crash → stale cache forever; if **DB commits then cache fails** → transient misses until repopulated (usually acceptable vs wrong data).

## Write-through

- **Pros** — Cache always warm for reads.
- **Cons** — **Write latency** includes cache round-trip; **write amplification** on hot keys.

## Write-behind / async buffer

- **Pros** — Fast writer path.
- **Cons** — **Data loss** if process dies before flush; complex recovery — usually avoid unless specialized (queues with durability).

## Partial failures

- **Cache OK, DB fail** — must not expose success to client without durable write.
- **DB OK, cache fail** — define **invalidate retry** or accept **extra misses**.

## Transactions + cache

- Cache updates **after** transaction commit boundary.
- Distributed transactions across DB + Redis are expensive — prefer **outbox** + consumer invalidation **`deployment-pro`**.

## Coherence summary

Pick **one** authoritative story per entity and test **mutation tests** for every write path — **`testing-pro`**.
