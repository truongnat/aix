# GraphQL — anti-patterns

## Resolver per row without batching

- Classic **N+1**; kills DB under load.
- **Fix:** DataLoader or dataloader-equivalent; join/select in service layer.

## Nullable churn breaking clients

- Tightening `String` → `String!` breaks generated clients.
- **Fix:** Deprecation path; optional intermediate fields.

## God `Query` root

- Hundreds of fields with no grouping hurts discoverability and auth review.
- **Fix:** Namespaces or split graphs with clear boundaries.

## Returning stack traces in `errors.extensions`

- Leaks internals to clients.
- **Fix:** Sanitize extensions; log server-side with correlation id.

## Unbounded list fields

- Single query pulls entire table.
- **Fix:** Pagination args, max limits, complexity scoring.

## Auth only on HTTP layer

- Misses field-level leaks via nested resolvers.
- **Fix:** Enforce rules in context or per-field directives.
