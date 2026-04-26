---
name: nestjs-pro
description: |
  Production-grade NestJS backend development: modules, DI, HTTP pipeline (middleware → guards → pipes → interceptors → filters), API/DX, security patterns, testing, queues — plus runtime/DI model, failure modes (DTO bypass, error leak, RLS/PgBouncer, long Tx, Bull duplicates), trade-offs (Fastify vs Express, strict validation, monolith vs microservice transport), quality guardrails (Nest major accuracy; RLS needs Postgres policies).

  Use this skill for NestJS, Node APIs, guards/pipes/interceptors, Swagger, Prisma/TypeORM/MikroORM, microservices, WebSockets, GraphQL, Bull, lifecycle, PostgreSQL RLS wiring from Nest.

  Combine with **`postgresql-pro`**, **`auth-pro`**, **`security-pro`**, **`testing-pro`**, **`api-design-pro`**, **`deployment-pro`**, **`graphql-pro`**, **`microservices-pro`**, **`caching-pro`**, **`ci-cd-pro`** per integration map.

  Triggers: "NestJS", "Nest", "@nestjs", "module", "provider", "inject", "dynamic module", "Guard", "Pipe", "Interceptor", "ExceptionFilter", "ValidationPipe", "Swagger", "OpenAPI", "Prisma", "TypeORM", "MikroORM", "passport", "JWT", "microservice", "Kafka", "RabbitMQ", "Bull", "WebSocket", "GraphQL", "lifecycle", "OnModuleInit", "shutdown hook", "circular dependency", "e2e test", "Jest", "RLS", "row level security", "tenant", "PostgreSQL policy", "set_config", "SET LOCAL", "Cannot resolve dependencies".

metadata:
  short-description: NestJS — pipeline/DI model, API/DX, RLS integration, failure modes
  content-language: en
  domain: nestjs
  level: professional
---

# NestJS (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [NestJS docs](https://docs.nestjs.com) for API truth; this skill encodes **module discipline**, **request pipeline clarity**, and **production-safe** defaults.

## Boundary

**`nestjs-pro`** owns **Nest application structure**, **DI**, **HTTP/microservice pipeline**, and **ORM wiring patterns** inside Nest. **`postgresql-pro`** owns **SQL**, **RLS policies**, and pool semantics; **`auth-pro`** owns **identity protocol** depth; **`security-pro`** owns **threat modeling** beyond Nest defaults.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`postgresql-pro`** | Migrations, `CREATE POLICY`, pool modes, `EXPLAIN` |
| **`auth-pro`** | JWT/OAuth strategies, token lifecycle |
| **`security-pro`** | Threat review, OWASP-style abuse |
| **`testing-pro`** | Coverage strategy beyond `TestingModule` setup |
| **`api-design-pro`** | Resource modeling, versioning narrative |
| **`deployment-pro`** | Rollout, traffic switching |
| **`graphql-pro`** | Schema/resolver design when using `@nestjs/graphql` |
| **`microservices-pro`** | Distributed boundaries |
| **`caching-pro`** | Cache invalidation policy |
| **`ci-cd-pro`** | Pipeline structure |

## When to use

- Modules, controllers, services, cross-cutting concerns.
- Validation, guards, errors, OpenAPI.
- Lifecycle, shutdown, transactions, queues, multi-instance.
- PostgreSQL RLS + Nest (tenant context, transactions, PgBouncer).

## When not to use

- **Pure SQL tuning** without Nest wiring — **`postgresql-pro`**.
- **Pure Git/CI YAML** — **`ci-cd-pro`** when Nest isn’t the topic.

## Required inputs

- **Nest major**, **ORM**, **HTTP adapter** (Express/Fastify), **transport** if microservices.

## Expected output

Follow **Suggested response format** strictly.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** Nest version, ORM, adapters; check migration guides for breaking changes. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm Nest major, transport, adapter, ORM, and request lifecycle boundaries before proposing any fix. Ask when module ownership or runtime context is unclear.
2. **Simplicity First** — Prefer the smallest controller/service/module change that preserves Nest conventions. Avoid creating new providers, dynamic modules, or interceptors unless clearly required.
3. **Surgical Changes** — Touch only the module graph, request pipeline stage, or persistence boundary directly involved in the issue. No opportunistic folder rewrites.
4. **Goal-Driven Execution** — Done = the target request flow behaves correctly under the intended transport, with validation/auth/error handling verified.
5. **Pipeline order is a contract** — Middleware, guards, pipes, interceptors, and filters solve different problems; use the correct stage instead of stacking everything into services.
6. **DI clarity over magic** — Provider scope, tokens, and module exports should stay explicit; circular workarounds are a last resort.
7. **Validation at the edge** — DTO validation, coercion, and serialization rules belong at the boundary, not scattered through business logic.
8. **Infrastructure claims need proof** — RLS, queues, caching, and transport guarantees must match the real backing system, not just Nest wrappers.

## Default recommendations by scenario

- **HTTP API bug** — Check controller boundary, validation pipe, guard order, and exception mapping before editing service logic.
- **Dependency injection bug** — Inspect provider registration/export/import graph before reaching for `forwardRef`.
- **Background job bug** — Separate Nest handler logic from queue delivery semantics and deduplication policy.
- **RLS or transaction bug** — Confirm how request context reaches the DB connection before changing DTOs or auth code.

## Decision trees

Summary: first locate whether the problem sits in module wiring, request pipeline, transport boundary, or persistence integration, then apply the smallest Nest-native fix.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: bloated modules, service-layer validation, filter/interceptor misuse, blanket `forwardRef`, and pretending ORM defaults solve database isolation or security.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Nest runtime pipeline and DI model (summary)

How requests move through Nest and how providers resolve so lifecycle bugs can be diagnosed structurally.

Details: [references/nestjs-runtime-pipeline-and-di-model.md](references/nestjs-runtime-pipeline-and-di-model.md)

### Failure modes and mitigation (summary)

DTO bypass, leaked errors, provider resolution mistakes, queue duplication, and mis-scoped database context.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### PostgreSQL RLS integration (summary)

How tenant/app context should flow from Nest request handling into the real database role and session state.

Details: [references/postgresql-rls-integration.md](references/postgresql-rls-integration.md)

### API design and DX (summary)

How Nest surface choices affect OpenAPI quality, DTO stability, and client-facing consistency.

Details: [references/api-design-and-dx.md](references/api-design-and-dx.md)

### Versions (summary)

Version notes that affect decorators, adapters, package compatibility, and migration constraints.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Nest version, adapter, ORM, transport, and the pipeline/module boundary in scope.
2. **Pipeline or DI analysis** — Explain where the issue lives in Nest’s lifecycle or dependency graph.
3. **Solution** — Minimum module/controller/service/config change with rationale.
4. **Verification** — Exact request flow, test, or command that proves the fix.
5. **Residual risks** — Remaining transport, DB, security, or rollout caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Nest runtime pipeline and DI model | [references/nestjs-runtime-pipeline-and-di-model.md](references/nestjs-runtime-pipeline-and-di-model.md) |
| PostgreSQL RLS integration | [references/postgresql-rls-integration.md](references/postgresql-rls-integration.md) |
| API design and DX | [references/api-design-and-dx.md](references/api-design-and-dx.md) |
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

**Input:** "Validation passes locally but invalid payloads still reach my service in production."
- Check whether `ValidationPipe` is actually applied at the global/controller/route boundary and whether transformation/whitelisting options match intent.
- Fix the boundary configuration before adding manual service guards.
- **Verify:** A malformed request now fails with the intended status code and never reaches business logic.

**Input (tricky):** "Nest cannot resolve dependencies after I split a module."
- Inspect provider export/import ownership first; `forwardRef` is not the default fix.
- Restore a clear module graph or extract a shared provider module only if the dependency is truly shared.
- **Verify:** Boot succeeds and the provider is resolved from exactly one intended module path.

**Input (cross-skill):** "Tenant RLS works in dev but leaks in pooled production traffic."
- Pair **`postgresql-pro`** to validate pool mode and session state semantics; Nest alone cannot guarantee DB isolation.
- Ensure tenant context is set on the real connection/transaction boundary, not only on request DTOs.
- **Verify:** Cross-tenant access tests fail under the same pool mode used in production.

## Checklist before calling the skill done

- [ ] Nest version, adapter, ORM, and transport confirmed before proposing changes (Think Before Coding)
- [ ] Minimum Nest-native change chosen; no unnecessary new module/provider abstractions (Simplicity First)
- [ ] Only the affected pipeline stage, module, or persistence boundary was changed (Surgical Changes)
- [ ] Success criteria and request-flow verification are explicit and validated (Goal-Driven Execution)
- [ ] Validation/auth/error handling lives at the correct boundary layer
- [ ] DI ownership and provider exports/imports remain explicit
- [ ] Database, queue, or cache guarantees are verified against the real backing system where relevant
- [ ] Residual rollout or transport-specific caveats are documented
