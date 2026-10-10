---
name: stride-analysis-patterns
description: Apply STRIDE methodology to systematically identify threats. Use when analyzing system security, conducting threat modeling sessions, or creating security documentation.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "security,testing,reliability"
  roles: "security-engineer,qa-engineer"
  compatible: "claude,cursor,codex,gemini"

---

# STRIDE Analysis Patterns

## Boundary

**`sk-stride-analysis-patterns`** owns **STRIDE threat categorization, DFD-oriented analysis, prioritization, and mitigation documentation**. It does not own **final compliance certification, exploit execution, or implementation of controls without a threat-model decision**; route those concerns to the appropriate specialist skill.


Systematic threat identification using the STRIDE methodology.

## When to Use This Skill

- Starting new threat modeling sessions
- Analyzing existing system architecture
- Reviewing security design decisions
- Creating threat documentation
- Training teams on threat identification
- Compliance and audit preparation

## Core Concepts

### 1. STRIDE Categories

```
S - Spoofing       → Authentication threats
T - Tampering      → Integrity threats
R - Repudiation    → Non-repudiation threats
I - Information    → Confidentiality threats
    Disclosure
D - Denial of      → Availability threats
    Service
E - Elevation of   → Authorization threats
    Privilege
```

### 2. Threat Analysis Matrix

| Category            | Question                                  | Control Family |
| ------------------- | ----------------------------------------- | -------------- |
| **Spoofing**        | Can attacker pretend to be someone else?  | Authentication |
| **Tampering**       | Can attacker modify data in transit/rest? | Integrity      |
| **Repudiation**     | Can attacker deny actions?                | Logging/Audit  |
| **Info Disclosure** | Can attacker access unauthorized data?    | Encryption     |
| **DoS**             | Can attacker disrupt availability?        | Rate limiting  |
| **Elevation**       | Can attacker gain higher privileges?      | Authorization  |

## Templates and detailed worked examples

Full template library lives in `references/details.md`. Read that file when you need concrete templates for this skill.

## Best Practices

### Do's

- **Involve stakeholders** - Security, dev, and ops perspectives
- **Be systematic** - Cover all STRIDE categories
- **Prioritize realistically** - Focus on high-impact threats
- **Update regularly** - Threat models are living documents
- **Use visual aids** - DFDs help communication

### Don'ts

- **Don't skip categories** - Each reveals different threats
- **Don't assume security** - Question every component
- **Don't work in isolation** - Collaborative modeling is better
- **Don't ignore low-probability** - High-impact threats matter
- **Don't stop at identification** - Follow through with mitigations

## Output

Produce a reusable stride analysis patterns artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## When not to use

- When the request is outside `sk-stride-analysis-patterns`'s boundary or another specialist is the primary owner.
- When the user needs an attestation, exploit authorization, or production claim that requires separate human approval or evidence.

## Required inputs

- system boundary, actors, data flows, trust boundaries, assets, impact criteria, and stakeholders.

## Cross-skill handoffs

- sk-security-pro for control selection; sk-auth-pro for identity threats; sk-api-security-pro for API abuse paths; sk-testing-pro for security regression cases.
## Worked scenarios and evidence

Read [`references/worked-scenarios-and-evidence.md`](./references/worked-scenarios-and-evidence.md) for one positive and one negative/edge fixture with expected output-level evidence and canonical handoff.
