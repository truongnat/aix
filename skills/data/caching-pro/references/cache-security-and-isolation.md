# Cache security and isolation

Caches are **shared fast storage** — easy to **leak** or **poison**.

## Isolation

- **Tenant / user** in **key prefix** — never cache **only** by guessable sequential id without auth binding.
- **Shared CDN URL** must not serve **personalized** body — **`Cache-Control: private`** or vary correctly — **`nextjs-pro`**.

## Threats

| Threat | Mitigation |
|--------|------------|
| **Cache poisoning** | Validate origin responses before cache; don’t cache on **4xx** except explicit policy |
| **Key guessing** | Opaque IDs; rate limit origin by IP if needed — **`security-pro`** |
| **Sensitive data in cache** | Encrypt at rest if policy requires; minimize PII in keys and values |
| **Cross-user leakage** | Auth-aware cache partition; integration tests for isolation |

## Auth-aware caching

- **Per-user** entries — key includes **principal** or **session-scoped** segment.
- **Public shared** — OK for identical representation for all users.

Pair **`security-pro`** for threat modeling; **`api-design-pro`** for cache header contracts on APIs.
