# Anti-patterns — Next.js

1. **`"use client"` at the root of `app/layout.tsx`** — Pushes the entire subtree to the client; move boundary down.
2. **Fetching the same server data in every client leaf** — Duplicates requests and cache confusion; lift fetch to RSC or use a documented client cache.
3. **Secrets in `NEXT_PUBLIC_`** — Anything with that prefix is exposed to the browser.
4. **Assuming static without checking dynamic APIs** — `headers()` / `cookies()` in a segment forces dynamic behavior — surprises for “static” pages.
5. **Middleware that runs on all assets** — Over-matching `middleware` hurts Edge cost; narrow matchers.
6. **Server Actions without server-side validation** — Treat as public endpoints; zod/validation + authz.
7. **Ignoring `remotePatterns` for `next/image`** — Broken images in prod when domains change.

See [decision-tree.md](decision-tree.md) and [edge-cases.md](edge-cases.md).
