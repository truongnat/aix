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

### Operating principles

1. **Think Before Coding** — Confirm Electron major, OS targets, bundler, and whether native addons or auto-update are in scope. Ask before assuming desktop trust or packaging behavior.
2. **Simplicity First** — Prefer the smallest safe IPC and preload surface that solves the request. Do not widen renderer access or add desktop plumbing without need.
3. **Surgical Changes** — Touch only the relevant main/preload/renderer boundary, packaging config, or updater path. Do not blur all desktop concerns into one change.
4. **Goal-Driven Execution** — Done = the process boundary is clear, the IPC contract is narrow, and packaging or update assumptions are verified.
5. **IPC is an API surface** — Every bridge method is effectively a privileged backend contract and should be treated that way.
6. **Renderer trust is limited** — Browser content should not silently inherit Node or filesystem power.
7. **Desktop release is platform-specific** — Signing, notarization, and updater behavior differ materially by OS.
8. **Version accuracy matters** — Electron major drift changes API availability and security defaults quickly.

## Default recommendations by scenario

- **New Electron feature** — Start with preload + narrow IPC instead of opening direct renderer access.
- **Security concern** — Check `contextIsolation`, bridge scope, and navigation/window creation boundaries first.
- **Packaging issue** — Separate app architecture from code-signing or updater mechanics.
- **Native addon problem** — Verify Electron ABI and rebuild path before changing app logic.

## Decision trees

Summary: choose the fix based on whether the issue sits in process architecture, IPC, packaging, update flow, or native integration.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: exposing Node in the renderer, overbroad preload bridges, trusting remote content, and mixing packaging problems with IPC design.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Electron architecture and trust boundaries (summary)

How main, preload, and renderer processes should divide responsibility so desktop apps remain secure and maintainable.

Details: [references/electron-architecture-and-trust-boundaries.md](references/electron-architecture-and-trust-boundaries.md)

### Main, preload, and IPC (summary)

How to design narrow, explicit bridge contracts between privileged and unprivileged code.

Details: [references/main-preload-and-ipc.md](references/main-preload-and-ipc.md)

### Failure modes and mitigation (summary)

IPC abuse, update breakage, signing issues, ABI mismatches, and desktop-specific trust failures to catch early.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect Electron APIs, security defaults, packaging, and updater compatibility.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Electron version, OS targets, bundler, and which process boundary is involved.
2. **Architecture model** — Explain the relevant trust boundary, IPC flow, or packaging path.
3. **Solution** — Minimum main/preload/renderer or release change with rationale.
4. **Verification** — How to prove the IPC, packaging, or update behavior is correct.
5. **Residual risks** — Remaining renderer trust, signing, updater, or platform caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Electron architecture and trust boundaries | [references/electron-architecture-and-trust-boundaries.md](references/electron-architecture-and-trust-boundaries.md) |
| Main, preload, and IPC | [references/main-preload-and-ipc.md](references/main-preload-and-ipc.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Expose a file-open action to the renderer."
- Prefer a preload bridge with one narrow method instead of direct Node access.
- Keep filesystem privilege in the main process.
- **Verify:** The renderer can trigger only the intended file action and no broader filesystem API leaks through.

**Input (tricky):** "Auto-update works on Windows but fails after macOS notarization."
- Separate updater feed logic from macOS signing/notarization trust requirements.
- Check the platform-specific release chain before editing IPC or UI code.
- **Verify:** The signed macOS build can validate and apply the intended update path.

**Input (cross-skill):** "Build a secure Electron shell around an existing React app."
- Pair **`react-pro`** for renderer UI and keep **`electron-pro`** focused on process boundaries and IPC.
- Do not let renderer implementation choices widen desktop privileges.
- **Verify:** Renderer UI works while main/preload boundaries remain explicit and minimal.

## Checklist before calling the skill done

- [ ] Electron version, OS targets, and process boundary confirmed first (Think Before Coding)
- [ ] Minimum safe IPC/preload/release change chosen; no unnecessary privilege expansion (Simplicity First)
- [ ] Only the relevant main/preload/renderer or packaging surface was changed (Surgical Changes)
- [ ] Success criteria and IPC/packaging verification are explicit (Goal-Driven Execution)
- [ ] Renderer trust boundary remains narrow
- [ ] IPC methods are explicit and minimally privileged
- [ ] Platform-specific signing/updater constraints are acknowledged where relevant
- [ ] Residual desktop or native-addon risks are documented
