# Decision trees — security-pro

## Storing tokens (web)

```
Browser SPA or Next.js client bundle?
├── Prefer HttpOnly, Secure, SameSite cookies for session tokens (mitigate XSS theft)
├── If must use memory — short TTL + refresh rotation; never long-lived tokens in localStorage for sensitive ops
└── Native/mobile → use platform secure storage (see flutter-pro / react-native-pro)
```

## Authn vs authz vs exposure

```
Is the user authenticated?
├── No → authn problem (login, MFA, session issuance)
└── Yes → is this identity allowed for THIS resource/action?
    ├── No → authz (roles, RLS, object-level checks) — server enforced
    └── Yes → still check data exposure (logs, errors, over-fetch)
```

## IDOR / BOLA

```
Resource identified by id in URL/body?
├── Server must resolve id → subject and enforce ownership/tenant on every read/write
└── Never trust client-only checks
```

## SSRF / egress fetch

```
Backend fetches user-supplied URL or webhook callback?
├── Yes → allowlist hosts/schemes; block RFC1918/link-local; separate fetcher with no cloud metadata creds — **`failure-modes-detection-mitigation.md`**
└── No → still validate outbound integrations (payment, webhooks) with signatures and TLS
```

## When to combine skills

```
Fix needs framework wiring (Guard, middleware, RLS policy)?
└── security-pro defines the rule; nestjs-pro / nextjs-pro / postgresql-pro implements
```
