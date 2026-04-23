# Quality validation and guardrails (Next.js)

## Contents

1. [Version and API honesty](#version-and-api-honesty)
2. [Environment variables](#environment-variables)
3. [Boundaries and imports](#boundaries-and-imports)
4. [Performance and UX checks](#performance-and-ux-checks)
5. [Release and deploy checks](#release-and-deploy-checks)

---

## Version and API honesty

- **Do not invent** config keys, exports, or `fetch` cache options — verify against **your** Next.js major ([docs](https://nextjs.org/docs)).
- When suggesting code, prefer patterns that exist in **documented** App Router APIs for that major; flag **experimental** features explicitly.
- **Turbopack vs Webpack** — defaults differ by version; don’t assume one dev behavior matches another.

---

## Environment variables

| Rule | Detail |
|------|--------|
| **`NEXT_PUBLIC_`** | Browser-visible — **never** secrets, tokens, internal URLs with auth |
| **Server-only** | DB URLs, signing keys — only in RSC, Route Handlers, Actions, **`middleware`** (mind Edge limits) |
| **Build vs runtime** | CI may bake env at build — align with **`deployment-pro`** |

Audit: search client bundles / source maps for accidental strings — pair **`security-pro`**.

---

## Boundaries and imports

- Client modules **must not** import server-only modules that pull secrets or Node-only APIs (breaks bundle or leaks intent).
- **`"use client"`** placement — smallest subtree; verify no accidental hoisting of heavy deps to client.
- **Dynamic APIs** — one `headers()` read can change caching for a segment — trace before claiming “fully static.”

---

## Performance and UX checks

- **`next/image`** — `sizes`, priority for LCP hero, `remotePatterns` for prod domains.
- **`next/link`** — avoid wrapping fraudulently styled `<button>` without proper semantics (a11y — **`react-pro`**).
- **Lists** — virtualization for huge feeds (client concern — **`react-pro`**).

---

## Release and deploy checks

- [ ] **`next build`** passes with same Node version as prod.
- [ ] Smoke **middleware** matcher — no accidental match on `_next/static` or images.
- [ ] **ISR/revalidate** — documented tag/path ownership.
- [ ] **Runtime** — Edge routes do not import Node-only SDKs without adapter.

Cross-check hosting: **`deployment-pro`**, CDN: **`caching-pro`** / **`network-infra-pro`**.
