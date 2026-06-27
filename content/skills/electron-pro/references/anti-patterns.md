# Electron — anti-patterns

1. **`nodeIntegration: true` in renderer** — Massive attack surface; use preload bridge.

2. **Trusting IPC payloads** — Validate paths, sizes, and auth in **main**; never execute arbitrary renderer-supplied code.

3. **`remote` module patterns (removed)** — Migrate to `ipcMain`/`ipcRenderer` or `contextBridge`.

4. **Disabling `webSecurity` for convenience** — Opens CSRF-like issues; fix CORS and CSP properly.

5. **Exposing full `fs` or `shell` to renderer** — Narrow API surface via typed preload.

6. **Skipping code signing** — Users cannot trust updates; macOS/Windows warnings.

7. **Same-origin confusion for `file://` and custom protocols** — Define navigation allowlists.

8. **DevTools left on in production** — Information leak; gate behind env.

**When NOT to add native modules:** Pure JS solution exists and ABI pain outweighs benefit.
