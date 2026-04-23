# API design edge cases

## Retry and duplicate effects

- Client/network retries can create duplicate records without idempotency controls.
- Timeout after server success can cause clients to replay the same write.
- **Replay after timeout with a different body** but reused idempotency key → undefined behavior unless rejected (**409** / explicit policy).

## Partial update ambiguity

- PATCH semantics can be unclear: omitted field vs explicit null vs delete intent.
- Merge behavior differences across clients can lead to accidental data loss.

## Mutation and concurrency

- **Lost update** when two clients PATCH without versioning — last writer wins silently unless **ETag** / **If-Match**.
- **Stale version overwrite** when client bases edit on cached GET while server moved forward.
- **Duplicate idempotency key** reused across tenants, routes, or unintended scope — duplicates or blocks wrong operations.

## Date/time and locale handling

- Mixed timezone assumptions break ordering, expiry, and reporting logic.
- Human-formatted date strings cause parsing inconsistencies across clients.

## Compatibility drift

- Older clients may ignore new required behavior even if schema appears compatible.
- **Enum expansion** can break clients with strict unknown-value handling or exhaustive switches.
- **Rename field** while meaning drifts internally — clients map old name to wrong semantics.

## Pagination and consistency

- Offset pagination can skip/duplicate items when data changes between requests.
- Missing stable sort keys can make cursor pagination unreliable.
- **Cursor without tie-breaker** — duplicates or gaps under concurrent inserts.
- **Replica lag** — list/search appears inconsistent immediately after write.

## Query / list APIs

- **Over-flexible filters** enable expensive queries (DoS) or full table scans.
- **Unstable sort** — same query returns different order across pages.
- **Inconsistent results** between replicas for the same cursor during migration.

## Async APIs and webhooks

- **Webhook retries out-of-order** — consumer must dedupe by `event_id` and tolerate reorder.
- **Callback URL unreachable** — retries exhaust; need DLQ and replay tooling.
- **Job success** but **status endpoint lags** — client sees `running` after completion.
- **Duplicate webhook delivery** — at-least-once requires idempotent handlers.

## Resource modeling

- **Over-nested resources** (`/a/b/c/d/...`) complicate evolution and caching.
- **Multiple canonical URLs** for the same entity confuse caching, links, and authorization.
- **Bulk operations** — partial failure reporting and idempotency per item vs whole batch.

## Security and data leakage

- Overly broad response payloads can leak internal or sensitive fields (**overfetch**).
- Verbose errors can expose implementation details useful for attackers.
- **Internal flags** accidentally exposed in public responses.
- **Public API returns excessive validation detail** — aids probing.
- **404 vs 403** — enumeration or authorization leakage if misapplied.
