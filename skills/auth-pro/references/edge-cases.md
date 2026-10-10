# Edge cases (catalog)

Use as a **review scan list**; not every product needs every item. Cross-link fix guidance to focused references.

## Token / session

- **Clock skew**: token expired / not-yet-valid across hosts — align NTP, widen tolerance consciously.
- **Partial revocation**: role removed but **cached** JWT or CDN still authorizes — shorten TTL or check revocation policy.
- **Cross-device logout**: one device logout does not end others — define **family** revocation.
- **Refresh race**: multiple tabs refresh concurrently — **single-flight** + reuse detection (**`tips-and-tricks.md`**).
- **Refresh reuse false positive**: retries after network glitch — safe retry ids vs theft detection tuning.
- **Logout UX vs server**: client cleared but server session lives — **`session-management.md`**.
- **Key rotation storm**: JWKS rollover invalidates many tokens — overlap keys; cache TTL (**`versions.md`**).
- **Audience misuse**: token for API A replayed at B — strict **`aud`** (**`oauth-oidc-patterns.md`**).
- **Oversized JWT**: entitlements inflate claims — move authz server-side (**`authorization-architecture-review.md`**).
- **Stale tenant/group**: user moved tenant but token claims old — invalidate on boundary change.

## Web / browser

- **SameSite surprises**: federation or subdomains break cookie send — explicit domain model.
- **Cookie path/domain**: wrong scope leaks or misses session (**`session-management.md`**).
- **CSRF on logout / refresh / email change**: any **auth state mutation** needs CSRF strategy.
- **Session fixation**: anonymous → login without ID change — regenerate after login.
- **SSR vs SPA desync**: hydration assumes logged-in; API returns 401 — contract between layers.
- **Browser restore**: bfcache restores authenticated page — sensitive actions still need server checks.

## MFA / recovery

- **Phone changed** but SMS still MFA factor for old number — verification on factor change.
- **Support resets MFA** too easily — takeover vector (**`account-recovery-breakglass.md`**).
- **Backup codes** reused or not rotated — treat as secrets.
- **Remember device** too long for privileged actions (**`mfa-and-assurance.md`**).
- **Step-up skipped** after mid-session **role elevation** — re-evaluate assurance.

## Multi-tenant / authz

- **Active tenant** not bound on request — ambiguous context.
- **Cache key** missing tenant — cross-tenant bleed.
- **JOIN drops tenant predicate** — **`postgresql-pro`** RLS last line.
- **Global vs tenant admin** confusion — **`authorization-architecture-review.md`**.
- **Support impersonation** unaudited — forbidden pattern.
- **Role downgrade** without session invalidation — stale sessions.

## Federation / enterprise

- **Group claim renamed** at IdP — entitlement drift.
- **JIT duplicate** races — uniqueness on **`sub`+iss**.
- **Email changed at IdP** breaks linking — **`federation-enterprise-lifecycle.md`**.
- **SCIM lag**: user disabled in HR but tokens work — reconcile windows.
- **JWKS stale cache** during rollover — shorten TTL or backoff refresh.

## Service-to-service

- **Cert rollover** skew between clients — **`workload-machine-auth.md`**.
- **Shared API key** across microservices — loses audit trail.
- **Broad machine identity** exceeds human privilege — principle of least privilege.

## Earlier baseline (still common)

- **Cross-device inconsistency**, **tenant boundary drift**, **IdP outage**, **OAuth state mismatch**, **account linking collisions**, **regional residency**, **break-glass** — keep prior incident learnings.
