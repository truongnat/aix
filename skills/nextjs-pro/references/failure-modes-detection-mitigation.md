# Failure modes — detection and mitigation (Next.js)

## Contents

1. [Hydration mismatch](#hydration-mismatch)
2. [Static vs dynamic surprises](#static-vs-dynamic-surprises)
3. [Stale cache and missed revalidation](#stale-cache-and-missed-revalidation)
4. [Edge vs Node runtime](#edge-vs-node-runtime)
5. [Middleware and redirects](#middleware-and-redirects)
6. [Secrets and env leakage](#secrets-and-env-leakage)
7. [Server Actions abuse](#server-actions-abuse)

---

## Hydration mismatch


| Symptom                                 | Likely cause                                                     | Mitigation                                                                                                           |
| --------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| React **#418** / text mismatch warnings | `Date.now()`, `Math.random()`, locale formatting server ≠ client | Defer with `useEffect`, pass server snapshot as prop, or isolate with `dynamic(..., { ssr: false })` when acceptable |
| Wrong HTML after load                   | Client-only assumptions in first paint                           | Narrow `"use client"` boundaries                                                                                     |


**Detection:** Dev overlay + compare server HTML vs disabled JS snapshot.

---

## Static vs dynamic surprises


| Symptom                               | Likely cause                                                     | Mitigation                                                            |
| ------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Route “unexpectedly” dynamic          | `headers()` / `cookies()` imported in layout/page                | Move dynamic reads behind a boundary or accept dynamic + tune caching |
| Build succeeded but CDN never updates | Fully static export assumptions while using server-only features | Align `output` and hosting model with `**deployment-pro`**            |


---

## Stale cache and missed revalidation


| Symptom                               | Likely cause                                                 | Mitigation                                                                              |
| ------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Data outdated after CMS/webhook event | Wrong `**revalidateTag**` string; webhook not firing         | Single source of tag names; log revalidation jobs; fall back to time-based `revalidate` |
| User sees old UI after mutation       | No `revalidatePath`/`router.refresh`/`redirect` after Action | Explicit invalidation story per flow                                                    |
| Infinite freshness                    | Aggressive `fetch` cache without tags                        | Model invalidation — `**nextjs-rendering-caching-and-request-model.md**`                |


---

## Edge vs Node runtime


| Symptom                                   | Likely cause              | Mitigation                                                              |
| ----------------------------------------- | ------------------------- | ----------------------------------------------------------------------- |
| **Prisma** / native module errors on Edge | Edge lacks full Node APIs | Use Node runtime for route, or data proxy pattern — `**edge-cases.md`** |
| Works locally, fails in prod region       | Different default runtime | Set `export const runtime = 'nodejs'` where needed                      |


---

## Middleware and redirects


| Symptom                 | Likely cause                          | Mitigation                                                      |
| ----------------------- | ------------------------------------- | --------------------------------------------------------------- |
| Redirect loops          | Matcher hits auth + login + callback  | Narrow `matcher`; exclude static assets; order rules            |
| Auth flicker            | Middleware vs layout both redirecting | Single ownership — `**integration-map.md**` with `**auth-pro**` |
| Slow TTFB on all routes | Middleware runs too wide              | Tighten matcher — `**tips-and-tricks.md**`                      |


---

## Secrets and env leakage


| Symptom                           | Likely cause                 | Mitigation                                                                     |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| Key visible in browser bundle     | `NEXT_PUBLIC_*` misuse       | Server-only env in RSC/Route Handlers                                          |
| Server key in client import graph | Shared module imports secret | Split modules; audit client graph — `**quality-validation-and-guardrails.md**` |


---

## Server Actions abuse


| Symptom                       | Likely cause                            | Mitigation                                                  |
| ----------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| Unauthorized mutations        | Missing session check in Action         | Enforce authZ on server; idempotency for payments           |
| CSRF surprises (older majors) | Framework CSRF story changed by version | Read **version release notes** + official security guidance |
