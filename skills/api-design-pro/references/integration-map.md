# API design — integration map

| Skill | Combine when |
|-------|----------------|
| **`security-pro`** | AuthZ on every sensitive route; rate limits; PII in logs/responses; webhook abuse. |
| **`testing-pro`** | Contract tests, consumer-driven contracts, chaos on timeouts. |
| **`graphql-pro`** | If API is GraphQL — schema evolution, resolver errors vs HTTP. |
| **`nestjs-pro` / `nextjs-pro`** | Framework routing, guards, server actions — map to HTTP semantics. |
| **`deployment-pro`** | Blue/green, canary — mixed versions for clients; outbox / async emit; pair with platform metrics/logging for deprecation traffic and **`traceparent`** adoption — **`observability-and-api-governance.md`**. |

**Boundary:** `api-design-pro` owns contract shape, resource/mutation/query semantics, and evolution; implementations live in stack skills.
