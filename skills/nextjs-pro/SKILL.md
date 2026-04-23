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

1. Confirm Next version, router mode, and hosting constraints; cite docs for anything version-sensitive.
2. Apply summaries below; open `references/` for depth; use **`nextjs-rendering-caching-and-request-model.md`** when reasoning about cache behavior.
3. Respond with **Suggested response format**; include **failure modes** when production-relevant.

### Operating principles

1. **Default to the server** — Data fetching and secrets stay in Server Components / Route Handlers unless interactivity demands client — **`server-client-boundaries.md`**.
2. **Minimize client bundle** — `"use client"` only where hooks or browser APIs are required — **`anti-patterns.md`**.
3. **Caching is explicit** — Align `fetch`, segment `dynamic`, and revalidation with product SLAs — **`nextjs-rendering-caching-and-request-model.md`**.
4. **Secrets never in client** — No secrets in `NEXT_PUBLIC_*` or client import graphs — **`quality-validation-and-guardrails.md`**.
5. **Colocate route UX** — `loading`/`error` per segment; parallel routes for modals — **`app-router-and-layouts.md`**.
6. **Invalidate after writes** — Tags/paths match **`fetch`** options — **`failure-modes-detection-mitigation.md`**.

### App Router and layouts (summary)

Layouts persist; templates remount; parallel/intercepting routes need deep-link tests — **`app-router-and-layouts.md`**.

Details: [references/app-router-and-layouts.md](references/app-router-and-layouts.md)

### Server and client boundaries (summary)

No hooks in Server Components; serializable props across boundary; `cookies()` / `headers()` imply dynamic considerations — **`server-client-boundaries.md`**.

Details: [references/server-client-boundaries.md](references/server-client-boundaries.md)

### Rendering, caching, and request model (summary)

Request → RSC payload → layered caches (`fetch`, segment static/dynamic, CDN). Major-version differences — **`nextjs-rendering-caching-and-request-model.md`**.

Details: [references/nextjs-rendering-caching-and-request-model.md](references/nextjs-rendering-caching-and-request-model.md)

### Tips and tricks (summary)

`next/link`, `next/image`, Server Actions discipline, middleware scope — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Hydration, dynamic APIs in static routes, Edge vs Node, i18n loops — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Server Action vs Route Handler; static vs dynamic; BFF vs external API — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Fat client boundaries, leaked secrets, unvalidated Actions — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`react-pro`**, **`security-pro`**, **`deployment-pro`**, **`caching-pro`**, **`network-infra-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Feature availability by major — **`versions.md`**; never assume undocumented APIs — **`quality-validation-and-guardrails.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Next major, App vs Pages, hosting (Vercel/self-hosted), Edge vs Node where relevant.
2. **Problem / goal** — Route segment, data freshness, auth redirect, mutation surface, or build/deploy issue.
3. **System design** — RSC tree + cache layers affected — **`nextjs-rendering-caching-and-request-model.md`**.
4. **Decision reasoning** — Server Action vs Route Handler; static/ISR vs dynamic — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — File paths under `app/` or `pages/`; snippets aligned with verified APIs — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Freshness vs CDN; bundle size vs interactivity; colocated BFF vs standalone API.
7. **Failure modes** — Hydration, stale tags, middleware matcher, Edge incompatibility — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — Version drift, untested i18n paths, hand off to **`deployment-pro`** / **`security-pro`** / **`auth-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Rendering & caching model** | [references/nextjs-rendering-caching-and-request-model.md](references/nextjs-rendering-caching-and-request-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| App Router and layouts | [references/app-router-and-layouts.md](references/app-router-and-layouts.md) |
| Server / client boundaries | [references/server-client-boundaries.md](references/server-client-boundaries.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases and ops | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Page uses `headers()` but the team expects static generation.  
**Expected output:** Full **Suggested response format** — identify dynamic signal; options (split layout, opt into `dynamic`, refactor); trade-off static vs personalized — **`nextjs-rendering-caching-and-request-model.md`**.

### 2 — Tricky (edge case)

**Input:** Server Action works in dev but fails in prod with cryptic errors using Prisma.  
**Expected output:** Runtime Edge vs Node — **`failure-modes-detection-mitigation.md`**; move to Node runtime or data proxy — **`edge-cases.md`**; verify env server-only — **`quality-validation-and-guardrails.md`**.

### 3 — Cross-skill

**Input:** Webhook should invalidate CMS-driven pages; content stays stale.  
**Expected output:** **`nextjs-pro`** tag naming + `revalidateTag` path — **`failure-modes-detection-mitigation.md`**; CDN purge policy — **`caching-pro`**; webhook reliability — **`network-infra-pro`** or **`deployment-pro`**.

## Checklist before calling the skill done

### Architecture & boundaries

- [ ] `"use client"` only where needed — **`anti-patterns.md`**.
- [ ] Server-only modules never pulled into client graph — **`quality-validation-and-guardrails.md`**.
- [ ] Dynamic APIs (`cookies`, `headers`, uncached `fetch`) understood for the route — **`nextjs-rendering-caching-and-request-model.md`**.

### Data & caching

- [ ] `fetch` cache / `revalidate` / tags match product SLAs — **`nextjs-rendering-caching-and-request-model.md`**.
- [ ] After mutations, invalidation or refresh path defined — **`failure-modes-detection-mitigation.md`**.
- [ ] No fictitious Next config or cache API — **`quality-validation-and-guardrails.md`**.

### Ops & security

- [ ] Secrets not in `NEXT_PUBLIC_*` or client bundles — **`quality-validation-and-guardrails.md`**.
- [ ] `next/image` `remotePatterns` (or equivalent) for prod hosts — **`tips-and-tricks.md`**.
- [ ] Middleware `matcher` not over-including static assets — **`failure-modes-detection-mitigation.md`**.
- [ ] Server Actions validated and authorized on the server — **`anti-patterns.md`**, **`security-pro`**.
- [ ] Edge routes free of unsupported Node APIs — **`edge-cases.md`**.

### Cross-skill

- [ ] Hand off to **`deployment-pro`** / **`caching-pro`** when rollout or CDN dominates — **`integration-map.md`**.
