# Electron architecture and trust boundaries

## Process model (mental map)

```text
Main process (Node, trusted)
    ├── BrowserWindow(s) → each has isolated renderer (Chromium)
    └── Preload (runs before page; bridge only — not “your app UI”)
             → contextBridge exposes frozen API → Renderer (web, least privilege)
```

- **Trust zones:** Renderer content is **untrusted** unless you fully control origin and CSP — treat **IPC from renderer as untrusted input** — **`main-preload-and-ipc.md`**.

## IPC as your public API

| Layer | Responsibility |
|-------|----------------|
| **preload** | Narrow, typed surface; no passing through arbitrary Node modules |
| **main** | Validate paths, IDs, capabilities; enforce authz for privileged ops |
| **renderer** | UI only; never assume secrets live here |

## Configuration surface

- **`webPreferences`** — Single biggest security lever; defaults drift across Electron majors — **`versions.md`**.
- **Custom protocols / deep links** — Same validation discipline as HTTP handlers — **`edge-cases.md`**.

## Updates as supply chain

- Auto-update pulls **full binaries**; signing + channel policy are part of **trust** — **`tips-and-tricks.md`**, **`deployment-pro`**.
