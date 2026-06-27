# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Renderer XSS → privileged IPC** | XSS calls `window.api.*` exposed via preload | Pentest; CSP gaps | CSP + minimal bridge; validate in main — **`electron-architecture-and-trust-boundaries.md`** |
| **`nodeIntegration` footgun** | Legacy tutorials | Code search `nodeIntegration: true` | False + preload — **`anti-patterns.md`** |
| **Path traversal via IPC** | User-controlled paths sent to `fs` | Fuzz IPC payloads | Normalize; jail to roots — **`edge-cases.md`** |
| **Main thread blocked** | Huge IPC payloads; sync fs on hot path | UI freeze; perf traces | Chunk/stream; async handlers |
| **Native module ABI mismatch** | Electron Node ≠ system Node | Crash at load | `electron-rebuild`; CI matrix — **`versions.md`** |
| **Update fails mid-flight** | Network; disk full | Partial install; crash loop | Channel rollback; staged rollout — **`tips-and-tricks.md`** |
| **Windows trust / SmartScreen** | Unsigned or new publisher | User reports “blocked” | Code signing pipeline — **`deployment-pro`** |
| **macOS gatekeeper / notarization** | Missing/not stale entitlements | Launch fails on clean Mac | Apple signing docs; entitlements review |
| **Remote navigation** | `loadURL` to attacker page | Unexpected network | `will-navigate` / `setWindowOpenHandler` allowlists — **`edge-cases.md`** |
| **DevTools / debug left on** | Prod left `openDevTools` | Easy data exfil in field | Strip in prod build — **`anti-patterns.md`** |
