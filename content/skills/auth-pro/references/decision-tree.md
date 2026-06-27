# Auth — decision trees

## Session cookie vs bearer JWT vs opaque token

```
Browser-first web app, same site?
├── HttpOnly Secure SameSite session cookie often simplest — CSRF strategy required
└── SPA + API on different domain / mobile / machine clients?
    └── Bearer access token (short TTL) + refresh flow; storage trade-offs per platform
```

## OAuth/OIDC vs custom username/password API

```
Outsourcing identity to Google, Microsoft, Okta?
├── OIDC authorization code + PKCE for public clients
└── First-party only, controlled UX?
    └── Custom credentials + strong password policy + MFA — still use standard crypto (argon2/bcrypt)
```

## RBAC vs ABAC vs ReBAC

```
Permissions are stable roles (admin, editor)?
├── RBAC — simple matrices; watch role explosion
├── Attributes on user/resource (region, clearance)?
│   └── ABAC — policy engine complexity
└── Relationships (org graph, document sharing)?
    └── ReBAC — often Zanzari-style; pair with `authorization-models-and-policy.md`
```

## Where to enforce authorization

```
Request hits your API?
├── Server-side guard (Nest) / middleware — never trust client-only checks
└── Database must hold line even if app bugs?
    └── RLS / DB grants — combine with `postgresql-pro`
```

## mTLS vs API key for service-to-service

```
Both sides are your infra with cert rotation?
├── mTLS — strong, ops-heavy
└── Third parties or quick internal?
    └── Signed tokens or scoped API keys with rotation and audit
```

## MFA depth vs password-only

```
High-risk or privileged users?
├── Require phishing-resistant factor (WebAuthn/passkeys) or step-up — see mfa-and-assurance.md
└── Consumer low-risk?
    └── Risk-based MFA or optional TOTP — align with security-pro for abuse signals
```

## Token channel for SPA

```
Browser must call API directly with bearer?
├── Short TTL + strict storage review
└── Can you own a same-origin BFF?
    └── Session cookie to BFF + server-side token exchange — often simpler XSS story
```

When NOT to build custom auth: buy IdP + OIDC for most B2B SaaS unless you have dedicated security engineering.