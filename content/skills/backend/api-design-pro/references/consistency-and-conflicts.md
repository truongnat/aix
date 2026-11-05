# Consistency, conflicts, and distributed behavior

Document what clients should assume after writes and under replication lag.

## Read-after-write

- Define if clients should **poll until visible** or expect **eventual visibility** (search index lag).

## Stale reads

- **Replica lag** — `read-your-writes` token or short-lived session stickiness if product-critical.

## Optimistic concurrency

- **ETag** on GET; require **`If-Match`** on mutating requests that must detect drift — pair **`mutation-semantics-and-concurrency.md`**.

## Conflicts

- **409** body explains conflict type; offer **merge** or **refresh** guidance for clients.

## Duplicate / out-of-order events

- Webhook consumers: **idempotent handlers**; **`event_id`** dedup store.

## Pagination under change

- Cursor stability — **`edge-cases.md`**.

## Review checklist

- [ ] API docs state **consistency model** (strong per key, eventual search, etc.) where non-obvious.
- [ ] Conflict responses are **actionable** for clients.
