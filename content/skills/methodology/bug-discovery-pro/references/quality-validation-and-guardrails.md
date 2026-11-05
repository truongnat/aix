# Quality validation and guardrails (bug discovery)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [Confidence labels](#confidence-labels)
3. [No false certainty](#no-false-certainty)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Separate **observed** log lines from **inferred** root cause; redact secrets — **`content-analysis-pro`** for pasted logs.

---

## Confidence labels

- Use **confirmed / likely / hypothesis** consistently — **`bug-candidates-and-confidence.md`**.

---

## No false certainty

- Never claim **100%** bug enumeration or single-cause without proof — **`anti-patterns.md`**.

---

## Review checklist

- [ ] Repro or telemetry cited — **`debugging-methodology.md`**.
- [ ] Graph index freshness noted when used — **`edge-cases.md`**.
- [ ] Security class issues flagged for **`security-pro`**.
