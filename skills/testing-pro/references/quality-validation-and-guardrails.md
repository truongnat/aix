# Quality validation and guardrails (testing)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [Coverage honesty](#coverage-honesty)
3. [Security-sensitive tests](#security-sensitive-tests)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- **Do not invent** pass rates, CI minutes saved, or flaky percentages without data — say “measure in your pipeline.”

---

## Coverage honesty

- High **line** coverage can still miss **behaviors** — pair with risk-based cases (**auth**, **payments**).
- Treat coverage thresholds as **team policy**, not universal law — **`test-pyramid-and-strategy.md`**.

---

## Security-sensitive tests

- **Negative tests** for authz (IDOR) belong in CI for fixed regressions — pair **`security-pro`** for abuse framing — **`integration-map.md`**.

---

## Review checklist

- [ ] Test level matches risk; not all e2e — **`decision-tree.md`**.
- [ ] Deterministic time/network/data — **`edge-cases.md`**.
- [ ] Flakes quarantined with ticket — **`failure-modes-detection-mitigation.md`**.
- [ ] Framework-specific wiring delegated — **`integration-map.md`**.
