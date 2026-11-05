# Edge cases (Next.js)

## Contents

1. [Hydration mismatches](#hydration-mismatches)
2. [Static vs dynamic surprises](#static-vs-dynamic-surprises)
3. [Edge vs Node runtime](#edge-vs-node-runtime)
4. [Self-hosting and Docker](#self-hosting-and-docker)
5. [Monorepos and transpilation](#monorepos-and-transpilation)
6. [Pages Router coexistence](#pages-router-coexistence)
7. [Browser history and edit flows](#browser-history-and-edit-flows)

---

## Hydration mismatches

- **Server HTML ≠ first client render** — causes React #418-style warnings. Common causes: `Date.now()`, `Math.random()`, locale-only formatting, `window` in initial render.
- **Fix** — compute in `useEffect`, or pass server time as prop, or defer client-only widget with `dynamic(..., { ssr: false })` when acceptable for SEO.

---

## Static vs dynamic surprises

- Importing **`headers()`** / **`cookies()`** in a layout or page can force **dynamic** rendering for that subtree — unexpected if you expected SSG.
- **`export const dynamic`** and **`fetch` options** must align with product SLAs (CDN cache vs fresh data).
- **Revalidation** — wrong tag in `revalidateTag` or missing webhook/cron → **stale** data until deploy — verify event path — **`failure-modes-detection-mitigation.md`**.

---

## Edge vs Node runtime

- **Middleware** and **Edge Route Handlers** — limited Node APIs; **`fs`**, some crypto, native addons unavailable.
- **Prisma** — historically Node; use **Data Proxy**, **edge driver**, or run DB access in Node server actions / separate service.

---

## Self-hosting and Docker

- **`output: 'standalone'`** — minimal server bundle for containers; copy `public` and `.next/static` per docs.
- **Health checks** — hit a route that exercises app, not static files only.

---

## Monorepos and transpilation

- **`transpilePackages`** in `next.config` for workspace packages not pre-built; watch for dual React copies (**invalid hook call**).

---

## Pages Router coexistence

- **`pages/`** and **`app/`** can coexist during migration — routing precedence and duplicate paths are easy to get wrong; document URL ownership.

---

## Browser history and edit flows

Applies to **App Router** (and SPAs generally) when you guard **edit** screens with “unsaved changes” modals or synthetic history entries.

- **Symptom** — Flow **list → detail → `/edit`**. **Browser Back** from edit returns to detail, but the **next** Back from detail jumps to **edit** again instead of **list**. In-app **Cancel / 戻る** (programmatic `router.push` to known targets) still behaves correctly.
- **Why** — `popstate` / trap logic that **`pushState`s again on every back** (stack inflation), and/or completing “leave edit” after a **browser-initiated** back using **`router.push(detail)`** instead of matching the real history stack (differs from UI-driven navigation).
- **Directional fix** — Where **Navigation API** exists: `window.navigation` + `navigate`, intercept **traverse** back, `preventDefault` **before** the URL changes, show confirm; on confirm for **browser back**, leave with **`router.back()`** (or equivalent one history step) — **not** `router.push(detail)`. Legacy: one trap entry via `history.pushState` with a sentinel in **spread** `history.state`; **avoid** extra `pushState` inside `popstate` on each back. Re-arm the trap if the user stays after dismissing the modal.
- **Verify** — Manually: **two consecutive browser Backs** from edit; compare with **in-app** cancel/back paths.

*Harvested pattern; product-specific hook names belong in the app repo, not here.*

---

*Vercel-specific: regions, fluid compute, and limits — read platform docs for production SLOs.*
