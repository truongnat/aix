# Failure modes — detection and mitigation (Tauri)

## Contents

1. [Permission and capability mistakes](#permission-and-capability-mistakes)
2. [Command injection and path abuse](#command-injection-and-path-abuse)
3. [IPC and performance](#ipc-and-performance)
4. [Webview and packaging](#webview-and-packaging)
5. [Updater and supply chain](#updater-and-supply-chain)

---

## Permission and capability mistakes

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Over-broad capability** | Any window can call dangerous APIs | Scope per window; minimal plugin set — **`anti-patterns.md`** |
| **Migration 1→2 permission drift** | FS APIs suddenly denied | Map allowlists → capabilities; test each window — **`decision-tree.md`** |

---

## Command injection and path abuse

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Shell with user input** | `shell true` + path string | No shell; argv list; fixed program — **`security-pro`** |
| **Path traversal in fs APIs** | Reads outside app data | Canonicalize + root allowlist — **`edge-cases.md`** |
| **Open arbitrary URL** | `javascript:` / data URLs | Scheme allowlist — **`edge-cases.md`** |

---

## IPC and performance

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Huge invoke payloads** | UI jank, OOM | Chunk, temp file, or Rust-side streaming — **`tauri-runtime-and-ipc-system-model.md`** |
| **Blocking command** | Frozen webview | `async` / threadpool — **`edge-cases.md`** |

---

## Webview and packaging

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Missing WebView2** | Blank window on clean Windows | Installer prerequisite or bootstrap — **`edge-cases.md`** |
| **CSP blocks bundled assets** | Console errors prod-only | Test **release** build CSP — **`quality-validation-and-guardrails.md`** |

---

## Updater and supply chain

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Unsigned update channel** | MITM risk | HTTPS + signature verification per docs; **`deployment-pro`** for pipeline |
