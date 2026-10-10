# OAuth 2.x / OIDC patterns (architecture level)

Authoritative specs: OAuth 2.x family, [OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html). This file encodes **pattern choice**, not vendor clicks.

## Flow selection

| Situation | Pattern |
|-----------|---------|
| Browser / SPA / native app with external IdP | **Authorization code + PKCE** |
| Confidential server app (secret can be kept server-side) | **Authorization code** (PKCE still recommended defensively) |
| Devices without a browser (TV, CLI) | **Device authorization grant** |
| Legacy implicit in browser | **Avoid** — migrate to code + PKCE |

## Client types

- **Public client** — cannot hold a long-lived secret (SPA, mobile). Never ship client secrets into binaries users control.
- **Confidential client** — server-side app with secret or mTLS client auth; can use standard code flow without PKCE where policy allows (PKCE remains good hygiene).

## Redirect URIs and binding

- Register **exact** redirect URIs; block open redirects and subdomain takeover paths.
- Bind **`state`** to user session to prevent CSRF on the OAuth round trip.
- For OIDC, validate **`nonce`** in id_token for implicit binding to your auth attempt.

## Tokens: what each is for

- **Access token** — presented to resource servers; short-lived; audience/scope describe what APIs may allow.
- **Refresh token** — only at token endpoint; rotate and detect reuse where possible.
- **ID token** (OIDC) — proves authentication event to the client; **not** a substitute for API authorization — verify **`aud`**, **`iss`**, **`exp`**, signature; use **`sub`** as stable user key when linking accounts.

## Scopes vs API authorization

- **OAuth scopes** express **delegated consent** from the user to the client — coarse grain by design.
- Fine-grained **business authorization** (tenant admin, row ownership) still belongs in your **policy/DB** — do not overload scopes with every business rule unless you model that explicitly.

## SPA architectures

- **Pure SPA + bearer to API** — tight token storage and CORS discipline; short TTLs.
- **BFF (same-origin backend)** — browser holds session cookie to BFF; BFF exchanges or holds tokens server-side — often simpler XSS posture than long-lived browser-stored refresh tokens.

## Service accounts and M2M

- Prefer **client credentials** or workload identity where user context is absent; scope **machine clients narrowly** (audience, custom claims as agreed contract).

## Common review questions

- Are **refresh tokens** bound to client instance where the IdP supports it?
- Is **JWKS** caching OK with key rotation (`kid`)?
- For multi-tenant SaaS, is **tenant** represented in token claims **and** enforced in policy/DB, not only in UI?
