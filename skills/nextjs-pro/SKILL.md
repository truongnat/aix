---
name: nextjs-pro
description: |
  Production-grade Next.js: App Router, Server Components, rendering and caching model (RSC pipeline, fetch cache, revalidation), Route Handlers and Server Actions, middleware and Edge vs Node — plus system model (request → RSC payload → cache layers), failure modes (hydration, stale cache, dynamic surprises, secrets, middleware loops), decision trade-offs (Actions vs Route Handlers, static vs dynamic, BFF vs external API), and quality guardrails (version-accurate APIs, env boundaries).

  Use this skill when the user works on Next.js (Pages or App Router), `next.config`, `next/image`, `next/font`, `next/link`, layouts, `loading.tsx`, `error.tsx`, Server Actions, `fetch` caching and revalidation, `cookies()` / `headers()` in RSC, Middleware, Edge Runtime, Route Handlers, internationalization (next-intl / i18n), Turbopack, Vercel deployment, or asks for review of RSC boundaries, hydration, or API routes.

  Combine with **`react-pro`**, **`deployment-pro`**, **`security-pro`**, **`auth-pro`**, **`caching-pro`**, **`network-infra-pro`**, **`typescript-pro`**, **`nestjs-pro`** / **`api-design-pro`** when contracts and backends matter.

  Triggers: "Next.js", "Nextjs", "App Router", "Pages Router", "Server Component", "RSC", "use client", "Server Action", "next/navigation", "next/image", "middleware.ts", "revalidate", "fetch cache", "Route Handler", "edge runtime", "Turbopack", "next.config", "Vercel", "parallel routes", "intercepting routes", "generateStaticParams", "dynamic route", "metadata API", "next/font", "notFound", "loading.tsx", "error.tsx", "dynamic = force-dynamic".

metadata:
  short-description: Next.js — RSC pipeline, caching model, middleware, failure modes, guardrails
  content-language: en
  domain: web-framework
  level: professional
---

# Next.js (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [Next.js docs](https://nextjs.org/docs) for **version-specific** APIs; this skill encodes **framework-correct boundaries**, **caching semantics**, and **production failure modes** — not a copy of the docs. Confirm **Next.js major** (13/14/15+), **App vs Pages Router**, and **hosting target** when known.

## Boundary

**`nextjs-pro`** owns **Next.js application structure** (App Router trees, RSC/client split, data fetching and cache invalidation, Route Handlers, Server Actions, middleware, `next/image` / `next/font` usage, and Next-specific deployment hooks). **`react-pro`** owns **generic React** patterns. **`deployment-pro`** owns **promotion, rollout, and platform runbooks** beyond Next config. **`nestjs-pro`** / **`api-design-pro`** own **standalone HTTP API design** when Next is not the primary surface.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`react-pro`** | Hooks, composition, accessibility in client subtrees |
| **`deployment-pro`** | CI/CD, env promotion, container/K8s rollout |
| **`security-pro`** | Threat model, OWASP-style review of auth/data |
| **`auth-pro`** | OAuth/session/JWT flows with middleware |
| **`caching-pro`** | CDN/browser cache semantics vs Next fetch cache |
| **`network-infra-pro`** | DNS, TLS, edge routing awareness |
| **`typescript-pro`** | Strict typing, typed routes where applicable |
| **`api-design-pro`** / **`nestjs-pro`** | External APIs and backend services |

## When to use

- Structuring **App Router** trees: layouts, templates, loading/error boundaries, route groups.
- Choosing **Server vs Client Components** and fixing `"use client"` boundaries.
- **Data fetching**: `fetch` in RSC, caching, `revalidatePath` / `revalidateTag`, segment config.
- **Mutations**: Server Actions vs Route Handlers; forms and progressive enhancement.
- **Middleware**, auth redirects, matchers, Edge vs Node runtime.
- **Deployment-aware** config: env vars, `output`, image domains, runtime constraints.

## When not to use

- **Pure React** behavior with no Next.js APIs — **`react-pro`**.
- **Database schema design** as the primary topic — **`postgresql-pro`** (pair **`nextjs-pro`** for where queries run).
- **Kubernetes/VPC design** without Next-specific questions — **`deployment-pro`** / **`network-infra-pro`**.

## Required inputs

- **Next.js major** and **App vs Pages** Router.
- **Hosting** (Vercel, self-hosted Node, Docker, serverless adapter) when discussing build output and regions.

## Expected output

Follow **Suggested response format** strictly — system design through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** Next version, router mode, and hosting constraints; cite docs for anything version-sensitive. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm Next.js major, App vs Pages Router, and hosting target before any suggestion. API surface differs significantly across majors.
2. **Simplicity First** — Default to Server Component; add `"use client"` only when browser APIs or interactivity explicitly require it. Every `"use client"` boundary increases client bundle.
3. **Surgical Changes** — Cache invalidation (`revalidatePath`, `revalidateTag`) must be minimal and targeted. Over-invalidating is a performance regression, not a safe default.
4. **Goal-Driven Execution** — Done = no hydration errors in browser console, correct RSC payload shape in Network tab, intended cache behavior verified.
5. **RSC boundary discipline** — Data fetching lives in Server Components; event handlers, `useState`, `useEffect` live in Client Components. Never fetch in Client Components when Server Component is available.
6. **4-layer cache awareness** — Request Memoization → Data Cache → Full Route Cache → Router Cache. Understand which layer a `revalidate` call targets before using it.
7. **Env var boundaries** — `NEXT_PUBLIC_` for client-safe values; secrets never cross the `"use client"` boundary or appear in client bundle.
8. **Version-accurate APIs** — Every API suggestion must match the confirmed Next.js major; Pages Router APIs (`getServerSideProps`, `getStaticProps`) do not exist in App Router.

### Rendering, caching, and request model (summary)

Request → RSC render → RSC payload → client hydration. Four cache layers and their invalidation triggers. `dynamic = 'force-dynamic'` vs segment-level `revalidate`.

Details: [references/nextjs-rendering-caching-and-request-model.md](references/nextjs-rendering-caching-and-request-model.md)

### Server/client boundary model (summary)

`"use client"` propagation, Server Actions, data passing patterns, and what cannot cross the boundary (functions, class instances).

Details: [references/server-client-boundaries.md](references/server-client-boundaries.md)

### Failure modes and mitigation (summary)

Hydration mismatches, stale cache after mutation, `dynamic` surprises, middleware loops, secrets leaking to client, Edge runtime incompatibilities.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### App Router layouts and routing (summary)

Layouts, templates, parallel routes, intercepting routes, loading/error boundaries, `generateStaticParams`.

Details: [references/app-router-and-layouts.md](references/app-router-and-layouts.md)

## Suggested response format

1. **Context** — Next.js major, App vs Pages Router, hosting (Vercel/Node/Docker).
2. **Rendering model** — RSC/client split, which cache layer applies, data flow.
3. **Solution** — Minimum code change; annotate Server vs Client component intent.
4. **Cache impact** — Expected behavior after revalidation or dynamic segment config.
5. **Failure modes addressed** — Hydration, stale cache, secret boundaries, Edge runtime gaps.
6. **Residual risks** — Version-specific caveats, bundle size impact, hosting constraints.

## Resources in this skill

| Topic | File |
|-------|------|
| Rendering, caching, request model | [references/nextjs-rendering-caching-and-request-model.md](references/nextjs-rendering-caching-and-request-model.md) |
| Server/client boundaries | [references/server-client-boundaries.md](references/server-client-boundaries.md) |
| App Router and layouts | [references/app-router-and-layouts.md](references/app-router-and-layouts.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "My Server Action mutation isn't refreshing the UI."
- Server Actions invalidate the Router Cache automatically, but Data Cache requires explicit `revalidatePath` or `revalidateTag`.
- **Fix:** Add `revalidatePath('/affected-route')` inside the Server Action after the DB mutation.
- **Verify:** Network tab shows a fresh RSC payload on next navigation; stale data gone.

**Input (tricky):** "`cookies()` throws 'cookies was called outside a request scope'."
- Root cause: `cookies()` requires a dynamic render context; it cannot be called in a statically cached route or at module initialization.
- **Fix:** Add `export const dynamic = 'force-dynamic'` to the route segment, or move the `cookies()` call into a Server Action or Route Handler.
- **Verify:** Route renders without the error; check that forcing dynamic doesn't break other pages relying on static output.

**Input (cross-skill):** "I need auth check in middleware redirecting to login."
- Middleware reads cookies/headers, checks session, redirects unauthenticated users — all at Edge before RSC rendering.
- Pair **`auth-pro`** for JWT/session strategy, **`security-pro`** for cookie hardening (HttpOnly, SameSite, Secure).
- **Verify:** Unauthenticated request redirects; authenticated request passes through without RSC re-render overhead.

## Checklist before calling the skill done

- [ ] Next.js major and App vs Pages Router confirmed before writing any code (Think Before Coding)
- [ ] Server Component chosen by default; `"use client"` added only when required (Simplicity First)
- [ ] Cache invalidation is targeted — no over-broad `revalidatePath('/')` (Surgical Changes)
- [ ] No hydration errors in browser console (Goal-Driven Execution)
- [ ] Secrets do not cross the `"use client"` boundary or appear in `NEXT_PUBLIC_`
- [ ] RSC payload verified in Network tab for data-fetching changes
- [ ] `dynamic` config matches intent (static vs force-dynamic)
- [ ] API usage verified against the confirmed Next.js major version