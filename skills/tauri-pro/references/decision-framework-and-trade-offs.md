# Decision framework and trade-offs (Tauri)

## Contents

1. [Sidecar vs in-process Rust](#sidecar-vs-in-process-rust)
2. [Tauri vs Electron](#tauri-vs-electron)
3. [Bundled-only vs remote web content](#bundled-only-vs-remote-web-content)
4. [Desktop-first vs mobile (Tauri 2)](#desktop-first-vs-mobile-tauri-2)

Pair with **`decision-tree.md`**.

---

## Sidecar vs in-process Rust

| **In-process Rust** | **Sidecar** |
|---------------------|-------------|
| Tight integration, lower IPC overhead | Foreign runtimes, long-lived workers, legacy binaries |

**Trade-off:** sidecars complicate **packaging, signing, and updates** — document lifecycle — **`tips-and-tricks.md`**.

---

## Tauri vs Electron

| Tauri strengths | Electron strengths |
|-----------------|---------------------|
| Smaller footprint, Rust privilege boundary | Node ecosystem, mature DevTools patterns |

**Trade-off:** pick per team skills and platform needs — **`electron-pro`** for Electron-only work.

---

## Bundled-only vs remote web content

| Ship only `dist` assets | Load remote UI |
|-------------------------|----------------|
| Simpler CSP, smaller attack surface | Requires strict CSP, TLS pinning considerations |

**Trade-off:** remote UI is **higher risk** — treat as untrusted web — **`security-pro`**.

---

## Desktop-first vs mobile (Tauri 2)

Mobile adds **OS permission dialogs**, **store rules**, and **background limits** — do not assume desktop capability JSON works unchanged — **`edge-cases.md`**.
