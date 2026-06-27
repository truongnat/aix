# Electron edge cases

## Security footguns

- **`webSecurity: false`** — rarely justified; breaks same-origin rules; revisit **CSP** and **navigation** instead.
- **Remote content** — loading arbitrary URLs in `BrowserWindow` without **navigation** lockdown risks **RCE** via malicious pages + `nodeIntegration` mistakes.
- **Open redirects / custom protocols** — `protocol.handle` and `shell.openExternal` with user-controlled URLs → validate schemes and hosts.

## Platform differences

- **macOS** — hardened runtime, notarization, **entitlements**; window traffic lights vs Windows/Linux chrome.
- **Windows** — Defender SmartScreen; **MSIX** vs Squirrel vs NSIS tradeoffs.
- **Linux** — sandbox and **AppImage** permissions; Wayland vs X11 quirks for screen capture.

## IPC and filesystem

- **Path traversal** — if main reads paths from renderer, normalize and **jail** to allowed roots.
- **Large payloads** — streaming vs buffering over IPC; **DoS** main thread with huge messages.

## Updates and offline

- **Partial update failure** — rollback story; user on metered network; **offline** first-run.

## Crash and recovery

- **Renderer crash** — `webContents.on('render-process-gone')`; reload vs exit policy.
- **Single instance lock** — second-instance events on Windows/Linux.

## CSP and bundled renderer

- **Bundled `file://` or custom protocol** — CSP still matters for inline scripts and **unsafe-eval** if your bundler injects it; tightening CSP may break dev HMR — validate **prod** bundle — **`failure-modes-detection-mitigation.md`**.

## GPU / memory

- **GPU process crashes** — black window or flicker; `--disable-gpu` workarounds trade perf; log GPU feature status when reporting Electron bugs — official troubleshooting docs for your major.

## Accessibility and desktop UX

- **Dense data UIs** — Keyboard model differs from browser tab apps; pair with **`design-system-pro`** for shortcuts and density without breaking focus order.
