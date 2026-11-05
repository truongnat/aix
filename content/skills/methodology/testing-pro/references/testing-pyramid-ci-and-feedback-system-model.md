# Testing — pyramid, CI feedback loop, and quality signals

## Contents

1. [Test layers](#test-layers)
2. [CI as feedback loop](#ci-as-feedback-loop)
3. [Signals beyond pass/fail](#signals-beyond-passfail)
4. [Handoff to product risk](#handoff-to-product-risk)

Pair with **[test-pyramid-and-strategy.md](test-pyramid-and-strategy.md)** and **[automation-and-ci.md](automation-and-ci.md)**.

---

## Test layers

| Layer | Purpose | Cost |
|-------|---------|------|
| **Unit** | Fast feedback on pure logic and small modules | Low |
| **Integration** | Contracts with DB, HTTP, queues, real deps | Medium |
| **E2E** | Critical user journeys, cross-browser | High |

Mis-layering (everything E2E) destroys **velocity** and **signal** — **`failure-modes-detection-mitigation.md`**.

---

## CI as feedback loop

```
Commit → lint/typecheck → fast tests → slower tests (shard/nightly)
```

CI should produce **artifacts** (reports, traces) that shorten debug time — **`automation-and-ci.md`**.

---

## Signals beyond pass/fail

- **Flake rate**, **duration trend**, **quarantine list** — quality debt metrics.
- **Coverage** as **risk map**, not a vanity number — **`quality-validation-and-guardrails.md`**.

---

## Handoff to product risk

Tests encode **acceptable risk**: what must never break vs what can ship with known gaps — align with **`planning-pro`** for release gates when needed.
