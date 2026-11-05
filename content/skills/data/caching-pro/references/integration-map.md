# Caching — integration map

| Skill | When |
|-------|------|
| **`deployment-pro`** | CDN deploy, cache purge, rollout, circuit breaker rollout. |
| **`network-infra-pro`** | Edge, TLS, LB cache headers path, partition behavior. |
| **`nextjs-pro`** / **`react-pro`** | Data cache, SWR/React Query, RSC cache. |
| **`postgresql-pro`** | Query shape, replicas, read-after-write vs replica lag. |
| **`sql-data-access-pro`** | Fix queries before masking with cache. |
| **`performance-tuning-pro`** | End-to-end latency and profiling. |
| **`seo-pro`** | `Cache-Control` impact on crawl (stale content risk). |
| **`api-design-pro`** | HTTP caching headers, cache-friendly contract semantics. |
| **`security-pro`** | Cache poisoning, auth-aware keys, sensitive data — **`cache-security-and-isolation.md`**. |

**Boundary:** **`caching-pro`** owns cache **architecture**, **consistency story**, **invalidation**, **failure degradation**, and **cost framing**; paired skills own framework/DB/security implementation details.
