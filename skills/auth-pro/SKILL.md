---
name: auth-pro
description: |
  Professional authentication and authorization guidance across web/mobile/API systems: identity flows, credential and token lifecycle, session/JWT/OAuth/OIDC/API-key patterns, and policy enforcement models (RBAC/ABAC/ReBAC).

  Use this skill when the user asks to design or review auth architecture, compare auth methods, implement secure login/session/token flows, enforce authorization boundaries, or troubleshoot access-control failures and token misuse.

  Do not use as the only skill for framework-specific wiring, IdP portal configuration, deep pentesting, or full database schema design — combine with stack and security skills (see Boundary).

  Use **with** **`security-pro`** for broader threat modeling and hardening, **`nestjs-pro`** / **`nextjs-pro`** for framework wiring, **`postgresql-pro`** for data-layer policy/RLS boundaries, and **`testing-pro`** for auth regression and abuse-case tests.

  Triggers: "authentication", "authorization", "auth", "login", "session", "session management", "JWT", "OAuth", "OIDC", "SAML", "API key", "mTLS", "RBAC", "ABAC", "ReBAC", "MFA", "WebAuthn", "passkeys", "PKCE", "refresh token", "SSO", "access control", "BFF", "OAuth scopes", "device flow", "magic link", "account lifecycle", "SCIM", "JIT provisioning", "password reset", "credential stuffing", "break-glass", "impersonation".

metadata:
  short-description: Auth — identity lifecycle, sessions, OAuth, authz, federation, observability
  content-language: en
  domain: identity-access
  level: professional
---

# Authentication and authorization (professional)

Skill text is **English**; answer in the user’s preferred language when Cursor User Rules, project rules, or the conversation specify it (identifiers and specs stay in English).

Use standards and vendor docs as authority for protocol details: [OAuth 2.0 (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749), [OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html), and [JWT (RFC 7519)](https://datatracker.ietf.org/doc/html/rfc7519); align operational expectations with OWASP cheat-sheet areas (authentication, session management, authorization, OAuth) and digital-identity lifecycle concepts **at architecture level**. This skill encodes **method-selection discipline**, **least-privilege authorization design**, **identity/authenticator/session lifecycle boundaries**, and **token/session safety**. Confirm **trust boundaries**, **client types** (web/mobile/machine), **threat model**, and **compliance constraints** before proposing a solution.

## Boundary

**`auth-pro`** owns authn/authz **method and policy architecture**, **identity and authenticator lifecycle** (design), **session management policy**, token/session **lifecycle**, **federation posture**, **recovery/break-glass patterns**, **observability categories**, and **which pattern fits which context**. It does **not** own framework-specific APIs, vendor console clicks, deep pentest methodology alone, or raw database DDL — combine with **`security-pro`**, **`postgresql-pro`**, and stack skills as needed.

| Skill | When to combine with **`auth-pro`** |
|-------|-------------------------------------|
| **`security-pro`** | Threat modeling, abuse scenarios, defense-in-depth controls |
| **`nestjs-pro`** / **`nextjs-pro`** | Guards/middleware/session wiring and framework APIs |
| **`postgresql-pro`** | RLS and data ownership constraints for authz enforcement |
| **`testing-pro`** | Auth flow tests, permission regression, token/session abuse tests |

## When to use

- Choosing among session, JWT, OAuth/OIDC, SAML, API key, or mTLS by context.
- Designing user auth, service-to-service auth, delegated authorization, MFA/passkeys, or OAuth/OIDC flows (PKCE, BFF, device flow).
- **Account / identity lifecycle** (signup, verification, suspend, delete, linking), **recovery**, **authenticator lifecycle**, **session management** (timeouts, fixation, logout semantics).
- Building RBAC/ABAC/ReBAC, **authorization review matrices**, tenant-aware policies, federation (JIT/SCIM) **architecture**.
- Hardening token/session lifecycle (issue, rotate, revoke, expire, recover).
- Reviewing or debugging broken permissions, stale sessions, and auth bypass risks.
- Trigger keywords: `authentication`, `authorization`, `JWT`, `OAuth`, `OIDC`, `RBAC`, `ABAC`, `MFA`, `SSO`, `PKCE`, `WebAuthn`

## When not to use

- **Framework wiring only** — route guards, middleware order, cookie APIs, DI (**`nestjs-pro`**, **`nextjs-pro`**) without an auth architecture question.
- **IdP / vendor admin** — Azure AD/Okta/GCP IAM console steps, SAML metadata exchange, SLAs — use vendor docs + often **`security-pro`** for review.
- **Database mechanics as the main ask** — RLS SQL, indexes, migrations — primary owner is **`postgresql-pro`** (pair with this skill for policy intent).
- **Deep pentest / formal threat modeling** — primary owner **`security-pro`**.
- **Legal / compliance packaging** — SOC2 mapping, contract language — outside this skill.
- **“Implement my app’s auth in code” with no architecture scope** — still combine with the stack skill; **`auth-pro`** supplies patterns, not drop-in modules.
- **“Configure my tenant’s SSO” without IdP documentation** — do not guess portal settings.

## Required inputs

Gather (or ask for) minimally:

- **Actors** — end users, admins, services, partners.
- **Trust boundaries** — browser, API, BFF, IdP, data store.
- **Client type** — server-rendered web, SPA, mobile native, machine (M2M).
- **Sensitivity / assurance** — public vs PII vs financial; regulated context.
- **Constraints** — existing IdP, mobile offline, multi-tenant, latency, on-prem vs cloud.

## Expected output

Responses should follow **Suggested response format** so outputs are comparable: **Context** → **Authentication recommendation** → **Authorization recommendation** → **Token/session lifecycle** → **Implementation / infrastructure notes** → **Residual risks & verification**.

## Workflow

1. Confirm actors, trust boundaries, client types, data sensitivity, and required assurance level.
2. Apply operating principles and summaries below; open `references/` for depth; keep authn method and authz enforcement boundaries explicit.
3. Respond using **Suggested response format**; note token leakage, privilege escalation, and revocation gaps.

### Operating principles

1. **Identity proofing before access** — authn strength must match risk level.
2. **Authz is server-side truth** — never trust client role claims without verification.
3. **Least privilege by default** — deny-first policy and scoped permissions.
4. **Short-lived credentials** — minimize token/session lifetime and rotate secrets.
5. **Explicit lifecycle controls** — issuance, refresh, revocation, and auditability are mandatory.
6. **Method follows context** — choose protocols by actor, trust, and operational constraints.

## Default recommendations by scenario

Use when the ask is underspecified; override when constraints conflict.

| Scenario | Default stack (high level) |
|----------|------------------------------|
| First-party web app, same site / traditional server-rendered | Session cookie (**HttpOnly**, **Secure**, **SameSite** appropriate); **CSRF** for state-changing cookie auth |
| SPA / mobile / public OAuth client | **OIDC** authorization code **+ PKCE**; tokens not in long-lived client storage where avoidable |
| SPA + API with strong XSS concern | Evaluate **BFF** (same-origin session to your server) vs short-lived bearer — see **oauth-oidc-patterns.md** |
| Stateless internal API | **Short-lived JWT** + **audience** / **issuer** checks; prefer gateway-issued tokens for M2M |
| Service-to-service (internal) | **mTLS** or **signed** service tokens + network allowlists; avoid long-lived shared secrets |
| B2B / multi-tenant SaaS | **OIDC** (or SAML for enterprise) + **RBAC/ABAC** + **tenant isolation** enforced server-side (and often RLS) |

Cross-check [references/decision-tree.md](references/decision-tree.md) and [references/authentication-methods-and-selection.md](references/authentication-methods-and-selection.md).

## Decision trees

**Session vs JWT vs opaque token**, **OAuth/OIDC vs custom**, **RBAC vs ABAC vs ReBAC**, **mTLS vs API key**, **MFA depth**, **SPA token channel** — structured trees in reference.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Examples: trusting client **role** claims in JWT, long-lived access tokens, refresh in `localStorage`, missing **CSRF** on cookie sessions, auth only in the client.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Authentication methods and selection (summary)

- Session, JWT, OAuth/OIDC, SAML, API key, mTLS, WebAuthn/passkeys, BFF vs bearer SPA, workload identity — when each fits.

Details: [references/authentication-methods-and-selection.md](references/authentication-methods-and-selection.md)

### OAuth / OIDC patterns (summary)

- Authorization code + PKCE, client types, redirect/state/nonce, scopes vs API authz, device flow — architecture checklist.

Details: [references/oauth-oidc-patterns.md](references/oauth-oidc-patterns.md)

### MFA, step-up, and assurance (summary)

- Factor strength, phishing resistance, step-up vs session MFA, passkeys/magic links at architecture level.

Details: [references/mfa-and-assurance.md](references/mfa-and-assurance.md)

### Authorization models and policy design (summary)

- RBAC/ABAC/ReBAC, OAuth scopes vs app permissions, tenant isolation, impersonation guardrails.

Details: [references/authorization-models-and-policy.md](references/authorization-models-and-policy.md)

### Token/session lifecycle and hardening (summary)

- Issuance, validation, **jti**/replay considerations, rotation, revocation, observability categories.

Details: [references/token-session-lifecycle.md](references/token-session-lifecycle.md)

### Tips and tricks (summary)

- Cookies, refresh reuse, rate limits, SameSite, permission naming — operational defaults.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

- Expanded catalog: tokens, browser, MFA/recovery, tenant, federation, M2M — see reference.

Details: [references/edge-cases.md](references/edge-cases.md)

### Extended domain — lifecycle and operations

Use when the task goes beyond method/token selection into **full auth domain** review.

| Focus | References |
|-------|------------|
| Identity & accounts | [identity-account-lifecycle.md](references/identity-account-lifecycle.md), [account-recovery-breakglass.md](references/account-recovery-breakglass.md) |
| Authenticators & passwords | [authenticators-lifecycle.md](references/authenticators-lifecycle.md), [passwords-and-verifiers.md](references/passwords-and-verifiers.md) |
| Web sessions & clients | [session-management.md](references/session-management.md), [client-platform-matrix.md](references/client-platform-matrix.md) |
| Authorization depth | [authorization-architecture-review.md](references/authorization-architecture-review.md) (+ [authorization-models-and-policy.md](references/authorization-models-and-policy.md)) |
| Federation & M2M | [federation-enterprise-lifecycle.md](references/federation-enterprise-lifecycle.md), [workload-machine-auth.md](references/workload-machine-auth.md) |
| Observability & threats | [auth-observability-detection.md](references/auth-observability-detection.md), [threat-controls-mapping.md](references/threat-controls-mapping.md) |

### Versions (summary)

- OAuth/OIDC drift (implicit vs PKCE), JWKS rotation, JWT library majors, Auth.js / NextAuth / Passport caveats.

Details: [references/versions.md](references/versions.md)

## Cross-skill handoffs

**`security-pro`** (threat model), **`nestjs-pro`** / **`nextjs-pro`** (wiring), **`postgresql-pro`** (RLS), **`deployment-pro`** (secrets/TLS posture), **`testing-pro`** (abuse tests).

Details: [references/integration-map.md](references/integration-map.md)

## Suggested response format (implement / review)

Answer so these blocks are explicit (skip only if clearly N/A; say why):

1. **Context** — Actors, **client type** (browser / SPA / mobile / machine), **trust boundaries**, data sensitivity, compliance hooks.
2. **Authentication recommendation** — Chosen method(s), assurance level (incl. MFA/WebAuthn where relevant), rationale vs alternatives.
3. **Authorization recommendation** — Model (RBAC/ABAC/ReBAC/etc.), enforcement surface (API/gateway/DB); never trust raw client role claims for sensitive actions.
4. **Token/session lifecycle** — Issuance, storage (cookie vs bearer), rotation, revocation, logout; **audience/scope/expiry**.
5. **Implementation / infrastructure notes** — What to wire in code vs platform (brief); pair with stack skills for APIs.
6. **Residual risks & verification** — CSRF/XSS posture for cookie flows, audit/monitoring gaps, tests to run (**`testing-pro`**).

Optional diagram or pseudocode under **Implementation / infrastructure notes** when it clarifies flow.

## Resources in this skill

- `references/` — full-stack auth domain: methods, lifecycle, sessions, federation, observability.

| Topic | File |
|-------|------|
| Authentication methods and selection | [references/authentication-methods-and-selection.md](references/authentication-methods-and-selection.md) |
| OAuth / OIDC patterns | [references/oauth-oidc-patterns.md](references/oauth-oidc-patterns.md) |
| MFA, step-up, assurance | [references/mfa-and-assurance.md](references/mfa-and-assurance.md) |
| Authorization models and policy | [references/authorization-models-and-policy.md](references/authorization-models-and-policy.md) |
| Authorization architecture review | [references/authorization-architecture-review.md](references/authorization-architecture-review.md) |
| Identity / account lifecycle | [references/identity-account-lifecycle.md](references/identity-account-lifecycle.md) |
| Authenticators lifecycle | [references/authenticators-lifecycle.md](references/authenticators-lifecycle.md) |
| Passwords and verifiers | [references/passwords-and-verifiers.md](references/passwords-and-verifiers.md) |
| Account recovery & break-glass | [references/account-recovery-breakglass.md](references/account-recovery-breakglass.md) |
| Session management | [references/session-management.md](references/session-management.md) |
| Client platform matrix | [references/client-platform-matrix.md](references/client-platform-matrix.md) |
| Federation / enterprise | [references/federation-enterprise-lifecycle.md](references/federation-enterprise-lifecycle.md) |
| Workload / machine auth | [references/workload-machine-auth.md](references/workload-machine-auth.md) |
| Observability & detection | [references/auth-observability-detection.md](references/auth-observability-detection.md) |
| Threat controls mapping | [references/threat-controls-mapping.md](references/threat-controls-mapping.md) |
| Token/session lifecycle | [references/token-session-lifecycle.md](references/token-session-lifecycle.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Simple (common)

**Input:** "Need full auth for web + mobile + API partners. Which methods should we use?"  
**Expected output:** Follow **Suggested response format** — include method matrix, lifecycle, stack handoffs, rollout/testing notes, residual risks.

### 2 — Tricky (edge case)

**Input:** JWT access token includes `role: admin` claim; API trusts it for `/admin` routes.  
**Expected output:** Reject pattern; authz server-side from DB/policy; JWT as identity carrier only; cite [anti-patterns.md](references/anti-patterns.md).

### 3 — Cross-skill

**Input:** Multi-tenant SaaS — ensure tenant A cannot read tenant B’s rows.  
**Expected output:** **`auth-pro`** identity + policy; **`postgresql-pro`** RLS and indexes; **`nestjs-pro`** transaction + `SET LOCAL` if applicable.

## Checklist before calling the skill done

### Always (every review)

- [ ] Actors and trust boundaries are explicitly defined.
- [ ] Authn method matches client types and risk profile.
- [ ] Authz model and server-side enforcement points are clear (no trusting client **role** claims for sensitive actions).
- [ ] Token/session lifecycle complete (issue/rotate/revoke/expire).
- [ ] Residual risks and verification strategy documented.

### Browser-first / same-site web

- [ ] **Session cookie** flags (**HttpOnly**, **Secure**, **SameSite**) and session fixation mitigations considered.
- [ ] **CSRF** strategy explicit for cookie-authenticated state-changing requests.

### SPA / mobile / public OAuth client

- [ ] **OIDC + PKCE** (or equivalent); no implicit-flow assumptions.
- [ ] **Refresh** storage and rotation strategy avoids insecure long-lived secrets; **BFF** evaluated if XSS risk is high.

### Machine-to-machine / internal APIs

- [ ] **Audience** / **issuer** validation for bearer tokens; prefer short-lived credentials.
- [ ] **mTLS** or signed service identity considered where appropriate.

### Enterprise SSO (SAML / OIDC workspace)

- [ ] IdP metadata, clock skew, **NameID**/subject mapping, account linking risks covered at architecture level.

### Multi-tenant SaaS

- [ ] **Tenant isolation** in authz path (not only UI); **`postgresql-pro`** if RLS applies.

### MFA and high-risk actions

- [ ] **MFA** / **step-up** policy matches privilege and data sensitivity; cite **`mfa-and-assurance.md`** when relevant.

### Lifecycle & recovery

- [ ] **Identity/account** transitions (signup → verify → active → offboard) and **authenticator** enroll/revoke paths considered.
- [ ] **Recovery** and **break-glass** flows resist takeover; support actions audited (**`account-recovery-breakglass.md`**).

### Observability & abuse

- [ ] **Auth events** (login, MFA change, deny, admin) logged with correlation IDs — **`auth-observability-detection.md`**.
- [ ] **Threat controls** table consulted for brute force, stuffing, stale privilege (**`threat-controls-mapping.md`**).

### Anti-regression

- [ ] Client-side-only authorization not relied on for sensitive operations.
- [ ] **Token storage** and **CSRF** posture explicit for cookie- vs bearer-based sessions.
