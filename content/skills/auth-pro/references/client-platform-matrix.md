# Client platform matrix — storage and flow posture

High-level defaults; validate per app threat model with **`security-pro`**.

| Platform | Credential / session transport | Storage caution |
|----------|----------------------------------|-----------------|
| **Same-site server-rendered web** | HttpOnly session cookie | CSRF strategy for mutations |
| **Cross-origin SPA + API** | OIDC code + PKCE; often short bearer + refresh or **BFF** | Avoid long-lived refresh in **`localStorage`** |
| **Mobile native** | OAuth best practices; deep links | **Keychain / Keystore**; jailbreak/root risk awareness |
| **Desktop app** | Loopback redirect or system browser | Secure storage APIs; update channel trust |
| **CLI** | Device code or API token in OS secret store | Prompt for token paste anti-patterns |
| **Server app (confidential)** | Client credentials or mTLS | Secrets in vault; no secrets in repo |
| **Edge / worker** | Short-lived tokens from control plane | Ephemeral env; minimal privilege |

**BFF** — browser talks only to your origin; tokens stay server-side — often reduces XSS blast radius vs browser-held refresh tokens.
