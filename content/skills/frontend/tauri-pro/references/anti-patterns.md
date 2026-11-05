# Tauri — anti-patterns

## `shell: true` with user paths

- Command injection.
- **Fix:** argv array, fixed binary, validate paths; **`security-pro`**.

## Over-broad capabilities

- Any window can call dangerous APIs.
- **Fix:** Per-window capability tables; deny by default.

## Blocking `tauri::command`

- Freezes UI thread feel; thread pool starvation.
- **Fix:** `async` commands; offload CPU work.

## Leaking filesystem paths in errors to webview

- Fingerprinting / info disclosure.
- **Fix:** Map to safe error codes client-side.

## Skipping code signing / notarization

- Gatekeeper warnings; enterprise block.
- **Fix:** CI signing secrets, documented per OS.

## Mixing dev server CSP with prod

- Too loose in shipped build.
- **Fix:** Separate Tauri env configs.
