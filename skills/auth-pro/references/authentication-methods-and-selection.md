# Authentication methods and selection

Start from **actor**, **trust boundary**, and **data sensitivity** — then minimize credential exposure and operational burden.

## Core patterns

- **Session-based auth** — Strong fit for **first-party web** with **HttpOnly** cookies and server-side session store; pairs with CSRF controls for mutations.
- **JWT bearer tokens** — Useful for **stateless APIs** and some microservice meshes; enforce **issuer**, **audience**, **exp**, short TTL; authz claims are **hints** unless backed by policy service — see **`anti-patterns.md`**.
- **OAuth 2.0 / OIDC** — Default for **delegated login**, **enterprise SSO**, and **social** logins; use **authorization code + PKCE** for public clients — see **`oauth-oidc-patterns.md`**.
- **SAML** — Still common in **enterprise federation**; heavier XML/metadata lifecycle; align clock skew and NameID mapping with IdP docs.
- **API key / mTLS** — **Machine-to-machine** and partner APIs; narrow scope, rotation, audit; prefer **short-lived tokens** or **mTLS** when both sides are your infra.
- **Workload identity** (e.g. SPIFFE-compatible) — **Kubernetes / cloud** service identity; certs or JWTs tied to workload, not humans — pair with platform docs.

## Emerging / supplementary

- **WebAuthn / passkeys** — **Phishing-resistant** possession factor; plan RP ID, recovery, and multi-device — **`mfa-and-assurance.md`**.
- **Magic links (email)** — Passwordless UX; treat as **single-factor** equal to email security; short TTL, rate limits — **`mfa-and-assurance.md`**.
- **Device authorization grant** — TVs, CLI — polling flow; ensure user confirmation on secondary device where applicable.

## SPA + API shapes

- **Bearer from SPA** — Strict TTL, careful storage, CORS clarity.
- **Backend-for-frontend (BFF)** — Same-origin cookie to your server; tokens minted/refreshed server-side — often simpler than long-lived refresh in browser JS.

## Selection rule

1. Start from **actor** and **trust boundary**.
2. Choose protocol minimizing **credential exposure** and **operational complexity** (IdP vs home-grown).
3. Add **MFA** or **step-up** per risk — **`mfa-and-assurance.md`**.
4. Validate **authorization** independently of authn method — **`authorization-models-and-policy.md`**.
