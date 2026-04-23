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

1. Confirm Tauri major, Rust toolchain, platforms, and frontend stack.
2. Apply summaries; open `references/`; use **`tauri-runtime-and-ipc-system-model.md`** when explaining invoke vs events vs capabilities.
3. Respond with **Suggested response format**; include **failure modes** for permissions, shell, and IPC.

### Operating principles

1. **Rust owns privilege** — Native APIs only behind reviewed commands — **`rust-core-and-commands.md`**.
2. **Capabilities are contracts** — Minimal per window — **`failure-modes-detection-mitigation.md`**.
3. **Untrusted web input** — Validate before fs/shell/open — **`security-pro`**.
4. **Reproducible builds** — Pin toolchain in CI — **`tips-and-tricks.md`**.
5. **Store alignment** — Signing/notarization per OS — **`deployment-pro`**.

### Rust core and commands (summary)

`#[tauri::command]`, `invoke`, serialization, Tauri 2 capabilities — **`rust-core-and-commands.md`**.

Details: [references/rust-core-and-commands.md](references/rust-core-and-commands.md)

### Tauri runtime and IPC — system model (summary)

Host + webview, invoke/events, ACL mindset, async — **`tauri-runtime-and-ipc-system-model.md`**.

Details: [references/tauri-runtime-and-ipc-system-model.md](references/tauri-runtime-and-ipc-system-model.md)

### Tips and tricks (summary)

Vite, CI cache, updater, signing, shell safety — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

WebView2/WKWebView/WebKitGTK, paths, async blocking, mobile — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Sidecar vs in-process, Tauri vs Electron, bundled vs remote UI — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Decision tree (summary)

Tauri 1 vs 2, sidecar, frontend stack, mobile, web UI source — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Shell injection, broad capabilities, blocking commands — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`react-pro`**, **`security-pro`**, **`testing-pro`**, **`deployment-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Tauri major, Rust MSRV, webview baselines — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Tauri major, OS targets, frontend stack, dev vs packaged issue.
2. **Problem / goal** — Command, capability, bundle, updater, or webview bug.
3. **System design** — IPC path, trust boundary web→Rust — **`tauri-runtime-and-ipc-system-model.md`**.
4. **Decision reasoning** — Capability scope, sidecar vs in-process, bundled vs remote — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Rust command, `tauri.conf` / capability JSON, `invoke` — **`quality-validation-and-guardrails.md`** (version-accurate keys).
6. **Trade-offs** — Security vs DX; async complexity; mobile vs desktop.
7. **Failure modes** — Over-capability, shell/path abuse, IPC size, CSP prod — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — Webview runtime deps; hand off **`deployment-pro`**, **`security-pro`**, **`react-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Tauri runtime & IPC model** | [references/tauri-runtime-and-ipc-system-model.md](references/tauri-runtime-and-ipc-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Rust core & commands | [references/rust-core-and-commands.md](references/rust-core-and-commands.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Simple (common)

**Input:** `invoke('run_script', userPath)` with `shell true`.  
**Expected output:** Full **Suggested response format** — no shell; argv; capabilities; **`security-pro`** injection pattern.

### 2 — Tricky (edge case)

**Input:** After Tauri 2 migration, window cannot read files.  
**Expected output:** Capabilities per window; plugin permission names; migration doc anchor — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** macOS Gatekeeper blocks updater.  
**Expected output:** Signing + notarization — **`deployment-pro`** — entitlements — **`tips-and-tricks.md`**.

## Checklist before calling the skill done

### Security

- [ ] Commands validate inputs; errors safe for UI — **`quality-validation-and-guardrails.md`**.
- [ ] Capabilities/plugins minimal per window — **`failure-modes-detection-mitigation.md`**.
- [ ] Shell, fs, open-url reviewed — **`edge-cases.md`**.

### Ship

- [ ] WebView2 / WebKit baselines for targets — **`versions.md`**.
- [ ] Pure UI delegated to **`react-pro`** when appropriate — **`integration-map.md`**.
- [ ] Tauri **major** + Rust **MSRV** stated when version-sensitive — **`quality-validation-and-guardrails.md`**.
- [ ] **CSP** and remote content for **release** build — **`quality-validation-and-guardrails.md`**.
- [ ] Async vs blocking justified — **`tauri-runtime-and-ipc-system-model.md`**.
