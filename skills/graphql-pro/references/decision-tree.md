# GraphQL — decision tree

## Schema shape

- **Stable product concepts** → Types reflect domain nouns; avoid DB-shaped leakage.
- **Highly relational reads** → Consider DataLoader batching; document N+1 policy.

## Mutations

- **Side effects + retries** → Idempotency key in input or natural idempotency; return union/errors clearly.
- **Simple CRUD** → One mutation per use case vs generic `updateAnything` — prefer explicit.

## Federation

- **Multiple teams, shared graph** → Subgraph ownership rules; avoid duplicate type names.
- **Single team** → Monolith schema first; add federation when ownership splits.

## Security

- **Public internet** → Depth/complexity limits; disable or gate introspection in prod if needed.
- **Internal only** → Still authZ per field; logs may contain sensitive args.

## Persisted queries vs open query surface

```
Need arbitrary ad-hoc queries from clients?
├── Yes → Strong complexity/depth limits + monitoring
└── Prefer known operations only → Persisted queries / APQ — **`decision-framework-and-trade-offs.md`**, **`caching-pro`**
```
