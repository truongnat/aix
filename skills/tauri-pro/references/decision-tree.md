# Tauri — decision tree

## Tauri 1 vs 2

- **New project** → Tauri 2 + capabilities model unless blocked by plugin ecosystem.
- **Legacy** → Document migration path; permissions differ from allowlists.

## When to use sidecar

- **Long-running native binary** or language not in Rust — sidecar + IPC instead of shelling ad hoc.

## Frontend stack

- **React SPA** → **`react-pro`** for UI; `tauri-pro` for invoke/Rust boundary only.

## Mobile (if applicable)

- **Separate** constraints vs desktop — permissions, store rules, background limits.

## Web UI source

```
Ship only bundled Vite dist vs load remote SPA?
├── Bundled only → simpler CSP; still audit asset and `tauri:` URLs — **`decision-framework-and-trade-offs.md`**
└── Remote UI → treat as untrusted web; strict CSP + TLS; minimize privileged commands — **`security-pro`**
```
