# JavaScript execution and module system (model)

## Event loop (simplified)

```text
Call stack runs to completion
  → microtask queue drains (Promise, queueMicrotask)
  → one macrotask (timers, I/O callbacks) → repeat
```

- **`await`** schedules continuations as **microtasks**; interleaving with timers explains many “ordering” bugs — **`edge-cases.md`**.

## Realm and globals

- **Browser vs Node/Bun/Deno** — Different globals (`window` vs `globalThis`/`process`), **same language** semantics for core syntax — **`versions.md`**.

## Modules

| Aspect | Notes |
|--------|--------|
| **ESM** | Static graph; hoist / live bindings; **`import()`** async boundary |
| **CJS** | `require` evaluated at runtime; **`module.exports`** shape quirks |
| **Interop** | Default vs namespace imports differ — **`edge-cases.md`** |

## Strict mode

- **`"use strict"`** per function/module or implied in **ES modules** — catches silent mistakes (`delete` proto, sloppy `this`) — **`decision-tree.md`**.
