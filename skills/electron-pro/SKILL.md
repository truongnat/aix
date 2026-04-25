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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** Electron version, bundler, OS targets; flag deprecated APIs via official docs. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.