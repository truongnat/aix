# Workflow: security-audit

Structured **security audit** of a defined scope (service, PR, release candidate, or environment) using `security-pro`, `auth-pro`, and related skills. Produces a severity-ranked report aligned with OWASP-style thinking.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `security-audit.md`.

**Invoke:** `/security-audit`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `security-audit` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `audit_scope` | Yes | What to review: repo path, service name, URL list, or “full stack X” |
| `threat_context` | No | Public internet, internal only, regulated data (PCI/PHI), … |
| `methodology` | No | e.g. “OWASP ASVS L2”, “quick pass”, “release gate” |
| `domain_stack` | No | Stack hint for skill selection |

## Outputs

| Variable | Description |
|----------|-------------|
| `audit_report` | Findings by severity + compliance mapping |
| `remediation_order` | Ordered fixes with rough effort |
| `out_of_scope_note` | Explicit gaps |

## Decision paths

- **Scope too large for one pass:** Split by surface (API vs web vs CI); deliver **partial** report with clear boundaries.
- **No source access (black box):** Emphasize DAST-style checks and config review; label evidence **external**.
- **Contains live PII:** Do not paste secrets or payloads; redact in report.

## Error handling

- **Cannot run tests/tools:** Document tool gaps; rely on code review + threat modeling.
- **Disputed severity:** Provide **exploit scenario** + **likelihood** note; defer product risk to owner.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)**.  
Final artifact MUST follow **[`templates/report/security-audit.md`](../../templates/report/security-audit.md)**.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single service, narrow diff | < 2 h |
| **Standard** | App + API + auth | 1 day |
| **Deep** | Full ASVS + supply chain | > 3 days |

## Escalation

- **Human:** Critical vuln in prod, legal/compliance sign-off, customer notification.
- **Autonomous:** Static review, checklist mapping, draft remediation order.

## Steps

### Step 1 — `scope-and-threat-model`

- **Type:** skill
- **Skill:** `security-pro` (+ `planning-pro` for scope boundaries)
- **Input:** `audit_scope`, `threat_context`
- **Output:** Threat surface table + trust boundaries + **out of scope** list.

### Step 2 — `review-auth-and-access`

- **Type:** skill
- **Skill:** `auth-pro` + `security-pro`
- **Input:** Code/config for authn/authz, session/token handling
- **Output:** Broken access control, session fixation, privilege escalation candidates.

### Step 3 — `review-input-and-data`

- **Type:** skill
- **Skill:** `security-pro` (+ domain `*-pro` for stack-specific sinks: `nestjs-pro`, `react-pro`, …)
- **Input:** Inputs, serializers, ORM queries, logs
- **Output:** Injection, XSS, SSRF, IDOR, mass assignment, sensitive data exposure.

### Step 4 — `review-ops-and-secrets`

- **Type:** skill
- **Skill:** `security-pro` + `deployment-pro` / `ci-cd-pro` when in scope
- **Input:** CI, env templates, Dockerfiles, infra snippets
- **Output:** Secret leakage, unsafe defaults, dependency/supply-chain notes.

### Step 5 — `compile-audit-report`

- **Type:** skill
- **Skill:** `feedback-pro`
- **Input:** Findings from Steps 1–4
- **Actions:** Deduplicate; map to ASVS/CWE where helpful; order remediation.
- **Output:** `audit_report`, `remediation_order`, `out_of_scope_note` using the security audit template.

## Notes

- Pair with **`prompts/review/security-revierequest.md`** when the user only has a natural-language ask.
- Do not treat this workflow as penetration testing unless tools and authorization are explicit.
