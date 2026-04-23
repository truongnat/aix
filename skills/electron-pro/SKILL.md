---
name: electron-pro
description: |
  Production-grade Electron desktop apps: main vs renderer, preload and contextBridge, secure IPC, trust boundaries, packaging, auto-update, and cross-platform edge cases — plus system model (processes, IPC as API surface), failure modes (XSS→IPC abuse, ABI mismatch, update/partials, signing trust), decision trade-offs (Electron vs Tauri/web, sandbox, builder vs Forge), quality guardrails (no invented signing IDs or API shapes across Electron majors).

  Use this skill when the user works on Electron (`BrowserWindow`, `ipcMain`/`ipcRenderer`, preload scripts, `contextIsolation`, `electron-builder`/`electron-forge`), desktop packaging, code signing, native Node addons in Electron, or asks about security boundaries between UI and Node.

  Use **with** **`react-pro`** for renderer UI, **`security-pro`** for threat modeling, **`testing-pro`** for Playwright Electron, **`deployment-pro`** / **`ci-cd-pro`** for signed artifacts and pipelines, **`design-system-pro`** for dense desktop UX. This skill owns **Electron process model and IPC**; web-framework skills own component-level UI.

  Triggers: "Electron", "electron", "BrowserWindow", "ipcMain", "ipcRenderer", "preload", "contextBridge", "contextIsolation", "sandbox", "nodeIntegration", "remote module", "electron-builder", "electron-forge", "electron-updater", "Chromium", "desktop app", "main process", "renderer", "ASAR", "code signing", "notarization".

metadata:
  short-description: Electron — architecture & trust boundaries, IPC, packaging, updates, failure modes
  content-language: en
  domain: desktop
  level: professional
---

# Electron (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [Electron documentation](https://www.electronjs.org/docs) for version-specific APIs; this skill encodes **trust boundaries**, **preload/IPC design**, and **desktop release** mechanics — not API duplicates. Confirm **Electron major**, **bundler** (Vite/Webpack/etc.), **target OS** (macOS notarization, Windows SmartScreen), and whether **native addons** exist.

Renderer UI patterns (React hooks, a11y components): **`react-pro`**.

## Boundary

**`electron-pro`** owns **main/preload/renderer architecture**, **`webPreferences`**, **IPC contracts**, **packager choice at a high level**, and **Electron-specific security defaults**. **`deployment-pro`** owns **release promotion** beyond desktop artifacts when the question is org-wide ship path; **`ci-cd-pro`** owns **workflow structure** for multi-OS builds; **`security-pro`** owns **organization threat model** and policy beyond Electron defaults.

## Related skills (this repo)

| Skill | When to combine with `electron-pro` |
|-------|-------------------------------------|
| **`react-pro`** | Renderer components, hooks, state |
| **`security-pro`** | Threat model, IPC abuse scenarios, org policies |
| **`testing-pro`** | Playwright Electron, integration tests |
| **`deployment-pro`** | Channels, staged rollout, artifact custody |
| **`ci-cd-pro`** | Matrix builds Win/macOS/Linux, cache, signing hooks |
| **`design-system-pro`** | Desktop density, shortcuts, focus — without breaking IPC boundaries |
| **`docker-pro`** | Headless Linux CI images for Electron tests |
| **`tauri-pro`** | Alternative desktop stack — use when codebase is Tauri |

## When to use

- Designing **main / preload / renderer** boundaries and **IPC** contracts.
- Hardening **security** defaults (`contextIsolation`, no `nodeIntegration` in renderer, narrow `contextBridge`).
- **Packaging**, **code signing**, and **auto-update** behavior (Electron-specific).
- **Native modules** and Electron ABI rebuilds; **multi-window** and performance.
- Trigger keywords: `Electron`, `preload`, `ipcMain`, `contextBridge`, `electron-builder`, `auto-update`, …

## When not to use

- **Renderer-only React/CSS** with no main/preload — **`react-pro`**.
- **Pure infra rollout** with no desktop artifact — **`deployment-pro`**.
- **Tauri/Rust desktop** — **`tauri-pro`**.

## Required inputs

- **Electron major** (or explicit “latest stable” upgrade context).
- **Target OS list** when discussing signing, sandbox, or installers.

## Expected output

Follow **Suggested response format** strictly — architecture through residual risks.

## Workflow

1. Confirm Electron version, bundler, OS targets; flag deprecated APIs via official docs.
2. Apply summaries; open `references/` for depth; defer UI-only patterns to **`react-pro`**.
3. Respond with **Suggested response format**; include **failure modes** when IPC or updates touch prod.

### Operating principles

1. **Least privilege in renderer** — No Node in web pages; minimal preload API — **`electron-architecture-and-trust-boundaries.md`**.
2. **IPC is a trust boundary** — Validate and authorize in **main** — **`failure-modes-detection-mitigation.md`**.
3. **Secure defaults** — `contextIsolation`, `nodeIntegration: false`, sane `webPreferences` — **`anti-patterns.md`**.
4. **Production ≠ dev** — Disable unsafe shortcuts; control DevTools — **`quality-validation-and-guardrails.md`**.
5. **Sign and update responsibly** — Updates extend supply chain — **`deployment-pro`**, **`tips-and-tricks.md`**.
6. **Sandbox when feasible** — Trade-offs with native addons — **`decision-tree.md`**.
7. **Deep links / protocols** — Allowlists and validation — **`edge-cases.md`**.
8. **Crash reporting** — PII boundaries — align with **`security-pro`**.

### Electron architecture and trust boundaries (summary)

Three processes, IPC as public API, update trust — **`electron-architecture-and-trust-boundaries.md`**.

Details: [references/electron-architecture-and-trust-boundaries.md](references/electron-architecture-and-trust-boundaries.md)

### Failure modes — detection and mitigation (summary)

XSS→IPC, path traversal, ABI mismatch, update partials, OS trust prompts — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Electron vs Tauri/web; security vs DX; packaging — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Version-accurate APIs; no fake signing artifacts — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Main process, preload, and IPC (summary)

Three contexts; `contextBridge`; `ipcMain.handle` — **`main-preload-and-ipc.md`**.

Details: [references/main-preload-and-ipc.md](references/main-preload-and-ipc.md)

### Tips and tricks (summary)

Builder/Forge, auto-update, native rebuild matrix — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Remote content, protocols, platforms, CSP on bundled assets, GPU — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Anti-patterns (summary)

`nodeIntegration`, broad IPC, `webSecurity: false` — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Decision trees (summary)

Invoke vs send, builder vs Forge, sandbox — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Integration map (summary)

**`react-pro`**, **`security-pro`**, **`testing-pro`**, **`deployment-pro`**, **`ci-cd-pro`**, … — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

Electron major + native rebuild — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Electron major, bundler, target OS, native addons yes/no.
2. **Problem / goal** — IPC design, security review, packaging, update channel, perf.
3. **System design** — Main/preload/renderer responsibility split; threat boundaries — **`electron-architecture-and-trust-boundaries.md`**.
4. **Decision reasoning** — invoke vs send; sandbox stance; builder vs Forge — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — `main`/`preload`/handler snippets — match user’s Electron major — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Bundle size and memory vs Tauri; strict CSP vs DX; multi-window cost.
7. **Failure modes** — Top risks for this design — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Signing pipeline, org policy — route to **`security-pro`**, **`deployment-pro`**, **`ci-cd-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Architecture & trust boundaries** | [references/electron-architecture-and-trust-boundaries.md](references/electron-architecture-and-trust-boundaries.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Main, preload, IPC | [references/main-preload-and-ipc.md](references/main-preload-and-ipc.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Renderer needs to read a project file — team used `nodeIntegration: true`.  
**Expected output:** Full **Suggested response format** — reject Node in renderer; preload + `ipcMain.handle`; path jail; `webPreferences` checklist — **`anti-patterns.md`**.

### 2 — Tricky (edge case)

**Input:** Auto-update installs but app won’t restart on Windows — SmartScreen blocks.  
**Expected output:** Signing context; user trust — **`deployment-pro`**; **failure modes** for partial updates — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** React renderer logs sensitive IPC payloads to DevTools.  
**Expected output:** **`electron-pro`** — prod logging policy, narrow bridge — **`security-pro`** — **`react-pro`** — avoid leaking props.

## Checklist before calling the skill done

### Architecture & security

- [ ] **`contextIsolation`** and **`nodeIntegration: false`** (renderer) unless documented exception — **`anti-patterns.md`**.
- [ ] IPC surface **minimal**; **main** validates inputs; no dynamic channel names from untrusted input — **`electron-architecture-and-trust-boundaries.md`**.
- [ ] **Production** build omits unnecessary DevTools / unsafe `webPreferences` — **`quality-validation-and-guardrails.md`**.

### Shipping & integration

- [ ] **Packaging/signing/update** acknowledged for target OS — **`tips-and-tricks.md`**; **`deployment-pro`** when rollout dominates.
- [ ] **Native addons** rebuild path stated — **`versions.md`**.
- [ ] UI-only guidance deferred to **`react-pro`** when appropriate.

### Risk narrative

- [ ] **Failure modes** referenced when IPC or updates affect prod — **`failure-modes-detection-mitigation.md`**.
- [ ] **Cross-skill** handoff when CI matrix or policy dominates — **`integration-map.md`**.
