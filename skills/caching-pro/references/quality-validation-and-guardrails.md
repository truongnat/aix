# Quality validation and guardrails (caching)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [No fabricated hit rates](#no-fabricated-hit-rates)
3. [Security-sensitive data](#security-sensitive-data)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Do **not** invent **hit ratio** improvements or Redis **maxmemory** without measurement — state assumptions.

---

## No fabricated hit rates

- Cite **before/after** from metrics or admit unknown — **`performance-and-observability.md`**.

---

## Security-sensitive data

- PII in shared caches needs **encryption**, **tenant scope**, and **eviction** policy — **`cache-security-and-isolation.md`**, **`security-pro`**.

---

## Review checklist

- [ ] Consistency class per surface documented — **`distributed-consistency-models.md`**.
- [ ] Invalidation path defined for each write — **`write-path-and-coherence.md`**.
- [ ] Degradation behavior when cache unavailable — **`failure-modes-and-resilience.md`**.
