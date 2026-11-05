# Failure modes — detection and mitigation (security)

## Contents

1. [Access control](#access-control)
2. [Tokens and sessions](#tokens-and-sessions)
3. [Injection and deserialization](#injection-and-deserialization)
4. [SSRF and egress](#ssrf-and-egress)
5. [Supply chain and CI](#supply-chain-and-ci)
6. [Operational leaks](#operational-leaks)

Defensive framing only — **authorized** testing per **[offensive-simulation-and-self-assessment.md](offensive-simulation-and-self-assessment.md)**.

---

## Access control

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **BOLA / IDOR** | Object access without tenant/user binding | Server-side check on **every** route; tests with two users — **`decision-tree.md`** |
| **Client-only authz** | API accepts direct calls | Enforce on server — **`anti-patterns.md`** |
| **Role confusion** | Admin action from user session | Separate roles, explicit admin audit — **`edge-cases.md`** |

---

## Tokens and sessions

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Long-lived JWT in localStorage** | XSS → token theft | HttpOnly cookies or memory + short TTL + rotation; CSP — **`decision-tree.md`** |
| **Algorithm confusion / `none`** | Library defaults | Strict verify config; deny `none` — **`edge-cases.md`** |

---

## Injection and deserialization

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **SQL/command injection** | User input in raw queries | Parameterized queries / ORM discipline — **`tips-and-tricks.md`** |
| **XSS** | Unescaped HTML/URL in DOM | Encode context; CSP; avoid `dangerouslySetInnerHTML` — **`react-pro`** |

---

## SSRF and egress

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **URL fetch to internal IPs** | User-supplied URL backend fetches | Allowlist hosts; block metadata IPs; network egress controls — **`osi-and-networking.md`** |

---

## Supply chain and CI

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Secrets in fork PR CI** | Public fork runs with secrets | `pull_request` vs `pull_request_target` policy; no secrets on untrusted code — **`edge-cases.md`** |
| **Typosquat dependency** | Unexpected package | Lockfiles, SCA, review — **`tips-and-tricks.md`** |

---

## Operational leaks

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **PII/tokens in logs** | Log search hits | Redaction, structured allowlists — **`edge-cases.md`** |
| **Verbose errors to clients** | Stack traces in prod | Generic user messages; server-side correlation id — **`quality-validation-and-guardrails.md`** |
