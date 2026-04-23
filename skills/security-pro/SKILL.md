---
name: security-pro
description: |
  Production-grade application and platform security: threat modeling, trust boundaries, secure design, authn/authz, secrets, crypto hygiene, API and client hardening, OSI/network-aware controls, defensive attack-method literacy (OWASP, MITRE ATT&CK), and authorized offensive simulation — plus system model (trust boundaries, CIA, prevent/detect/respond, where authorization truth lives), failure modes (BOLA, token theft, SSRF, CI secret leak, multi-tenant bleed), decision trade-offs (cookies vs bearer, RLS vs app-only, CSP strictness, pinning), and quality guardrails (legal scope, no fabricated CVEs, evidence discipline).

  Use this skill when the user asks about security review, OWASP-style risks, XSS, CSRF, SSRF, injection, IDOR/BOLA, JWT/session hardening, TLS, headers (CSP, HSTS), secrets management, rate limiting, audit logging, dependency/supply-chain risk, mobile secure storage, CI/CD pipeline security, network segmentation, or structured internal assessment.

  Use for **network-aware security** (OSI/TCP–IP, DNS/TLS, segmentation) and **defender-oriented** attack literacy. For **authorized** offensive simulation only: staging/lab, ROE, purple-team — never unauthorized testing.

  Combine with **`nestjs-pro`**, **`nextjs-pro`**, **`postgresql-pro`**, **`api-design-pro`**, **`auth-pro`**, **`react-pro`** / **`react-native-pro`** / **`flutter-pro`**, **`testing-pro`**, **`ci-cd-pro`**, **`deployment-pro`**, **`network-infra-pro`** for implementation and infra. This skill owns **cross-platform principles and threat framing**; stack skills own **wiring**.

  Triggers: "security", "secure", "OWASP", "XSS", "CSRF", "SSRF", "injection", "SQL injection", "IDOR", "BOLA", "auth", "authorization", "JWT", "session", "cookie", "SameSite", "CSP", "HSTS", "TLS", "secrets", "vault", "rate limit", "penetration", "threat model", "STRIDE", "CWE", "ASVS", "SAST", "DAST", "Dependabot", "supply chain", "encryption", "PII", "audit log", "hardening", "OSI", "TCP/IP", "network security", "MITRE", "ATT&CK", "kill chain", "red team", "purple team", "bug bounty", "pentest", "self-assessment", "attack simulation", "path traversal", "prototype pollution".

metadata:
  short-description: Security — trust model, AppSec, network context, failure modes, ethical scope
  content-language: en
  domain: security
  level: professional
---

# Security (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [OWASP](https://owasp.org/) (Top 10, ASVS, cheat sheets) and your org’s policy for authoritative guidance; this skill encodes **defense-in-depth**, **trust-boundary discipline**, **network-layer context**, and **ethical scope** for assessments — not legal advice. Confirm **deployment surface**, **data sensitivity**, **regulatory** constraints, and **stack** when pairing with repo **`*-pro`** skills.

**Unauthorized testing is out of scope** — any simulation must follow **[references/offensive-simulation-and-self-assessment.md](references/offensive-simulation-and-self-assessment.md)** (written ROE, staging/lab, reporting).

## Boundary

**`security-pro`** owns **threat framing**, **control selection**, **cross-cutting AppSec/network patterns**, and **assessment ethics**. **`nestjs-pro`** / **`nextjs-pro`** / **`postgresql-pro`** own **framework-specific implementation**. **`auth-pro`** owns **identity protocol and provider integration** detail when it dominates. **`network-infra-pro`** owns **VPC/firewall design** as primary deliverable; **`security-pro`** contributes **threats and control intent**.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`nestjs-pro`** | Guards, ValidationPipe, HTTP error hygiene |
| **`nextjs-pro`** | Middleware, cookies, CSP, Server Actions, `NEXT_PUBLIC_` |
| **`postgresql-pro`** | RLS, roles, `BYPASSRLS` |
| **`api-design-pro`** | Abuse-resistant API shape |
| **`auth-pro`** | OAuth/OIDC/session flows |
| **`react-pro`** / **`react-native-pro`** / **`flutter-pro`** | XSS, WebView, deep links, secure storage |
| **`testing-pro`** | Abuse-case and regression tests |
| **`ci-cd-pro`** | Pipeline secrets, fork PRs, action pinning |
| **`deployment-pro`** | TLS at edge, secrets mounts, rollout |
| **`network-infra-pro`** | Segmentation, egress, DNS |

Do **not** duplicate framework wiring — state **invariant** here, **implementation** in the sibling skill.

## When to use

- Threat modeling or security review of a feature, API, or architecture.
- Hardening authn/authz, sessions, tokens (web and mobile).
- Secrets, TLS, headers, CORS, rate limits, logging redaction.
- Dependency/supply-chain and **CI** security posture.
- OSI/TCP–IP, segmentation, DNS/TLS as they affect app threats (e.g. SSRF).
- Defensive mapping to OWASP / MITRE ATT&CK; detection and test priorities.
- **Authorized** internal assessment workflows and reporting structure.

## When not to use

- **Illegal or unauthorized** exploitation instructions — refuse; offer **defensive** and **authorized** alternatives — **`quality-validation-and-guardrails.md`**.
- **Pure legal/compliance certification** as sole topic — involve legal counsel; this skill provides technical control mapping only.
- **Framework-only** “how do I add a route” without security angle — lead with **`nestjs-pro`** / **`nextjs-pro`**.

## Required inputs

- **Trust boundaries** and **data classification** (when unknown, ask or assume conservative defaults and label assumptions).
- **Deployment model** (internet-facing, internal, multi-tenant).
- **Authorization model** (roles, tenants, object ownership) for BOLA analysis.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

1. Confirm sensitivity, deployment surface, multi-tenancy, and which stack skills apply.
2. Apply summaries; open `references/`; anchor on **`security-controls-and-trust-boundaries-system-model.md`** for control placement.
3. Respond with **Suggested response format**; include **failure modes** and **verification**; never encourage out-of-scope attacks.

### Operating principles

1. **Assume breach** — Layer controls; limit blast radius — **`security-controls-and-trust-boundaries-system-model.md`**.
2. **Server-side truth** — Authz where attackers cannot bypass — **`failure-modes-detection-mitigation.md`**.
3. **Least privilege** — Users, services, DB, IAM — **`tips-and-tricks.md`**.
4. **No secrets in code or logs** — Vault/CI secrets; redaction — **`anti-patterns.md`**.
5. **Validate and encode** — Every boundary — **`attack-techniques-and-methods.md`**.
6. **Secure defaults** — Deny by default — **`decision-framework-and-trade-offs.md`**.
7. **Authorized testing only** — ROE, environment, reporting — **`offensive-simulation-and-self-assessment.md`**.

### Fundamentals and threat modeling (summary)

STRIDE, data classification, trust boundaries — **`fundamentals-and-threat-model.md`**.

Details: [references/fundamentals-and-threat-model.md](references/fundamentals-and-threat-model.md)

### Security controls and trust boundaries — system model (summary)

Trust boundaries, CIA, prevent/detect/respond, where invariants live — **`security-controls-and-trust-boundaries-system-model.md`**.

Details: [references/security-controls-and-trust-boundaries-system-model.md](references/security-controls-and-trust-boundaries-system-model.md)

### OSI and networking (summary)

Layers, DNS/TLS, segmentation tied to SSRF and movement — **`osi-and-networking.md`**.

Details: [references/osi-and-networking.md](references/osi-and-networking.md)

### Attack techniques and methods (summary)

Kill chain, MITRE/OWASP mapping for **defensive** design — **`attack-techniques-and-methods.md`**.

Details: [references/attack-techniques-and-methods.md](references/attack-techniques-and-methods.md)

### Offensive simulation and self-assessment (summary)

Pen-test / purple-team / lab SAST-DAST; reporting — **`offensive-simulation-and-self-assessment.md`**.

Details: [references/offensive-simulation-and-self-assessment.md](references/offensive-simulation-and-self-assessment.md)

### Tips and tricks (summary)

MFA, parameterization, rate limits, dependency hygiene — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

JWT misuse, BOLA, multi-tenant, CI forks, OAuth redirect — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Cookies vs bearer, RLS vs app, CSP vs third parties, pinning — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Client-only authz, tokens in `localStorage` for sensitive ops, PII in URLs — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

Stack implementation and infra — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Standards / versions (summary)

ASVS/CWE usage, library versions — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Surface (web/mobile/API), sensitivity, multi-tenant?, regulatory hints.
2. **Problem / goal** — Threat, incident lesson, or hardening ask.
3. **System design** — Trust boundaries and where controls attach — **`security-controls-and-trust-boundaries-system-model.md`**.
4. **Decision reasoning** — Control choice vs trade-off (CSP, token storage, RLS) — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Policy-level steps + which **`nestjs-pro`** / **`nextjs-pro`** / … file owns code — not full duplicated tutorials.
6. **Trade-offs** — UX, perf, ops cost of security controls.
7. **Failure modes** — BOLA, SSRF, token theft, CI leaks — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Monitoring, pen-test scope, compliance follow-up; **authorized** test handoff to **`offensive-simulation-and-self-assessment.md`** / **`testing-pro`**.

## Resources in this skill

| Topic | File |
|-------|------|
| **Trust & control system model** | [references/security-controls-and-trust-boundaries-system-model.md](references/security-controls-and-trust-boundaries-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Fundamentals & threat model | [references/fundamentals-and-threat-model.md](references/fundamentals-and-threat-model.md) |
| OSI & networking | [references/osi-and-networking.md](references/osi-and-networking.md) |
| Attack techniques (defensive catalog) | [references/attack-techniques-and-methods.md](references/attack-techniques-and-methods.md) |
| Offensive simulation & self-assessment | [references/offensive-simulation-and-self-assessment.md](references/offensive-simulation-and-self-assessment.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Standards / versions | [references/versions.md](references/versions.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

### 1 — Simple (common)

**Input:** Public API returns another user’s order when `orderId` is guessed — IDOR.  
**Expected output:** Full **Suggested response format** — server-side object authz; BOLA; **`nestjs-pro`** for Guard; **`testing-pro`** for two-user test.

### 2 — Tricky (edge case)

**Input:** Admin button hidden in UI but API still allows action.  
**Expected output:** Broken access control; server enforcement; negative tests — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** “Hack ourselves Friday” on staging with report.  
**Expected output:** ROE + scope from **`offensive-simulation-and-self-assessment.md`**; tool categories; no prod without approval; **`testing-pro`** for regressions.

## Checklist before calling the skill done

### Controls

- [ ] Trust boundaries and data sensitivity stated; authz **server-side** — **`quality-validation-and-guardrails.md`**.
- [ ] Secrets, TLS, headers, logging redaction considered — **`tips-and-tricks.md`**.

### Process

- [ ] Framework wiring delegated via **`integration-map.md`**.
- [ ] Residual risks + verification (tests, scan, pen-test) noted.
- [ ] Offensive work: **authorized**, scoped, environment explicit — **`offensive-simulation-and-self-assessment.md`**.

### Common classes

- [ ] **BOLA/IDOR** for resource ids — **`decision-tree.md`**.
- [ ] **Multi-tenant** isolation (cache, logs) — **`edge-cases.md`**.
- [ ] **No fabricated CVEs** — **`quality-validation-and-guardrails.md`**.
