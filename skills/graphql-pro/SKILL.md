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

### Operating principles

1. **Think Before Coding** — Confirm server stack, graph topology, and client query patterns before proposing schema or resolver changes. Ask when federation ownership or authZ boundary is unclear.
2. **Simplicity First** — Prefer the smallest schema or resolver change that preserves contract clarity. Do not introduce custom directives, federation layers, or caching systems unless required.
3. **Surgical Changes** — Touch only the relevant field, type, resolver, or execution control. Avoid unrelated SDL cleanup or global error-policy rewrites.
4. **Goal-Driven Execution** — Done = the contract behaves correctly under GraphQL execution rules, and performance/authZ assumptions are verified.
5. **Schema is product contract** — Field names, nullability, and mutation semantics are API decisions, not implementation details.
6. **Resolver work is per field** — N+1, authZ leaks, and inconsistent error handling usually come from field-level behavior, not the top-level query alone.
7. **Nullability is a blast-radius control** — Choosing nullable vs non-null affects failure propagation and client breakage.
8. **Query cost must be bounded** — Production safety requires limits, batching, or persisted operations when clients can shape expensive queries.

## Default recommendations by scenario

- **New schema surface** — Model the smallest stable type and field set before adding convenience expansions.
- **Resolver performance issue** — Check batching, query shape, and SQL/path cost before changing schema.
- **AuthZ issue** — Verify field-level ownership and null/error behavior before broad middleware fixes.
- **Federation issue** — Clarify entity ownership and contract boundaries before adding router workarounds.

## Decision trees

Summary: choose the fix based on whether the issue is schema contract, field execution, query cost, or federation ownership.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: nullable contracts by accident, resolvers doing hidden N+1 work, broad introspection or query-cost exposure, and schema churn that masks ownership problems.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### GraphQL execution and schema system model (summary)

How parse, validate, execute, null propagation, and resolver composition actually work so contract and runtime issues stay explainable.

Details: [references/graphql-execution-and-schema-system-model.md](references/graphql-execution-and-schema-system-model.md)

### Failure modes and mitigation (summary)

N+1, null cascades, DoS-style queries, federation skew, and subscription overload patterns to detect before production pain.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

How to choose schema patterns, pagination models, query controls, and coexistence with REST or other backends.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Versions (summary)

Version-sensitive server or spec notes that affect directives, transport, and execution controls.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Server stack, monolith vs federation, client query style, and persistence/authZ boundaries.
2. **Execution model** — Explain the relevant schema, resolver, nullability, or query-cost behavior.
3. **Solution** — Minimum SDL/resolver/control change with rationale.
4. **Verification** — Query examples, performance checks, or authZ tests that prove the fix.
5. **Residual risks** — Remaining nullability, cost, federation, or client-migration caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| GraphQL execution and schema system model | [references/graphql-execution-and-schema-system-model.md](references/graphql-execution-and-schema-system-model.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "This query is slow because each product resolves inventory separately."
- Inspect resolver fan-out and add batching at the field boundary before redesigning the schema.
- Keep the contract stable while fixing execution cost.
- **Verify:** The same query drops from N+1 database calls to a bounded batch pattern.

**Input (tricky):** "A non-null field occasionally throws and breaks the whole query."
- Explain null propagation and decide whether the contract should stay non-null or the resolver must harden.
- Fix the smallest correct layer: resolver guarantees or schema nullability.
- **Verify:** Partial failures behave exactly as the intended contract specifies.

**Input (cross-skill):** "We need field-level auth on tenant data backed by Postgres."
- Pair **`security-pro`** for threat framing and **`postgresql-pro`** for underlying policy/data guarantees.
- Ensure resolver logic and data-layer isolation tell the same truth.
- **Verify:** Unauthorized fields resolve safely and tenant data cannot be inferred through query shape.

## Checklist before calling the skill done

- [ ] Server stack, graph topology, and client query patterns confirmed first (Think Before Coding)
- [ ] Minimum schema/resolver/control change chosen; no unnecessary platform complexity added (Simplicity First)
- [ ] Only the affected field/type/resolver surface was changed (Surgical Changes)
- [ ] Success criteria and query/performance/authZ verification are explicit and validated (Goal-Driven Execution)
- [ ] Nullability and error behavior are intentional, not accidental
- [ ] N+1 or query-cost implications are considered where relevant
- [ ] Field-level authZ and data-layer guarantees stay aligned
- [ ] Residual federation or client-migration risks are documented
