# Electron — integration map

| Combined skill | Why | `electron-pro` owns | Other skill owns |
|----------------|-----|----------------------|------------------|
| **`react-pro`** | Renderer UI | IPC contracts, `webPreferences` | Components, hooks |
| **`security-pro`** | Threat model | IPC hardening, sandbox narrative | Org-wide policies |
| **`testing-pro`** | E2E | Playwright Electron harness | Test cases |
| **`deployment-pro`** | Release | Channels, artifacts | Infra outside desktop |
| **`ci-cd-pro`** | Build matrix | electron-builder/Forge in CI | Workflow YAML, cache |
| **`design-system-pro`** | Dense desktop UI | IPC boundaries | Shortcuts, density, focus |
| **`docker-pro`** | Headless CI / Linux packaging tests | Electron test harness assumptions | Container base images |
| **`tauri-pro`** | Alternative stack | — | Tauri-only patterns |

**Handoff:** Signing/notarization steps often need **platform** docs + Apple/Microsoft accounts — document owner.
