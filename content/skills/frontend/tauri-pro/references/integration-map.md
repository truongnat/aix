# Tauri — integration map

| Skill | Combine when |
|-------|----------------|
| **`react-pro`** | Webview UI (hooks, state, a11y, perf) — not invoke/Rust boundary. |
| **`typescript-pro`** | Typed `invoke` contracts, shared DTO types across web/Rust boundary. |
| **`security-pro`** | CSP, capability review, path/open-url/shell policies, threat modeling. |
| **`testing-pro`** | Rust tests, Playwright/Cypress against packaged app, CI matrices. |
| **`deployment-pro`** | Installers, signing, notarization, updater channels. |
| **`performance-tuning-pro`** | Large IPC payloads, startup latency, memory churn. |
| **`docker-pro`** | Cross-compile Linux/Windows containers for CI. |
| **`electron-pro`** | **Comparison only** — not for implementing Tauri. |

**Boundary:** **`tauri-pro`** owns **Tauri config, Rust commands, capabilities, packaging, updater**; SPA internals → **`react-pro`** (or other UI skill).
