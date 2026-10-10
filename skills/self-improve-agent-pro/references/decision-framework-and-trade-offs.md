# Decision framework and trade-offs (self-improving agent)

## Contents

1. [Automation vs human gate](#automation-vs-human-gate)
2. [Breadth vs depth of evaluation](#breadth-vs-depth-of-evaluation)
3. [Fast iteration vs statistical confidence](#fast-iteration-vs-statistical-confidence)
4. [Central prompt vs distributed skills](#central-prompt-vs-distributed-skills)

Use **`decision-tree.md`** for signal sparsity and change policy.

---

## Automation vs human gate

| Lean **automation-first** | Require **human gate** |
|---------------------------|-------------------------|
| Low-stakes codegen, internal sandboxes | Safety-critical, regulated, or customer-facing prod |

**Trade-off:** speed vs **accountability** — document who signs off — **`quality-validation-and-guardrails.md`**.

---

## Breadth vs depth of evaluation

| Broad shallow eval | Narrow deep eval |
|--------------------|------------------|
| Smoke many task types | Stress one failure class |

**Trade-off:** coverage vs power to detect rare regressions — rotate focus — **`metrics-and-verification.md`**.

---

## Fast iteration vs statistical confidence

Rapid A/B on **thin** traffic yields **noise**. Prefer fewer, **well-powered** comparisons or sequential testing with clear stop rules — **`failure-modes-detection-mitigation.md`**.

---

## Central prompt vs distributed skills

| Central system prompt | Skills / tool docs in repo |
|------------------------|----------------------------|
| Global tone and refusals | Domain truth, versioned, testable |

**Trade-off:** prompt-only changes **erode** without repo artifacts; prefer durable **skills** for recurring patterns — **`contributor-workflow.md`**.
