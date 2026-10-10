# Decision framework and trade-offs

## Monolith schema vs federation

| Choice | Upside | Downside |
|--------|--------|----------|
| **Single schema** | Simpler deploy; easier refactors | Team scaling limits |
| **Federation / subgraphs** | Team boundaries | Composition rules; version skew — **`edge-cases.md`** |

## Code-first vs schema-first

| Choice | Fits |
|--------|------|
| **Schema-first** | Strong review of SDL; codegen for resolvers |
| **Code-first** | Fast iteration; risk schema drift — document export policy |

## GraphQL alongside REST

- **Hybrid** APIs common: use GraphQL for **aggregated reads**; keep **REST** for uploads/binary if simpler — **`api-design-pro`**.

## Cost controls

| Control | Trade-off |
|---------|-----------|
| **Persisted queries / APQ** | Blocks ad-hoc queries; strong cache |
| **Complexity/depth limits** | May reject legitimate rare queries — tune allowlists |

## Pagination

| Pattern | Notes |
|---------|-------|
| **Relay cursor** | Stable paging; more boilerplate |
| **Offset/limit** | Simple; unstable under concurrent writes |
