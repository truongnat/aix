# GraphQL — integration map

| Skill | Combine when |
|-------|----------------|
| **`api-design-pro`** | REST coexistence, versioning, error semantics alignment. |
| **`security-pro`** | Introspection abuse, authZ gaps, query cost attacks. |
| **`nestjs-pro`** | Code-first vs schema-first; guards on resolvers. |
| **`postgresql-pro`** | SQL performance, RLS — not in GraphQL layer alone. |
| **`testing-pro`** | Operation tests, snapshot SDL, integration against test DB. |
| **`caching-pro`** | APQ, CDN edge caching for GET queries, Redis response cache semantics. |

**Boundary:** **`graphql-pro`** owns schema/resolver contract; DB and HTTP gateway details split per sibling skills.
