# Decision framework and trade-offs (Next.js)

## Contents

1. [Server Action vs Route Handler](#server-action-vs-route-handler)
2. [Static / ISR vs dynamic](#static--isr-vs-dynamic)
3. [App Router vs Pages Router (brownfield)](#app-router-vs-pages-router-brownfield)
4. [Colocation vs shared API service](#colocation-vs-shared-api-service)

Use with `**decision-tree.md**` for quick branching; confirm **Next major** via `**versions.md`** and [official docs](https://nextjs.org/docs).

---

## Server Action vs Route Handler


| Prefer **Server Action** when               | Prefer **Route Handler** when                                   |
| ------------------------------------------- | --------------------------------------------------------------- |
| Mutation from **React forms** / same-app UX | **Non-browser clients** (mobile, CLI, partner API)              |
| Progressive enhancement matters             | Need **fine-grained HTTP** (verbs, headers, streaming response) |
| Colocated with UI, same validation          | Public **REST/GraphQL** surface                                 |


**Trade-off:** Actions couple to the framework; Route Handlers are portable HTTP — `**api-design-pro`** for external contract design.

---

## Static / ISR vs dynamic


| Goal                          | Lean toward                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------- |
| **LCP / SEO / global CDN**    | Static or cached segments; avoid unnecessary `cookies()`/`headers()` in tree |
| **Highly personalized pages** | Dynamic segment; consider **edge** personalization + cache headers           |
| **Event-driven freshness**    | `revalidateTag` / webhooks + static generation where possible                |


**Trade-off:** Static minimizes compute; dynamic maximizes correctness for per-user data — `**nextjs-rendering-caching-and-request-model.md`**.

---

## App Router vs Pages Router (brownfield)


| Situation                             | Guidance                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| New feature in **existing Pages app** | Prefer **new App routes** under `app/` when team allows incremental migration |
| Shared layout needs                   | Avoid duplicating providers — consolidate at one router’s root                |
| `getServerSideProps` parity           | Map to RSC `fetch` + caching or dynamic segment config                        |


**Trade-off:** Migration cost vs long-term composition (layouts, Server Components) — see `**integration-map.md`**.

---

## Colocation vs shared API service


| Pattern                               | When it fits                                                |
| ------------------------------------- | ----------------------------------------------------------- |
| **Next as BFF**                       | Same team; reduce round-trips; hide secrets in RSC/Handlers |
| **Separate API** (`nestjs-pro`, etc.) | Multiple clients, strict governance, independent scaling    |


**Trade-off:** BFF simplicity vs service boundary clarity — `**nestjs-pro`** / `**api-design-pro**` when API is the product.