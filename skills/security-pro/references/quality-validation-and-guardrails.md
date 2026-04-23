# Quality validation and guardrails (security)

## Contents

1. [Legal and ethical scope](#legal-and-ethical-scope)
2. [Evidence discipline](#evidence-discipline)
3. [Advice hygiene](#advice-hygiene)
4. [Review checklist](#review-checklist)

---

## Legal and ethical scope

- **Never** instruct or facilitate unauthorized access, exfiltration, or testing outside **written scope** — even “obvious” misconfigurations on third-party systems.
- **Authorized** simulation only: staging/lab, ROE, data handling per **[offensive-simulation-and-self-assessment.md](offensive-simulation-and-self-assessment.md)**.

---

## Evidence discipline

- **Do not invent** CVE IDs, CVSS scores, or vendor-specific patch dates — cite advisories or say “verify against vendor bulletin.”
- Prefer **control names** (e.g., “enforce object-level authz”) over unverifiable exploit chains when details are unknown.

---

## Advice hygiene

- Separate **policy** (what must be true) from **implementation** (how in Nest/Next/Postgres) — delegate wiring to stack skills.
- When recommending crypto: use **standard libraries** and **documented** algorithms — no custom ciphers.

---

## Review checklist

- [ ] Trust boundaries and sensitivity class stated.
- [ ] Authz enforced **server-side** (or DB RLS) for every sensitive resource id.
- [ ] Secrets, logs, and error surfaces considered.
- [ ] Testing / verification path named (abuse tests, scan, pen-test scope).
- [ ] Offensive work explicitly **in scope** and **authorized** if discussed.
