# Next.js rendering, caching, and request model (App Router)

## Contents

1. [Request lifecycle](#request-lifecycle)
2. [Server vs Client Components](#server-vs-client-components)
3. [Caching layers](#caching-layers)
4. [Dynamic rendering signals](#dynamic-rendering-signals)
5. [Mutations and cache invalidation](#mutations-and-cache-invalidation)

---

## Request lifecycle

High level (App Router):

1. **Route resolution** — layout tree + `page.tsx` for the matched segment.
2. **Render phase** — RSC payload for server components; client components receive serialized props.
3. **Streaming** — `loading.tsx` / Suspense boundaries can stream HTML + RSC chunks.
4. **Navigation** — client navigations reuse layouts and fetch partial RSC payloads.

Conceptually separate **what runs on the server** (data access, secrets, heavy CPU that does not need the browser) from **what must run on the client** (hooks, browser APIs, fine-grained interactivity).

---

## Server vs Client Components


| Concern       | Server Component (default)  | Client Component (`"use client"`)            |
| ------------- | --------------------------- | -------------------------------------------- |
| Data fetching | Direct `fetch`, DB, secrets | Via props, Route Handlers, or Server Actions |
| State         | No `useState` / `useEffect` | Hooks allowed                                |
| Bundle        | Not shipped to browser      | Shipped — minimize subtree                   |


**Boundary rule:** `"use client"` applies to that module and its imports (unless split). Place the directive **as low as possible** so most of the tree stays server-only.

---

## Caching layers

Naming is **major-version sensitive** — always verify against [Next.js docs](https://nextjs.org/docs) for your release.

Typical layers to reason about:

1. **Full Route Cache** — pre-rendered static routes where applicable.
2. **Router Cache** — client-side reuse of segments during navigation (behavior differs by version — confirm docs).
3. `**fetch` request cache** — default caching semantics for `fetch` in Server Components unless opted out (`cache: 'no-store'`, etc.).
4. **Data Cache** — backing store for cached `fetch` responses (invalidation via `revalidatePath` / `revalidateTag` where supported).
5. **CDN / downstream** — `Cache-Control` from Route Handlers and hosting — pairs with `**caching-pro`** / `**network-infra-pro**`.

Stale bugs often come from **assuming** static behavior while a subtree uses **dynamic APIs** (`cookies()`, `headers()`, `searchParams` without explicit static handling, etc.).

---

## Dynamic rendering signals

Using certain APIs or configurations forces **dynamic** rendering for that route segment (or subtree), which changes caching and possibly cold-start behavior:

- `**cookies()`**, `**headers()**`, `**draftMode()**` — typically dynamic.
- **Uncached `fetch`** or explicit dynamic/fetch opt-out — fresh data, less CDN leverage.
- **Segment config** — e.g. `export const dynamic = 'force-dynamic'` opts out of static where applicable.

**Detection:** unexpected “dynamic” in build output, or prod latency unlike static preview — compare with `**quality-validation-and-guardrails.md`**.

---

## Mutations and cache invalidation


| Path                                   | Role                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------- |
| **Server Actions**                     | RPC-style mutations from forms/actions; must validate auth on server        |
| **Route Handlers**                     | HTTP API (`GET`/`POST`/…) — integrate with non-React clients                |
| `**revalidatePath` / `revalidateTag`** | Invalidate cached data after writes — ensure tags match `**fetch**` options |


After mutations, UI consistency depends on **correct invalidation** + **navigation/refetch** patterns — see `**failure-modes-detection-mitigation.md`** for stale UI and wrong-tag issues.