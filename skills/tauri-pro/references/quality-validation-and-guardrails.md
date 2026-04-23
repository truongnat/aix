# Quality validation and guardrails (Tauri)

## Contents

1. [Version accuracy](#version-accuracy)
2. [Secrets and errors](#secrets-and-errors)
3. [Release vs dev parity](#release-vs-dev-parity)
4. [Review checklist](#review-checklist)

---

## Version accuracy

- **Do not invent** `tauri.conf` / `capabilities` keys — they differ between **Tauri 1 and 2**; verify against docs for the user’s major.
- State **Rust MSRV** and **Tauri CLI** when behavior is version-gated — **`versions.md`**.

---

## Secrets and errors

- Never return **API keys**, tokens, or stack traces to the webview in production errors — sanitize in Rust — **`anti-patterns.md`**.

---

## Release vs dev parity

- Test **packaged** app (CSP, asset paths, updater) — dev server can hide issues — **`tips-and-tricks.md`**.

---

## Review checklist

- [ ] Each `#[tauri::command]` validates inputs; errors are safe for UI.
- [ ] Capabilities/plugins are **minimal** per window.
- [ ] No raw user strings to **shell** or **open** without allowlist.
- [ ] CSP reviewed for **shipped** build.
- [ ] Async/blocking choice justified for responsiveness.
