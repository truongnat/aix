# Security Audit — {{scope}}

> **Date:** {{date}}  
> **Auditor:** {{auditor}}  
> **Methodology:** OWASP ASVS L{{level}} (or equivalent)  
> **Scope version:** {{version}}  
> **Status:** Draft | In Progress | Final

---

## Executive Summary

<!-- 3-5 sentences: scope, overall security posture, critical findings, risk level, next steps -->

**Overall Risk Level:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | 🟢 Acceptable

---

## Audit Scope

| Component | In Scope | Version | Notes |
|-----------|----------|---------|-------|
| Web Application | ✅ / ❌ | {{version}} | |
| API | ✅ / ❌ | {{version}} | |
| Database | ✅ / ❌ | {{version}} | |
| Authentication | ✅ / ❌ | {{version}} | |
| Third-party integrations | ✅ / ❌ | {{version}} | |
| Infrastructure | ✅ / ❌ | {{version}} | |

**Out of scope:** {{list excluded areas}}

---

## Threat Surface Analysis

| Surface | Exposure | Threat Level | Controls in Place | Residual Risk |
|---------|----------|--------------|-------------------|--------------|
| Public API | High / Medium / Low | Critical / High / Medium / Low | | |
| Admin Console | High / Medium / Low | Critical / High / Medium / Low | | |
| Data at Rest | High / Medium / Low | Critical / High / Medium / Low | | |
| Data in Transit | High / Medium / Low | Critical / High / Medium / Low | | |
| Third-party APIs | High / Medium / Low | Critical / High / Medium / Low | | |

---

## Findings Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | {{count}} | {{open}} open, {{fixed}} fixed |
| 🟠 High | {{count}} | {{open}} open, {{fixed}} fixed |
| 🟡 Medium | {{count}} | {{open}} open, {{fixed}} fixed |
| 🔵 Low / Informational | {{count}} | {{open}} open, {{fixed}} fixed |

---

## Detailed Findings

### 🔴 Critical — {{count}}

#### C1 — {{title}}

- **OWASP / CWE:** {{reference}}
- **CVSS Score:** {{score}} ({{severity}})
- **Location:** `path/to/file` or component
- **Discovery Date:** {{date}}
- **Status:** Open / In Progress / Fixed / Verified

**Description:**
Detailed description of the vulnerability

**Exploit Scenario:**
Step-by-step how an attacker could exploit this

**Business Impact:**
- Data exposure: Yes / No
- System compromise: Yes / No
- Financial impact: High / Medium / Low
- Reputation impact: High / Medium / Low

**Recommendation:**
Specific remediation steps

**Verification:**
How to verify the fix

**References:**
- OWASP: {{link}}
- CVE: {{id}}
- Related: {{finding_id}}

---

### 🟠 High — {{count}}

#### H1 — {{title}}

- **OWASP / CWE:** {{reference}}
- **CVSS Score:** {{score}} ({{severity}})
- **Location:** `path/to/file` or component
- **Status:** Open / In Progress / Fixed / Verified

**Description:**
...

**Recommendation:**
...

---

### 🟡 Medium — {{count}}

#### M1 — {{title}}

- **OWASP / CWE:** {{reference}}
- **CVSS Score:** {{score}} ({{severity}})
- **Location:** `path/to/file` or component
- **Status:** Open / In Progress / Fixed / Verified

**Description:**
...

**Recommendation:**
...

---

### 🔵 Low / Informational — {{count}}

#### L1 — {{title}}

- **Type:** Best practice / Configuration / Documentation
- **Location:** `path/to/file` or component
- **Status:** Open / In Progress / Fixed / Verified

**Description:**
...

**Recommendation:**
...

---

## Compliance Mapping

| Control Framework | Control ID | Control Description | Status | Notes |
|------------------|------------|-------------------|--------|-------|
| OWASP ASVS | {{id}} | {{description}} | ✅ / ⚠️ / ❌ | |
| SOC 2 | {{id}} | {{description}} | ✅ / ⚠️ / ❌ | |
| PCI DSS | {{id}} | {{description}} | ✅ / ⚠️ / ❌ | |
| GDPR | {{id}} | {{description}} | ✅ / ⚠️ / ❌ | |
| HIPAA | {{id}} | {{description}} | ✅ / ⚠️ / ❌ | |

---

## Remediation Roadmap

### Priority 1 - Immediate (within 24-48 hours)
- [ ] C1 — {{title}} ({{effort}} hours)
- [ ] C2 — {{title}} ({{effort}} hours)

### Priority 2 - Short term (within 1-2 weeks)
- [ ] H1 — {{title}} ({{effort}} hours)
- [ ] H2 — {{title}} ({{effort}} hours)

### Priority 3 - Medium term (within 1 month)
- [ ] M1 — {{title}} ({{effort}} hours)
- [ ] M2 — {{title}} ({{effort}} hours)

### Priority 4 - Low priority / Backlog
- [ ] L1 — {{title}} ({{effort}} hours)
- [ ] L2 — {{title}} ({{effort}} hours)

---

## Security Best Practices Assessment

| Area | Status | Gaps | Recommendations |
|------|--------|------|-----------------|
| Authentication & Authorization | | | |
| Input Validation | | | |
| Output Encoding | | | |
| Error Handling | | | |
| Logging & Monitoring | | | |
| Data Encryption | | | |
| Secrets Management | | | |
| Dependency Management | | | |
| API Security | | | |
| Session Management | | | |
| Access Control | | | |

---

## Residual Risks

Even after implementing all recommendations, the following risks remain:

1. {{risk_1}}
2. {{risk_2}}
3. {{risk_3}}

---

## Recommendations Beyond Findings

1. **Process improvements:** {{recommendation}}
2. **Tooling enhancements:** {{recommendation}}
3. **Training needs:** {{recommendation}}
4. **Architecture changes:** {{recommendation}}

---

## Appendix

### Testing Methodology
- Static analysis: {{tools}}
- Dynamic analysis: {{tools}}
- Manual review: {{areas}}
- Penetration testing: {{scope}}

### Tools Used
- {{tool_1}}: {{version}}
- {{tool_2}}: {{version}}
- {{tool_3}}: {{version}}

---

## Related

- Workflow: [`workflows/dev/security-audit.md`](../../workflows/dev/security-audit.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)

