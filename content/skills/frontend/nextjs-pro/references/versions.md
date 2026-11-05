# Next.js — version matrix (concise)

| Feature | Introduced (approx.) | Note |
|---------|----------------------|------|
| App Router (stable) | 13.4 | `app/` directory; RSC by default in segments |
| Server Actions (stable) | 14 | Server mutations; validate and rate-limit |
| Turbopack (dev default in many templates) | 13+ | Check `next dev` defaults for your version |
| `use cache` directive | 15+ (verify docs) | Replaces some ad-hoc `fetch` cache patterns — confirm in [Next.js docs](https://nextjs.org/docs) for your major |

Always confirm **`next` version** in `package.json` and read the matching docs branch.
