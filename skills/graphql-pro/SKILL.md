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

1. Confirm stack, federation vs monolith, client patterns (persisted ops vs ad hoc).
2. Apply summaries; open `references/`; defer **infra caching** nuance to **`caching-pro`** when edge/CDN dominates.
3. Respond with **Suggested response format**; cite **failure modes** for prod GraphQL paths.

### Operating principles

1. **Schema reflects domain**, not tables — **`graphql-execution-and-schema-system-model.md`**.
2. **Resolvers explicit** — Validation, authZ, errors consistent — **`tips-and-tricks.md`**.
3. **Performance is contract** — Batch, limit, observe — **`failure-modes-detection-mitigation.md`**.
4. **Evolution additive-first** — Deprecate before remove — **`edge-cases.md`**.
5. **Security per field** — Not only HTTP middleware — **`edge-cases.md`**.

### GraphQL execution and schema model (summary)

Parse/validate/execute; root operations; domain vs storage shape — **`graphql-execution-and-schema-system-model.md`**.

Details: [references/graphql-execution-and-schema-system-model.md](references/graphql-execution-and-schema-system-model.md)

### Failure modes — detection and mitigation (summary)

N+1, non-null propagation, DoS queries, federation skew, subscriptions — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Monolith vs federation, code-first vs schema-first, pagination, persisted queries — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Stack-accurate directives/resolvers; no bogus SDL — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### GraphQL tips and tricks (summary)

DataLoader, complexity, narrow types — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Nullability, auth leaks, federation, GET/cache — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision tree (summary)

Schema shape, mutations, federation, security, persisted queries — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

N+1, nullable churn, leaky extensions — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`api-design-pro`**, **`security-pro`**, **`nestjs-pro`**, **`postgresql-pro`**, **`testing-pro`**, **`caching-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Stack versions (summary)

Server/federation/router pins — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Stack, monolith vs federation, client query mode (persisted vs open), environments.
2. **Problem / goal** — Schema change, resolver perf, security audit, fed composition error.
3. **System design** — Where issue sits: validation vs resolver vs transport — **`graphql-execution-and-schema-system-model.md`**.
4. **Decision reasoning** — Patterns from **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`** (pagination, limits, federation).
5. **Implementation sketch** — SDL/resolver/config snippets matching named stack — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Flexibility vs persisted ops; nullable migration pain; fed operational cost.
7. **Failure modes** — Top risks for this design — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Client breakage, skewed subgraphs; handoff to **`security-pro`**, **`postgresql-pro`**, **`caching-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Execution & schema model** | [references/graphql-execution-and-schema-system-model.md](references/graphql-execution-and-schema-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Review resolver layer for N+1 and auth gaps before release.  
**Expected output:** Full **Suggested response format** — DataLoader/batch plan; field authZ checklist; **failure modes** N+1 and leaks.

### 2 — Tricky (edge case)

**Input:** Introspection enabled in production — audit flagged.  
**Expected output:** Threat model; gate introspection; pair **`security-pro`**; **residual risks** if schema must stay discoverable.

### 3 — Cross-skill

**Input:** Federation — two subgraphs expose `User.name` with different nullability.  
**Expected output:** Composition failure explanation; ownership; migration — **`edge-cases.md`**; **`api-design-pro`** for deprecation narrative.

## Checklist before calling the skill done

### Contract & execution

- [ ] Schema/resolver responsibilities clear — **`graphql-execution-and-schema-system-model.md`**.
- [ ] N+1 and **cost controls** addressed — **`failure-modes-detection-mitigation.md`**.
- [ ] Nullable/non-null client impact assessed — **`edge-cases.md`**.

### Security & ops

- [ ] **Field-level** authZ not only route auth — **`edge-cases.md`**.
- [ ] Subscriptions scaling noted if applicable — **`edge-cases.md`**.
- [ ] Introspection/query abuse considered — **`security-pro`** when non-trivial.

### Deliverable

- [ ] Concrete SDL/resolver/checklist in response — **`quality-validation-and-guardrails.md`** for stack honesty.
- [ ] **Residual risks**: migration, monitoring, fed/router versions — **`versions.md`**.
