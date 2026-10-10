# Auth — anti-patterns

1. **Trusting role claims from JWT without server-side lookup** — Clients can forge if signing keys leak; verify permissions against DB or policy service for sensitive actions.
2. **Long-lived access tokens** — Stolen token = long session; prefer short access + refresh with rotation and reuse detection.
3. **Refresh tokens in localStorage (web)** — XSS steals tokens; prefer HttpOnly cookies or secure native storage patterns.
4. **Missing CSRF protection on cookie-based session mutations** — Use SameSite, CSRF tokens, or double-submit cookie pattern.
5. **Passwords in logs or error messages** — Never log auth payloads; sanitize exception handlers.
6. **Admin “backdoor” endpoints in production** — Feature flags or break-glass only with audit.
7. **Synchronizing tokens across tabs without care** — Race conditions on refresh; use single-flight refresh pattern.
8. **Storing raw refresh tokens in DB without hashing** — Database leak = account takeover; hash like passwords when stored.
9. **Authorization in the client only** — UI hiding buttons is not security; enforce on server.
10. **Ignoring MFA for privileged accounts** — Admins and production access should require step-up.

When NOT to use JWT for everything: opaque server-side sessions can simplify revocation; choose per threat model with **`security-pro`**.