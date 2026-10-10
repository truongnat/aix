# Quality validation and guardrails (self-improving agent)

## Contents

1. [Evidence standards](#evidence-standards)
2. [Ethics and scope](#ethics-and-scope)
3. [Anti-fabrication](#anti-fabrication)
4. [Review checklist](#review-checklist)

---

## Evidence standards

- Improvements must cite **before/after** on the **same** metric definition and comparable workload slice — **`metrics-and-verification.md`**.
- Prefer **reproducible** prompts/fixtures with pinned model IDs when reporting gains — **`versions.md`**.

---

## Ethics and scope

- Self-improvement must not include **deceptive** behavior, **covert** data exfiltration, or **unauthorized** access — align with **`security-pro`** for high-risk domains.
- **Human oversight** for decisions affecting end users’ rights or safety — not fully automated rollout.

---

## Anti-fabrication

- **Do not invent** win rates, p-values, or production incident counts not supplied by the user or logs.
- Label **hypotheses** vs **measured** outcomes clearly.

---

## Review checklist

- [ ] Baseline frozen; success criteria written **before** intervention.
- [ ] Single primary lever or explicit factorial design — **`anti-patterns.md`**.
- [ ] Regression / holdout path defined — **`improvement-loop-design.md`**.
- [ ] Knowledge backflow (skills PR) identified when pattern is recurring — **`contributor-workflow.md`**.
