# Token/session lifecycle

Issue, validate, rotate, revoke, and observe credentials across distributed components.

## Issuance and validation

- Bind credentials to **audience**, **issuer**, **scope** (OAuth), and **short expiry** for access tokens.
- Validate **signature**, **iss**, **aud**, **exp**, **nbf** with agreed clock skew; for JWT, prefer **JWKS** with **`kid`** rotation handling.
- Where replay matters, consider **`jti`** deny-list or short TTL + idempotent APIs — threat-model with **`security-pro`**.

## Storage

- Prefer **HttpOnly Secure** cookies or **platform secure storage** over web **`localStorage`** for refresh/long-lived material when XSS is in scope.

## Rotation and revocation

- **Rotate refresh tokens** on use; detect **reuse** and revoke chains on mismatch.
- **Rotate signing keys** on schedule; cache JWKS with TTL and refresh on unknown `kid`.
- **Invalidate sessions** on password reset, MFA disable/add, major role change, or reported compromise.

## Cross-cutting concerns

- **Logout** — clarify **local** vs **global** (all devices), and IdP session vs app session for SSO.
- **Partial revocation** — caches (CDN, JWT without revocation check) may still authorize — document residual risk.

## Observability (minimal viable)

Audit events (categories, not secrets):

- Login success/failure (reason class), MFA challenge outcomes.
- Refresh issued / failed / reuse suspected.
- Token revocation and logout.
- **Authorization deny** with resource type and rule id — avoid logging raw tokens or passwords.

Pair retention and PII rules with **`security-pro`** / compliance stakeholders.
