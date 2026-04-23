# Agent improvement — feedback and control system model

## Contents

1. [Closed-loop control](#closed-loop-control)
2. [Signal sources](#signal-sources)
3. [Intervention surface](#intervention-surface)
4. [Attribution requirement](#attribution-requirement)

Pair with **[improvement-loop-design.md](improvement-loop-design.md)** and **[metrics-and-verification.md](metrics-and-verification.md)**.

---

## Closed-loop control

Treat agent uplift as a **control system**, not a one-off prompt edit:

```
Observe (runs, failures, metrics)
  → Diagnose (taxonomy, root cause)
  → Intervene (prompt, skill, tool, policy — one primary lever when possible)
  → Verify (pre/post, regression, holdout)
  → Decide (keep, rollback, iterate)
```

Open loops (“changed prompt, never measured”) create **false confidence** — **`failure-modes-detection-mitigation.md`**.

---

## Signal sources

| Signal | Strength | Risk |
|--------|----------|------|
| **Human review** (`feedback-pro`) | High semantic quality | Cost, inconsistency |
| **Automated eval / harness** | Repeatable | Overfitting, narrow coverage |
| **Production telemetry** | Realistic | Noisy, privacy-sensitive |

**Design:** triangulate at least **two** signal classes when stakes are high — **`edge-cases.md`**.

---

## Intervention surface

| Lever | Typical use |
|-------|-------------|
| **System / developer instructions** | Global behavior |
| **Skills / retrieved context** | Domain grounding |
| **Tools / environment** | Capability and guardrails |
| **Model choice** | Capability floor/ceiling |

Changing multiple surfaces **at once** destroys attribution — **`decision-tree.md`**.

---

## Attribution requirement

Every improvement claim needs a **counterfactual** or **isolated diff**: what would have happened **without** the change under the same workload slice — **`metrics-and-verification.md`**.
