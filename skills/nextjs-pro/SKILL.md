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