# API design — anti-patterns

## 200 with error body

- Clients and caches assume success; retries behave wrongly.
- **Fix:** Use 4xx/5xx with consistent error envelope.

## Undocumented `null` vs omitted field

- Clients cannot evolve safely; patch semantics break.
- **Fix:** State JSON merge rules; use OpenAPI `nullable` explicitly.

## Pagination without total strategy

- Offset on huge tables = DB pain; cursor without stable sort = duplicates/gaps.
- **Fix:** Choose model per dataset; document.

## Breaking rename without version bump

- Silent client failures.
- **Fix:** Additive fields first; deprecate; major version or dual-write period.

## No idempotency on POST that creates billable resources

- Retries double-charge or duplicate entities.
- **Fix:** Idempotency-Key header or natural keys.

## Leaking internal IDs in errors

- Enumeration and pivot for attackers.
- **Fix:** Opaque public IDs; correlate with internal id in logs only.
