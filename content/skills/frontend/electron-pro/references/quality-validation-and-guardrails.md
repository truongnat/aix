# Quality validation and guardrails (anti-hallucination)

## APIs and versions

- [ ] **Electron major** — Deprecated APIs (`remote`, old `crashReporter` shapes) differ by version; say **“check docs for your Electron X”** instead of inventing signatures — **`versions.md`**.
- [ ] **Do not fabricate** signing identities, Team IDs, or notarization UUIDs — describe steps and link official Apple/Microsoft docs.

## Code snippets

- [ ] **`webPreferences`** shown must match **security baseline** (`contextIsolation`, `nodeIntegration: false`) unless the user explicitly asked for legacy migration — note risk — **`anti-patterns.md`**.
- [ ] **IPC channel names** — Use neutral examples (`app:open-file`) not pretend project-specific taxonomy.

## Claims

- [ ] **“Sandbox: true works everywhere”** — false for some native addons and edge capabilities; qualify — **`electron-architecture-and-trust-boundaries.md`**.
- [ ] **Auto-update “just works”** — requires hosting, signing, and OS-specific trust; defer pipeline detail to **`deployment-pro`** / **`ci-cd-pro`**.
