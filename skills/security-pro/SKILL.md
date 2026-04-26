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

### Operating principles

1. **Think Before Coding** — Confirm trust boundaries, data sensitivity, tenancy, and attacker model before proposing controls. Ask when the authorization truth or deployment surface is unclear.
2. **Simplicity First** — Start with the narrowest effective control at the real boundary. Avoid stacking redundant controls that add complexity without risk reduction.
3. **Surgical Changes** — Touch only the relevant trust boundary, secret path, auth surface, or logging rule. Do not broaden into unrelated security rewrites.
4. **Goal-Driven Execution** — Done = the primary abuse path is blocked or reduced, and verification is defined with evidence, not vague reassurance.
5. **Authorization is object-level** — Role checks alone are not enough; object ownership and tenant scope must be explicit.
6. **Secrets never become convenience data** — Tokens, keys, and internal diagnostics should not leak into logs, clients, or build artifacts.
7. **Network context changes app risk** — DNS, TLS, egress, and proxy behavior matter when evaluating SSRF, session, or service-to-service trust.
8. **Authorized scope only** — Any offensive simulation must stay inside documented rules of engagement and defender-oriented outcomes.

## Default recommendations by scenario

- **Feature security review** — Map trust boundaries and primary abuse paths before suggesting controls.
- **Auth/authz issue** — Verify where identity is established and where authorization decisions are enforced.
- **CI/CD concern** — Check secret exposure, action provenance, and environment trust before broadening to app code.
- **Multi-tenant risk** — Validate object-level and tenant-level isolation first, then supporting headers/tokens/logging.

## Decision trees

Summary: choose controls based on trust boundary, abuse path, and deployment context, not by copying generic checklists.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: role-only authZ, secrets in logs or clients, CSP or TLS “checkbox” hardening without threat fit, and broad exploit advice outside authorized defensive scope.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Security controls and trust boundaries system model (summary)

How data classification, trust boundaries, and defense layers fit together so recommendations stay tied to real exposure.

Details: [references/security-controls-and-trust-boundaries-system-model.md](references/security-controls-and-trust-boundaries-system-model.md)

### Fundamentals and threat model (summary)

How to frame assets, actors, trust transitions, and likely abuse cases before recommending controls.

Details: [references/fundamentals-and-threat-model.md](references/fundamentals-and-threat-model.md)

### OSI and networking (summary)

How network path realities affect SSRF, TLS, segmentation, and service trust decisions.

Details: [references/osi-and-networking.md](references/osi-and-networking.md)

### Failure modes and mitigation (summary)

BOLA, SSRF, token theft, secret leaks, tenant bleed, and control bypass patterns to check early.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Offensive simulation and self-assessment (summary)

How authorized internal assessments should be scoped, constrained, and reported without drifting into unauthorized action.

Details: [references/offensive-simulation-and-self-assessment.md](references/offensive-simulation-and-self-assessment.md)

### Versions (summary)

Version or standards notes that affect headers, protocols, platform hardening, and recommended defaults.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Deployment surface, data sensitivity, tenancy, auth model, and trust boundaries in scope.
2. **Threat analysis** — Primary abuse paths, impacted assets, and where the control should live.
3. **Recommendation** — Minimum effective control changes with rationale.
4. **Verification** — How to prove the control works and what evidence to collect.
5. **Residual risks** — Remaining exposure, operational trade-offs, or handoffs to stack skills.

## Resources in this skill

| Topic | File |
|-------|------|
| Security controls and trust boundaries system model | [references/security-controls-and-trust-boundaries-system-model.md](references/security-controls-and-trust-boundaries-system-model.md) |
| Fundamentals and threat model | [references/fundamentals-and-threat-model.md](references/fundamentals-and-threat-model.md) |
| OSI and networking | [references/osi-and-networking.md](references/osi-and-networking.md) |
| Attack techniques and methods | [references/attack-techniques-and-methods.md](references/attack-techniques-and-methods.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Offensive simulation and self-assessment | [references/offensive-simulation-and-self-assessment.md](references/offensive-simulation-and-self-assessment.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Review our order API for IDOR/BOLA risk."
- Identify the object ownership rule, tenant boundary, and where authorization truth is enforced.
- Recommend explicit object-level checks or RLS where appropriate instead of role-only guards.
- **Verify:** Cross-user and cross-tenant access tests fail while valid owner access still succeeds.

**Input (tricky):** "We want pentest-style guidance for a live third-party site."
- Refuse unauthorized offensive help and redirect to authorized defensive assessment patterns.
- Offer threat-modeling, hardening, and internal self-assessment guidance instead.
- **Verify:** Scope remains inside approved systems and documented rules of engagement.

**Input (cross-skill):** "Our CI pipeline might leak secrets on fork PRs."
- Pair **`ci-cd-pro`** for workflow mechanics and use **`security-pro`** for trust-boundary and secret-exposure reasoning.
- Restrict secret access and action trust paths rather than patching symptoms ad hoc.
- **Verify:** Forked PR jobs cannot access protected secrets and logs stay redacted.

## Checklist before calling the skill done

- [ ] Trust boundaries, data sensitivity, tenancy, and attacker model confirmed first (Think Before Coding)
- [ ] Minimum effective control chosen; no unnecessary security theater added (Simplicity First)
- [ ] Only the relevant trust boundary or security surface was changed (Surgical Changes)
- [ ] Success criteria and verification evidence are explicit and validated (Goal-Driven Execution)
- [ ] Authorization decisions are object- or tenant-aware where relevant
- [ ] Secrets, tokens, and sensitive diagnostics stay out of logs and client surfaces
- [ ] Network/proxy/runtime context is considered for the threat being addressed
- [ ] Any offensive simulation remains explicitly authorized and bounded
