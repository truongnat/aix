# JavaScript — decision tree

## Pick module system

- **Greenfield Node 18+** → Prefer **ESM** (`import`/`export`); align `package.json` `"type": "module"` or `.mjs`.
- **Legacy Node / mixed consumers** → **CJS** or dual package; document interop (`createRequire`, dynamic `import()`).
- **Browser + bundler** → Follow bundler resolution; avoid relying on Node-only APIs without polyfill/shim.

## Pick async style

- **Sequential dependent steps** → `async`/`await` with explicit `try/catch`.
- **Independent parallel work** → `Promise.all` / `allSettled` with clear failure policy.
- **Event/callback legacy API** → Wrap in `new Promise` once at boundary; do not mix callback + `await` in same layer.

## Pick mutability strategy

- **Shared state across async** → Prefer immutable updates or narrow mutable modules behind a single owner.
- **Hot path performance** → Measure first; then consider mutable buffers/typed arrays with documented invariants.

## When to escalate

- **Type-level guarantees** → Combine with **`typescript-pro`**.
- **Security-sensitive parsing** → **`security-pro`**.
- **Test design for race bugs** → **`testing-pro`**.

## `"use strict"`

```
Shipping ESM module?
├── Strict mode already implied — avoid relying on sloppy `this` patterns
└── Legacy script tag / Function constructor — explicit `"use strict"` when maintaining old bundles
```
