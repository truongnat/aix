# Decision framework and trade-offs

## Electron vs alternatives

| Choice | Strength | Cost |
|--------|----------|------|
| **Electron** | Full Chromium; mature ecosystem; web UI reuse | Large binary; memory; security surface |
| **Tauri** | Small footprint; system webview | Rust core; webview variance — **`tauri-pro`** |
| **Web-only PWA** | No install friction | No full Node/desktop APIs |

**Rule:** Pick Electron when **desktop integration + web stack** outweigh bundle size; prove **native module** and **signing/update** commitment early.

## Security vs developer experience

| Stance | When |
|--------|------|
| **Strict** — no remote code, CSP, narrow IPC | Prod; any untrusted content |
| **Relaxed dev only** — DevTools, extra logging | Local dev with guardrails; never ship same prefs |

## Packaging / distribution

| Concern | Trade-off |
|---------|-----------|
| **electron-builder vs Forge** | Team consistency > marginal feature diff — **`decision-tree.md`** |
| **Auto-update mandatory** | Supply chain + UX win; requires signing + crash reporting discipline |
| **Per-OS installers** | NSIS vs MSI vs DMG/PKG — align with IT policy — **`deployment-pro`** |

## Performance

- **Many `BrowserWindow`s** — memory scales with Chromium instances; pool or consolidate where possible.
- **Background work** — Prefer **main** or **utility process** vs heavy renderer JS for long tasks.
