# Tauri — runtime, webview, and IPC model

## Contents

1. [Process layout](#process-layout)
2. [IPC: invoke and events](#ipc-invoke-and-events)
3. [Capabilities as access control](#capabilities-as-access-control)
4. [Threading and async](#threading-and-async)
5. [Trust boundaries](#trust-boundaries)

Official docs: [Tauri](https://tauri.app/) — confirm **Tauri 1 vs 2** (capabilities differ).

---

## Process layout

A typical Tauri app runs a **Rust host** that embeds a **native webview** (WebView2 / WKWebView / WebKitGTK). The **frontend** (JS/TS) is not a separate browser process like Electron’s full Chromium — APIs and sandbox differ by platform.

---

## IPC: invoke and events

- **`invoke`** — request/response from webview → Rust command; arguments and return values **serialize** across the boundary.
- **Events** — push notifications Rust → webview (and sometimes the reverse pattern via channels).

**Implication:** large or frequent payloads can **block or bloat** IPC — prefer files, streams, or chunking — **`edge-cases.md`**.

---

## Capabilities as access control

In **Tauri 2**, **capabilities** map **windows/webviews** to allowed **Tauri plugin APIs** and **commands**. This is your **ACL** — default deny, explicit allow — **`rust-core-and-commands.md`**.

---

## Threading and async

Long Rust work on the **wrong** thread can freeze UI. Prefer **`async` commands** or background threads for I/O and CPU-heavy tasks — **`failure-modes-detection-mitigation.md`**.

---

## Trust boundaries

Treat **webview content** as **untrusted** if it can load remote HTML or accept pasted markup. Any path from web input → **shell/fs/open** must be validated in Rust — **`security-pro`**.
