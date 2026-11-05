# Tips and tricks

Practical defaults for engineers; pair detailed threat analysis with `**security-pro**`.

## Sessions and cookies (browser)

- Prefer **opaque server-side sessions** when you need instant revocation without distributed token deny-lists.
- `**__Host-`** cookie prefix helps lock name and `Secure`; use when all traffic is HTTPS on one host.
- `**SameSite=Lax**` is a common default for SPAs hitting same-site APIs; `**Strict**` where navigation from external sites must not carry session cookies on first request — validate against your UX.
- **Rotate session ID after login** (successful authentication) to reduce fixation risk.
- Separate **reading** vs **mutating** routes when designing CSRF: anything that changes state with cookie auth needs a CSRF strategy.

## Bearer access + refresh

- **Single-flight refresh**: deduplicate concurrent refresh requests so multiple tabs do not mint competing refresh chains.
- **Reuse detection**: if an old refresh token appears after rotation, revoke the whole session family (risk of theft).
- **Separate access TTL from refresh TTL** consciously — short access, constrained refresh rotation.

## SPA and mobile storage

- Avoid **long-lived tokens in `localStorage`** on the web where XSS is plausible; prefer **HttpOnly cookie** flows, **native Keychain/Keystore**, or **short-lived memory** tokens plus refresh via secure channel per platform docs.
- For SPA + API on **different sites**, evaluate **Backend-for-frontend (BFF)** so the browser talks same-origin to your server and tokens stay server-side.

## OAuth / OIDC ergonomics

- Keep **redirect URI allowlist** exact; avoid wildcards that enable open redirects.
- Validate `**state`** (CSRF for OAuth) and `**nonce**` (OIDC id_token binding) on return paths.
- Prefer **authorization code + PKCE** for public/native clients; treat **implicit** as legacy.

## MFA and risk signals

- Require **phishing-resistant** factors for privileged accounts where possible (**WebAuthn**/passkeys over SMS).
- Use **step-up auth** for sensitive actions (payout, delete org) even when session is valid.

## API keys and M2M

- Scope keys to **environment + least privilege**; avoid one god key per partner.
- Automate **rotation** and **audit key usage** (last used, caller identity).

## Naming and maintainability

- Permission strings: stable `**resource:action`** or `**resource:action:scope**` conventions; avoid vague `admin` blobs at the API layer.

## Abuse and availability

- Apply **rate limits** on login, password reset, MFA verify, and token endpoints — coordinate with `**security-pro`** for lockout vs CAPTCHA trade-offs.
- Plan **read-only degradation** when IdP is down (cached sessions vs hard fail) explicitly.

## Observability (minimal)

- Log **authentication** outcomes (success/fail reason category), **refresh**, **logout**, **authz deny** — without secrets or raw tokens — see `**token-session-lifecycle.md`**.

