# Observability, logging, and detection (auth domain)

What to instrument for **operations** and **forensics** without violating privacy — align retention with legal. **`security-pro`** owns fraud models and SIEM rules; this file lists **event types** and **categories**.

## Authentication events

- Login **success/fail** — reason class (bad password, locked, MFA fail) without raw secrets.
- **MFA enrollment / removal / challenge** outcomes.
- **Password reset** requested and completed.
- **Factor reset** by user or support — tie to **support ticket id** if applicable.

## Session and token

- **Refresh** issued, failed, **reuse suspected** — see **`token-session-lifecycle.md`**.
- **Logout** and **global logout** initiated.

## Authorization

- **Deny** — resource type, rule id, **subject id** — avoid logging full PII payloads.
- **Elevated** actions — admin, impersonation, break-glass.

## Detection-friendly signals (policy)

- **Velocity** — many failures from one IP/subject.
- **Geo / impossible travel** — coarse; privacy-sensitive; use as risk signal not sole block.
- **Privilege escalation attempts** — role change requests, bulk export.

## Correlation

- **Correlation / request IDs** across gateway and services for incident response.

## Review checklist

- [ ] Logs contain **no** passwords, refresh tokens, or raw **Authorization** headers.
- [ ] **Deny** and **admin** events are queryable for investigations.
