# Anti-patterns — security-pro

1. **Client-only authorization** — Any rule attackers can bypass in the browser is not enforcement.
2. **Long-lived JWTs with sensitive claims** — Prefer short access + rotation; validate audience/issuer.
3. **PII in URLs, query strings, or client logs** — Leaks via Referer, analytics, support tickets.
4. **Rate limit only “login”** — Abuse often targets expensive endpoints (search, export, webhooks).
5. **“We’ll fix in next sprint” for Critical without compensating control** — Document risk acceptance explicitly.
6. **Copy-paste crypto** — Use vetted libraries and correct parameters (KDF, nonce, AEAD).
7. **Unscoped internal pentest** — No ROE / no staging isolation risks production impact.

See [fundamentals-and-threat-model.md](fundamentals-and-threat-model.md) and [edge-cases.md](edge-cases.md).
