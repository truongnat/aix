---
name: graphql-pro
description: |
  Production-grade GraphQL: schema design, resolver architecture, execution model (parse → validate → execute), performance (N+1, DataLoader, complexity limits), security (field-level authZ, introspection, query abuse), federation/monolith trade-offs — plus failure modes (null propagation, DoS queries, federated skew, subscription overload), decision framework (pagination, persisted queries, REST coexistence), quality guardrails (server-accurate directives and resolver APIs).

  Use this skill when designing GraphQL schemas, implementing resolvers, reviewing query/mutation/subscription patterns, stabilizing GraphQL in production, or tuning Apollo/Mercurius/Yoga/other servers.

  Combine with **`api-design-pro`** for contract governance, **`security-pro`** for GraphQL-specific hardening, **`nestjs-pro`** / **`postgresql-pro`** / **`testing-pro`** / **`caching-pro`** per integration map.

  Triggers: "graphql", "schema", "resolver", "query", "mutation", "subscription", "n+1", "dataloader", "federation", "persisted query", "graphql edge case", "Apollo", "Mercurius", "complexity limit", "introspection", "GraphQL Playground".

metadata:
  short-description: GraphQL — execution model, schema/resolvers, performance, security, failure modes
  content-language: en
  domain: graphql
  level: professional
---

# GraphQL (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [GraphQL Specification](https://spec.graphql.org/), [GraphQL over HTTP](https://graphql.github.io/graphql-over-http/), and [GraphQL.org learn](https://graphql.org/learn/) for standards truth; this skill encodes **schema-first modeling**, **resolver discipline**, and **production-safe** performance and security defaults.

## Boundary

**`graphql-pro`** owns **GraphQL contract** (SDL shape, resolver behavior per field), **execution concerns** (batching, limits), and **schema evolution**. **`api-design-pro`** owns **cross-protocol** governance when REST and GraphQL coexist at product level; **`postgresql-pro`** owns **SQL tuning** beneath resolvers; **`security-pro`** owns **threat modeling** breadth beyond GraphQL defaults.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`api-design-pro`** | Versioning, errors, deprecation alongside REST |
| **`security-pro`** | Introspection policy, authZ depth, abusive queries |
| **`nestjs-pro`** | Code-first GraphQL module, guards, DI |
| **`postgresql-pro`** | Indexes, RLS, query plans under dataloaders |
| **`testing-pro`** | Operation tests, SDL snapshots, integration DB |
| **`caching-pro`** | APQ, CDN caching of GET queries, Redis layers |

## When to use

- Types, fields, mutations, subscriptions design.
- Resolver review: N+1, batching, errors, authZ per field.
- Latency/cost: complexity limits, DataLoader patterns.
- Backward-compatible evolution, deprecation.
- Federation ownership and composition issues.

## When not to use

- **Pure REST/OpenAPI** design — **`api-design-pro`** unless comparing hybrid.
- **Database schema design only** — **`postgresql-pro`** (pair when resolvers touch SQL).

## Required inputs

- **Server stack** (Apollo Server, Mercurius, Yoga, Nest GraphQL module, …).
- **Single graph vs federation** and gateway/router if applicable.

## Expected output

Follow **Suggested response format** strictly — execution model through operational risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** stack, federation vs monolith, client patterns (persisted ops vs ad hoc). → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.