# Decision framework and trade-offs

## Monolith Nest vs microservice transport

| Shape | When |
|-------|------|
| **Single HTTP app** | Default; simplest ops |
| **`@nestjs/microservices`** | Internal RPC/events; adds serialization/versioning tax — **`microservices-pro`** |

## Validation strictness

| Level | Trade-off |
|-------|-----------|
| **`whitelist` only** | Strips unknown fields; may hide client bugs |
| **`forbidNonWhitelisted`** | Fails closed; better for admin surfaces |

## OpenAPI vs code-first clarity

| Approach | Notes |
|----------|-------|
| **DTO decorators drive Swagger** | Single source of truth |
| **Separate schema files** | Drift risk unless CI checks |

## ORM choice (within Nest)

| ORM | Nest fit |
|-----|----------|
| **Prisma** | Great DX; transaction API for RLS patterns |
| **TypeORM** | `QueryRunner` fits session-style RLS |
| **MikroORM** | Unit of work semantics — verify RLS story |
