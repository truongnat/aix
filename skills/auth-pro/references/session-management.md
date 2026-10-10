# Session management (web and cookie-centric)

Complements **`token-session-lifecycle.md`** (bearers/JWT). Focus: **browser sessions**, **session identifiers**, **timeouts**, **logout**. Align with OWASP Session Management guidance at policy level.

## Session identifier

- **Entropy** — unpredictable IDs; server-side opaque session store often simpler than embedding all state in JWT for revocation.
- **Regenerate ID on privilege change** — especially after **login success** (mitigate fixation).
- **Bind** session to client context where appropriate — UA/IP signals as **risk** inputs, not sole proof (mobile NAT changes).

## Timeouts

- **Idle timeout** — inactivity clock.
- **Absolute timeout** — maximum session lifetime regardless of activity — especially for privileged sessions.
- **Remember me** — separate long-lived cookie with **strict scope** and **distinct theft impact** analysis.

## Concurrency and UX

- **Concurrent sessions** — allow/deny/list — policy decision with privacy and security trade-offs.
- **Per-device logout** vs **global logout** — SSO may need IdP session termination integration.

## Tab / refresh races

- **Single-flight refresh** for tokens; serialize session extension updates where needed.

## Cookie transport

- **HttpOnly**, **Secure**, **SameSite** appropriate to CSRF model — see **`tips-and-tricks.md`**.
- **Path / Domain** misconfiguration can leak sessions across paths or break SSO — validate for your tree.

## CSRF on “non-obvious” mutations

- Session-bound actions include **logout**, **email change**, **refresh** in some designs — anything that mutates server-side auth state needs CSRF strategy.

## Review checklist

- [ ] **Fixation** mitigated (regenerate after auth).
- [ ] **Idle + absolute** timeouts defined for privileged vs normal.
- [ ] **Logout** clears server session and client cookies per model.
- [ ] **Concurrent session** policy explicit.
