# Quality validation and guardrails (AI integration)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [No fabricated eval metrics](#no-fabricated-eval-metrics)
3. [Version truth](#version-truth)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Do **not** invent benchmark scores, latency numbers, or context-window sizes — cite **provider docs** or **measured** values — **`versions.md`**.

---

## No fabricated eval metrics

- Claim **offline eval** or **golden-set** pass rates only with a described methodology — **`evaluation-and-quality.md`**.

---

## Version truth

- Model ids and SDK APIs **change** — pin versions in runbooks — **`versions.md`**.

---

## Review checklist

- [ ] Output schema validated before side effects — **`tool-use.md`**.
- [ ] Injection boundaries for untrusted text — **`safety-and-policy-enforcement.md`**.
- [ ] RAG ACL and freshness addressed — **`rag-ingestion-and-freshness.md`**.
- [ ] Observability fields defined — **`observability-and-debugging.md`**.
