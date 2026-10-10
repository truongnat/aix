# Auth — versions

Treat **provider release notes** and **library majors** as primary sources; this file flags common drift points when pairing `auth-pro` with stack skills.

## OAuth/OIDC flows and expectations

- **Implicit flow** — Deprecated for browser public clients; use **authorization code + PKCE** ([OAuth 2.1 direction](https://oauth.net/2.1/) / OIDC).
- **PKCE** — Assume **required** for public/native clients; check your IdP’s minimum client settings.
- **Issuer metadata** — Discovery document (`/.well-known/openid-configuration`) can lag; failures often mean clock skew or wrong issuer string.

## JWKS and signing keys

- **Rotation** — Providers rotate signing keys without downtime; caches must respect `**kid`** and refetch JWKS on unknown key / periodic TTL.
- **Algorithms** — Prefer `**RS256`** / `**ES256**` at gateway; reject `**none**` and surprising algs unless explicitly supported and audited.

## JWT libraries

- **Algorithm support** and **JWKS** behavior differ by major; validate **issuer**, **audience**, **exp**, **nbf** explicitly—do not rely on defaults alone.

## Providers (behavior varies by tenant)

- **Consent / admin policies** — PKCE, refresh rotation, token lifetimes often **tenant-configurable**, not universal defaults.
- **Deprecation** — Legacy endpoints (implicit, password grant where restricted) disappear on vendor timelines; verify against current docs.

## Auth.js / NextAuth.js

- **Major migrations** rename exports and session callbacks; JWT vs database session strategy affects **SSR** cookie behavior — follow official migration guide for your major and pair with `**nextjs-pro`**.
- **OAuth provider configs** drift with IdP dashboards; duplicate config in code and portal must stay aligned.

## Passport.js ecosystem

- **Strategy packages** are maintained independently; pinning compatible `**passport`**, strategy, and **OAuth client** majors avoids subtle session serialization bugs.

## Framework auth (general)

- Guards/middleware **order** and **cookie** APIs change across majors — always cross-check framework changelog alongside this skill.