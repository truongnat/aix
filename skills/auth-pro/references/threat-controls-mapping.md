# Threat-oriented control mapping

Relates common **abuse patterns** to **control families** — not a substitute for **`security-pro`** threat modeling.

| Threat | Control directions (architecture) |
|--------|-------------------------------------|
| **Brute force / credential stuffing** | Rate limits, lockout or CAPTCHA policy, breached-password checks |
| **Password spraying** | Same + distinct messaging; avoid per-user enumeration leaks if required |
| **Phishing** | Phishing-resistant factors (**WebAuthn**), short session TTL, step-up for sensitive ops |
| **Token theft** (XSS, malware) | Short access TTL, refresh rotation + reuse detection, HttpOnly cookies, BFF |
| **Token replay** | Short TTL, **`jti`** or idempotent design, audience binding |
| **CSRF** | SameSite, tokens, or BFF — paired with cookie session model |
| **Session fixation** | Regenerate session after login — **`session-management.md`** |
| **Downgrade attacks** | Enforce MFA on security settings; TLS everywhere; strip weak auth methods for privileged roles |
| **Stale privilege** | Invalidate sessions on role change; short access tokens; authz not from stale JWT claims alone |
| **Confused deputy / wrong audience** | Strict **`aud`** / resource indicators for tokens |
| **Tenant confusion** | Tenant in authz path always — **`authorization-architecture-review.md`** |

Use **`testing-pro`** for abuse-case tests derived from this table.
