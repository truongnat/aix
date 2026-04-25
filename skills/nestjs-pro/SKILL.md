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