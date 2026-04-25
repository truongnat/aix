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

**Unauthorized testing is out of scope** — any simulation must follow **[references/offensive-simulation-and-self-assessment.md](/skills/security-pro/references/offensive-simulation-and-self-assessment.md)** (written ROE, staging/lab, reporting).

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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** sensitivity, deployment surface, multi-tenancy, and which stack skills apply. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.