---
name: tauri-pro
description: |
  Production-grade Tauri desktop (and mobile): Rust core, invoke/commands, capabilities/permissions, webview integration, bundling, updater, and cross-platform edge cases — plus system model (Rust host + webview, IPC invoke/events, capabilities as ACL, threading), failure modes (over-broad capabilities, shell injection, path traversal, IPC payload jank, WebView2/CSP prod surprises), decision trade-offs (sidecar vs in-process, Tauri vs Electron, bundled vs remote UI, desktop vs mobile), and quality guardrails (Tauri 1 vs 2 config accuracy, safe errors, release-build parity).

  Use this skill for Tauri (`src-tauri`, `#[tauri::command]`, `invoke`, `tauri.conf`, plugins, updater, sidecars), Rust–frontend boundaries, or packaging for Windows/macOS/Linux (and mobile when applicable).

  Combine with **`react-pro`** (or Vue/Svelte) for webview UI, **`typescript-pro`** for typed invoke contracts, **`security-pro`** for capabilities/CSP/shell hardening, **`testing-pro`** for CI and E2E, **`deployment-pro`** for signing and updater pipelines, **`performance-tuning-pro`** for IPC/startup, and **`docker-pro`** for cross-compile CI.

  Triggers: "Tauri", "tauri", "src-tauri", "tauri.conf", "invoke", "tauri::command", "WebView", "WebView2", "Rust desktop", "Tauri plugin", "Tauri updater", "capability", "Tauri 2", "v1", "v2", "sidecar", "Cargo.toml".

metadata:
  short-description: Tauri — IPC model, capabilities, bundle, updater, failure modes
  content-language: en
  domain: cross-platform-desktop
  level: professional
---

# Tauri (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [Tauri documentation](https://tauri.app/) for the user’s **major version** (1 vs 2); this skill encodes **IPC boundaries**, **capability hygiene**, and **shipping** concerns — not generic SPA tutorials. Confirm **Tauri major**, **Rust toolchain**, and **frontend** stack (e.g. Vite + React).

Webview UI patterns: **`react-pro`** when using React.

## Boundary

**`tauri-pro`** owns **Tauri configuration**, **Rust commands**, **capabilities/plugins**, **packaging/updater**, and **webview host integration**. **`react-pro`** owns **component-level web UI**. **`electron-pro`** applies only to **Electron** codebases. **`deployment-pro`** owns **org-wide signing/release policy** beyond Tauri-specific steps.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`react-pro`** | SPA in webview — hooks, state, a11y |
| **`typescript-pro`** | Typed `invoke` payloads and shared types |
| **`security-pro`** | CSP, capabilities, shell/fs/open policies |
| **`testing-pro`** | Rust tests, E2E on packaged app, CI |
| **`deployment-pro`** | Signing, notarization, updater channels |
| **`performance-tuning-pro`** | IPC size, startup, memory |
| **`docker-pro`** | Cross-compile in CI |
| **`electron-pro`** | Stack comparison only — not Tauri impl |

## When to use

- Rust **`#[tauri::command]`** design, `invoke` contracts, error mapping to UI.
- **Capabilities** / permissions (Tauri 2) or legacy allowlists — least privilege.
- **Bundling**, **updater**, **sidecars**, platform webview differences.
- Async vs blocking commands; large payload patterns.

## When not to use

- **Pure React** question with no Tauri/Rust — **`react-pro`**.
- **Electron app** — **`electron-pro`**.
- **Generic Rust** with no Tauri APIs — narrow to Tauri or defer to Rust ecosystem docs.

## Required inputs

- **Tauri major** (1 vs 2) and **target OS** (desktop vs mobile).
- **Rust version** / MSRV when suggesting features.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** Tauri major, Rust toolchain, platforms, and frontend stack. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.