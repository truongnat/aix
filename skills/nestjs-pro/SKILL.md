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

1. Confirm Nest version, ORM, adapters; check migration guides for breaking changes.
2. Apply summaries; open `references/`; defer SQL policy bodies to **`postgresql-pro`**.
3. Respond with **Suggested response format**; **failure modes** for auth, validation, RLS, jobs.

### Operating principles

1. **Feature modules** — Clear boundaries — **`nestjs-runtime-pipeline-and-di-model.md`**.
2. **DTOs at edge** — `ValidationPipe` + whitelist/forbid — **`tips-and-tricks.md`**.
3. **Security** — Guards for authz; secrets via `ConfigService` — **`failure-modes-detection-mitigation.md`**.
4. **Predictable errors** — Filters — **`api-design-and-dx.md`**.
5. **RLS in Postgres** — Nest sets context in correct transaction — **`postgresql-rls-integration.md`**.

### NestJS runtime pipeline and DI model (summary)

Middleware → guards → pipes → controller; scopes — **`nestjs-runtime-pipeline-and-di-model.md`**.

Details: [references/nestjs-runtime-pipeline-and-di-model.md](references/nestjs-runtime-pipeline-and-di-model.md)

### Failure modes — detection and mitigation (summary)

Mass assignment, error leaks, RLS/PgBouncer, Tx scope, Bull duplicates — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

HTTP vs microservice transport, validation strictness, ORM fit — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Version-accurate decorators; correct RLS doc links — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### API design and DX (summary)

Errors, pagination, OpenAPI — **`api-design-and-dx.md`**.

Details: [references/api-design-and-dx.md](references/api-design-and-dx.md)

### Tips and tricks (summary)

DI, ValidationPipe, testing — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Circular deps, shutdown, scope, Tx, Bull, WS — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### PostgreSQL RLS with NestJS (summary)

Tenant context + ORM — **`postgresql-rls-integration.md`**; SQL policies — **`postgresql-pro`**: [row-level-security.md](../postgresql-pro/references/row-level-security.md)

Details: [references/postgresql-rls-integration.md](references/postgresql-rls-integration.md)

### Decision trees (summary)

Guard vs middleware vs pipe — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Fat controllers, `forwardRef` abuse — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

Cross-skill ownership — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

Nest majors, adapters — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Nest version, ORM, Express/Fastify, single app vs hybrid transport.
2. **Problem / goal** — Feature, bug, review, RLS tenant wiring.
3. **System design** — Module placement; pipeline hook (guard/pipe/filter) — **`nestjs-runtime-pipeline-and-di-model.md`**.
4. **Decision reasoning** — From **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`** (scope, validation strictness).
5. **Implementation sketch** — Minimal Nest snippets; match project major — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Request scope cost; Fastify vs Express; strict DTOs vs client friction.
7. **Failure modes** — Auth, validation, DB, jobs — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Migrations, load tests; **`postgresql-pro`**, **`deployment-pro`**, **`auth-pro`** handoffs.

## Resources in this skill

| Topic | File |
|-------|------|
| **Runtime pipeline & DI model** | [references/nestjs-runtime-pipeline-and-di-model.md](references/nestjs-runtime-pipeline-and-di-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| API design and DX | [references/api-design-and-dx.md](references/api-design-and-dx.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| **PostgreSQL RLS + Nest** | [references/postgresql-rls-integration.md](references/postgresql-rls-integration.md) |
| RLS SQL (PostgreSQL) | [row-level-security.md](../postgresql-pro/references/row-level-security.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Set tenant before Prisma queries; PgBouncer transaction mode.  
**Expected output:** Full **Suggested response format** — `.$transaction` + `SET LOCAL` — **`postgresql-rls-integration.md`** — **`failure-modes-detection-mitigation.md`**.

### 2 — Tricky (edge case)

**Input:** `whitelist` still allows nested `isAdmin`.  
**Expected output:** `forbidNonWhitelisted`, nested DTOs — **`failure-modes-detection-mitigation.md`** — **`auth-pro`** for authz.

### 3 — Cross-skill

**Input:** Bull queue shared — duplicate jobs.  
**Expected output:** **`nestjs-pro`** idempotency — **`deployment-pro`** rollout — **`testing-pro`** contracts — **`failure-modes-detection-mitigation.md`**.

## Checklist before calling the skill done

### Boundary & safety

- [ ] DTO validation + **no** sensitive fields in responses — **`tips-and-tricks.md`**.
- [ ] Authz via **Guards**; not only pipes — **`nestjs-runtime-pipeline-and-di-model.md`**.
- [ ] Production errors sanitized — **`failure-modes-detection-mitigation.md`**.

### Data & RLS

- [ ] **RLS**: tenant context + transaction + pool mode — **`postgresql-rls-integration.md`**.
- [ ] Transactions short; no external I/O inside — **`edge-cases.md`**.

### Ops & testing

- [ ] Shutdown hooks for DB/queues — **`edge-cases.md`**.
- [ ] Critical paths have failure-oriented tests — **`testing-pro`**.
- [ ] **Decision tree** used for new Guard vs Middleware vs Interceptor — **`decision-tree.md`**.
