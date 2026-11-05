# Query, filtering, search, and projection

List/search endpoints need **bounded cost** and predictable semantics.

## Filtering

- **Allow-list** filter fields and operators — avoid arbitrary SQL-like strings unless gated (admin-only).
- **Compound filters** — define precedence (AND default); document escaping.

## Sorting

- **Allow-list** sort keys; **stable tie-breaker** (e.g. `id`) always — critical for cursor pagination.

## Pagination

- Match **`tips-and-tricks.md`** / **`edge-cases.md`** — cursor includes tie-breaker.

## Search

- Dedicated **`/search`** or `q=` — document relevance vs exact match; timeouts; max rows.

## Projection / sparse fieldsets

- `fields=` or GraphQL-like selection — reduces overfetch; document defaults.

## Include / expand

- Avoid **N+1** fan-out surprises — cap depth/count; document performance.

## Cost and abuse

- **Max page size**; **query complexity** limits; **429** for expensive queries.

## Review checklist

- [ ] Filters/sorts are **enumerated** in spec, not open-ended where risky.
- [ ] Cursor pagination has **stable ordering** definition.
