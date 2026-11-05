# Anti-patterns — TypeScript

1. **`as` to silence errors** — Masks unsoundness; prefer guards and schema validation.
2. **`any` in public APIs** — Infects callers; use `unknown` or generics.
3. **Complex conditional types at every call site** — Centralize in `types/` with docs.
4. **Ignoring `strictNullChecks` errors** — Usually real bugs; fix the model.
5. **`enum` for everything** — Often `as const` objects + union are simpler and more JS-friendly.
6. **Path aliases without tooling alignment** — `paths` in `tsconfig` must match bundler/runtime resolution.
7. **Duplicate source of truth** — Runtime validation (zod/io-ts) + static types should connect at boundaries.

See [decision-tree.md](decision-tree.md) and [type-system.md](type-system.md).
