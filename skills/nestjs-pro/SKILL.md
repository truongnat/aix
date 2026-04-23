---
name: nestjs-pro
description: |
  Professional NestJS backend development: module design, API/DX quality, security patterns, and production edge cases.

  Use this skill when the user works on NestJS, Node.js APIs, modules, providers, guards, pipes, interceptors, filters, Swagger/OpenAPI, Prisma/TypeORM, microservices, WebSockets, GraphQL, Bull queues, testing (unit/e2e), or asks for Nest code review, DTO validation, exception mapping, lifecycle, or deployment concerns.

  PostgreSQL RLS with Nest: row-level security, tenant context per request, `SET LOCAL` / `set_config`, Prisma transaction + RLS, TypeORM QueryRunner + RLS, RLS with PgBouncer, middleware/interceptor setting tenant before DB, or when combining JWT guards with database policies.

  Triggers: "NestJS", "Nest", "@nestjs", "module", "provider", "inject", "dynamic module", "Guard", "Pipe", "Interceptor", "ExceptionFilter", "ValidationPipe", "Swagger", "OpenAPI", "Prisma", "TypeORM", "MikroORM", "passport", "JWT", "microservice", "Kafka", "RabbitMQ", "Bull", "WebSocket", "GraphQL", "lifecycle", "OnModuleInit", "shutdown hook", "circular dependency", "e2e test", "Jest", "RLS", "row level security", "tenant", "PostgreSQL policy", "set_config", "SET LOCAL", "Cannot resolve dependencies".

metadata:
  short-description: NestJS — API/DX, RLS integration, edge cases, production
---

# NestJS (professional)

Use official [NestJS docs](https://docs.nestjs.com) for API truth; this skill encodes **professional defaults**, **API and developer experience**, and **edge-case awareness**. Confirm **Nest major version** and **ORM / transport** from the project when known.

## When to use

- Designing or refactoring modules, controllers, services, and cross-cutting concerns.
- Reviewing Nest code for DI clarity, validation, security (authz), and consistent HTTP responses.
- Debugging lifecycle, shutdown, transactions, queues, or multi-instance behavior.
- Aligning APIs with predictable errors, DTO contracts, versioning, and documentation (OpenAPI).
- Wiring **PostgreSQL RLS** from Nest: per-request tenant context, Prisma/TypeORM transaction boundaries, pooling (PgBouncer).
- Trigger keywords: `NestJS`, `Guard`, `ValidationPipe`, `Prisma`, `RLS`, `Interceptor`, …

## Workflow

1. Confirm Nest version and ORM/transport; read official docs when APIs change across majors.
2. Apply the principles and topic summaries below; open `references/` when you need depth; for RLS combine with `postgresql-pro` for SQL policies.
3. Respond using **Suggested response format**; note transaction/pool/multi-instance risks.

### Operating principles

1. **Module boundaries** — Feature modules own their domain; shared kernel stays minimal; avoid god modules.
2. **Explicit contracts** — DTOs + `class-validator` / `class-transformer` at the edge; services work with domain types, not raw `any`.
3. **Security by default** — Guards for authz; never trust client input; secrets via `ConfigService`, not env reads scattered in code.
4. **Fail predictably** — Map domain errors to HTTP with `HttpException` or custom filters; avoid leaking stack traces in production.
5. **Verify versions in-repo** — Check `package.json` and Nest migration guides before suggesting APIs that changed across majors.
6. **RLS is enforced in Postgres** — Nest guards are not enough if the policy requires `current_setting`; set context in the same transaction as queries; see [references/postgresql-rls-integration.md](references/postgresql-rls-integration.md) and SQL details in **`postgresql-pro`**.

### API design and DX (summary)

- Consistent **error shape** (status, code, message, optional `details`) for clients and observability.
- **Pagination / filtering** conventions documented once (query DTOs, max limits).
- **OpenAPI** annotations or plugin where the team uses Swagger — keep DTOs the single source of truth.
- **Idempotency** for mutating endpoints where payments or webhooks matter (document keys and storage).
- **Versioning** strategy explicit (URI, header, or media type) before breaking changes accumulate.

Details: [references/api-design-and-dx.md](references/api-design-and-dx.md)

### Tips and tricks (summary)

- Prefer **`@Injectable()`** with explicit constructor injection; use **`@Inject(TOKEN)`** for custom providers and dynamic modules.
- **`ValidationPipe`** with `whitelist`, `forbidNonWhitelisted`, `transform` globally — strip unknown fields early.
- **Scoped providers** (`REQUEST`, `TRANSIENT`) only when needed — understand memory and performance tradeoffs.
- **Interceptors** for logging, timeouts, and response mapping; **Filters** for exception normalization.
- **Testing**: isolate services with mocked providers; e2e with `TestingModule` + real HTTP stack when integration matters.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

- **Circular dependencies** — `forwardRef()` between modules; prefer restructuring boundaries first.
- **Shutdown** — `enableShutdownHooks()` and close DB/queue connections; drain Bull workers gracefully.
- **Transactions** — unit of work boundaries; avoid long-held transactions across `await` to unrelated I/O.
- **Multi-instance** — Bull locks, idempotent jobs; WebSocket adapters with Redis for scale-out.
- **Global state** — avoid mutable singletons holding request data; use `ClsService` / ALS patterns if needed.

Details: [references/edge-cases.md](references/edge-cases.md)

### PostgreSQL RLS with NestJS (summary)

- **Policies** are defined in PostgreSQL — use skill **`postgresql-pro`** for `CREATE POLICY`, `USING` / `WITH CHECK`, and performance.
- In Nest, **set tenant (or actor) context** after auth, **before** queries: `SET LOCAL` or `set_config` inside the **same transaction** as ORM work when using transaction pooling.
- **Prisma**: often `SET` + queries inside `.$transaction()`; verify interaction with connection pool.
- **TypeORM**: prefer `QueryRunner` + transaction so session state does not leak across requests.
- **PgBouncer** transaction mode: **session** variables are unreliable across transactions — align with [postgresql-rls-integration.md](references/postgresql-rls-integration.md).

Details: [references/postgresql-rls-integration.md](references/postgresql-rls-integration.md) — deep link to SQL policies: [postgresql-pro rolevel-security.md](../postgresql-pro/references/rolevel-security.md)

### Decision trees (summary)

- **Guard vs Middleware vs Interceptor vs Pipe vs Filter** — choose by where logic must run (authz → Guard; raw pipeline → Middleware; response shaping → Interceptor).
- **Dynamic module vs static**, **request scope vs singleton** — see binary trees in the reference.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

- Fat controllers, missing `whitelist` on `ValidationPipe`, `Scope.REQUEST` overuse, `forwardRef` as first fix, RLS confusion — expanded list in reference.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

- When combining with **`postgresql-pro`**, **`auth-pro`**, **`testing-pro`**, **`api-design-pro`** — ownership split in table form.

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

- Nest major jumps affect Fastify/Express adapters, Swagger, GraphQL — always use official migration guide for your **from → to** pair.

Details: [references/versions.md](references/versions.md)

### Suggested response format (implement / review)

1. **Issue or goal** — What is wrong or what we are building.
2. **Recommendation** — Nest patterns, module placement, security or DX impact.
3. **Code** — Minimal module/controller/service/DTO snippets or diff-style blocks.
4. **Residual risks** — Migration steps, load testing, or ops follow-up.

## Resources in this skill

- `references/` — API design, tips, edge cases, Postgres RLS integration.

| Topic | File |
|-------|------|
| API design and DX | [references/api-design-and-dx.md](references/api-design-and-dx.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| **PostgreSQL RLS + Nest** | [references/postgresql-rls-integration.md](references/postgresql-rls-integration.md) |
| RLS SQL (PostgreSQL) | [postgresql-pro rolevel-security.md](../postgresql-pro/references/rolevel-security.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Simple (common)

**Input:** Need to set `app.tenant_id` before every Prisma query in a multi-tenant request; using PgBouncer transaction mode.  
**Expected output:** Suggest `.$transaction()` + `SET LOCAL`, warn about session vs transaction pool, and link `postgresql-rls-integration.md` / `postgresql-pro`.

### 2 — Tricky (edge case)

**Input:** Global `ValidationPipe` with `whitelist` still allows an unexpected field through a nested DTO — clients send `isAdmin: true`.  
**Expected output:** Recommend `forbidNonWhitelisted`, nested DTO types, and stripping at serialization layer; never trust client for authz (`auth-pro`).

### 3 — Cross-skill

**Input:** New microservice shares Bull queue with monolith — jobs sometimes processed twice.  
**Expected output:** **`nestjs-pro`** Bull module idempotency + worker config; **`deployment-pro`** rollout order; align with **`testing-pro`** for job contract tests.

## Checklist before calling the skill done

- [ ] DTOs validated at boundary; sensitive fields never exposed in responses (`@Exclude` / serializers).
- [ ] Authn/authz applied consistently (global guard or per-route metadata).
- [ ] Errors mapped to HTTP semantics; no raw DB errors to clients in production.
- [ ] Logging structured (request id) where applicable; PII redaction policy respected.
- [ ] Database migrations or schema changes reviewed; transactions for multi-step writes.
- [ ] **RLS**: if using Postgres RLS, tenant context is set correctly for pool + ORM; policies tested as app DB role (see `postgresql-pro`).
- [ ] Tests cover happy path + at least one failure mode for critical flows.
- [ ] Decision-tree reference consulted when choosing Guard vs Middleware vs Interceptor for new cross-cutting behavior.
