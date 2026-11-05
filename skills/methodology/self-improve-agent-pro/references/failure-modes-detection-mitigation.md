# Failure modes — detection and mitigation (self-improving agent)

## Contents

1. [Measurement and attribution](#measurement-and-attribution)
2. [Feedback and process](#feedback-and-process)
3. [Knowledge harvesting](#knowledge-harvesting)
4. [Operational drift](#operational-drift)

---

## Measurement and attribution

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Goodhart / metric gaming** | Eval score up, user outcomes flat or down | Pair leading + lagging metrics; qualitative spot checks — **`edge-cases.md`** |
| **No baseline** | “Feels better” after change | Freeze baseline slice; measure first — **`decision-tree.md`** |
| **Confounded changes** | Several prompts/tools changed together | One lever per experiment or factorial plan with analysis — **`anti-patterns.md`** |
| **Eval set leakage** | Train-like tasks in eval only | Holdout from production distribution; rotate evals — **`metrics-and-verification.md`** |

---

## Feedback and process

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Sparse feedback** | High variance week to week | Instrument traces, rubrics, more reviewers on sample — **`decision-tree.md`** |
| **Reviewer drift** | Scores shift without agent change | Anchor rubrics; periodic calibration — **`edge-cases.md`** |
| **Overfitting benchmark** | Prod regressions while eval green | Shadow traffic; production spot tasks — **`edge-cases.md`** |

---

## Knowledge harvesting

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Tribal knowledge only** | Fixes not in skills/docs | Contributor PR workflow — **`contributor-workflow.md`** |
| **Stale skills** | Same failure class repeats | Link diagnosis to **`skills-self-review-pro`** + **`repo-tooling-pro`** |

---

## Operational drift

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Delayed regression** | Failure weeks after rollout | Long-window monitoring; feature flags — **`improvement-loop-design.md`** |
| **Token bloat** | Cost up, latency up | Treat tokens as metric; prune context — **`SKILL.md`** operating principles |
