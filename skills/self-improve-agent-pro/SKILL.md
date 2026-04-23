---
name: self-improve-agent-pro
description: |
  Production-grade self-improving agent workflows: evidence-driven failure diagnosis, closed-loop improvement design (observe → diagnose → intervene → verify), measurable verification, and knowledge harvest back into skills — plus system model (feedback sources, control loop, attribution), failure modes (Goodhart, confounded changes, eval leakage, reviewer drift, delayed regression, token bloat), decision trade-offs (automation vs human gate, eval breadth vs depth, prompt vs skills), and quality guardrails (reproducible metrics, ethical scope, no fabricated win rates).

  Use this skill when the user asks to make an agent improve itself, analyze repeated mistakes, design reflection loops, define learning checkpoints, reduce quality drift, or run structured PDCA-style uplift with before/after metrics.

  Combine with **`feedback-pro`** for review signals, **`planning-pro`** for roadmaps, **`testing-pro`** for regression and eval harnesses, **`repo-tooling-pro`** / **`skills-self-review-pro`** for bundle audits, **`git-operations-pro`** for contribution hygiene, **`security-pro`** for high-stakes gates, and **`bug-discovery-pro`** for hard repros.

  Triggers: "self improve agent", "agent improvement", "reflection loop", "learning loop", "improve accuracy", "reduce failures", "retrospective", "continuous improvement", "quality iteration", "eval harness", "quality drift", "PDCA", "before after metrics", "rollback prompt", "experiment table".

metadata:
  short-description: Self-improve agent — control loop, diagnosis, metrics, harvest to skills
  content-language: en
  domain: agent-operations
  level: professional
---

# Self-improving agent workflow (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [PDCA / Deming](https://en.wikipedia.org/wiki/PDCA) and [retrospective](https://www.atlassian.com/team-playbook/plays/retrospective) practices for process framing; this skill encodes **closed-loop control**, **attribution discipline**, and **durable knowledge capture** — not one-off prompt vibes. Confirm **agent goals**, **failure surface**, **constraints**, and **success metrics** before proposing changes.

## Boundary

**`self-improve-agent-pro`** owns the **improvement system** (diagnosis taxonomy, loop design, metrics, rollback, harvest workflow). **`feedback-pro`** owns **deep review content**. **`planning-pro`** owns **delivery sequencing and capacity**. **`testing-pro`** owns **test architecture and CI**. **`repo-tooling-pro`** owns **this repo’s CLI** for audits.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`feedback-pro`** | Evidence-rich findings and prioritization |
| **`planning-pro`** | Phased improvement roadmap |
| **`testing-pro`** | Regression and eval harness |
| **`repo-tooling-pro`** | `analyze-skills`, batch metrics |
| **`skills-self-review-pro`** | Bundle / authoring meta-quality |
| **`git-operations-pro`** | PR workflow for harvested skills |
| **`security-pro`** | Gates when agents touch sensitive data or production |
| **`bug-discovery-pro`** | Intermittent or environment-heavy failures |

## When to use

- Repeatable self-improvement cycle for an agent or agent team.
- Recurring failures, quality drift, or post-mortem → structured follow-up.
- Reflection checkpoints after runs; prioritization under time pressure.
- Before/after proof and rollback rules for prompt/skill/tool changes.

## When not to use

- **Single bug fix** without loop or metrics — use domain skill or **`bug-discovery-pro`**.
- **Replace human judgment** in safety-critical approvals — policy + **`security-pro`**.
- **Pure project scheduling** without quality diagnosis — **`planning-pro`** alone may lead.

## Required inputs

- **Baseline metrics** (or agreement to measure before change).
- **Failure examples** or logs (or explicit unknowns).
- **Constraints** (latency, cost, privacy, model lock).

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

1. Confirm goals, baseline, failure categories, and constraints.
2. Apply summaries; open `references/`; anchor on **`agent-improvement-feedback-system-model.md`** for loop structure.
3. Respond with **Suggested response format**; call out **Goodhart**, **confounding**, and **harvest** path.

### Operating principles

1. **Measure before changing** — **`metrics-and-verification.md`**.
2. **Root causes over symptoms** — **`failure-diagnosis-and-patterns.md`**.
3. **One controlled change** when possible — **`decision-tree.md`**.
4. **Close every loop** — **`improvement-loop-design.md`**.
5. **Prioritize by impact × recurrence** — **`failure-diagnosis-and-patterns.md`**.
6. **Guard regressions** — **`testing-pro`**.
7. **Token efficiency** — High usage signals context bloat — tune prompts/skills.
8. **Harvest knowledge** — Recurring patterns → skills PR — **`contributor-workflow.md`**.

### Failure diagnosis and pattern mining (summary)

Taxonomy, clustering, recurrence — **`failure-diagnosis-and-patterns.md`**.

Details: [references/failure-diagnosis-and-patterns.md](references/failure-diagnosis-and-patterns.md)

### Agent improvement — system model (summary)

Observe → diagnose → intervene → verify; signal triangulation — **`agent-improvement-feedback-system-model.md`**.

Details: [references/agent-improvement-feedback-system-model.md](references/agent-improvement-feedback-system-model.md)

### Improvement loop design (summary)

Hypothesis, intervention, checkpoints, rollback — **`improvement-loop-design.md`**.

Details: [references/improvement-loop-design.md](references/improvement-loop-design.md)

### Metrics and verification strategy (summary)

Outcome vs process metrics; pre/post — **`metrics-and-verification.md`**.

Details: [references/metrics-and-verification.md](references/metrics-and-verification.md)

### Tips and tricks (summary)

Lightweight templates — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Metric gaming, sparsity, confounding, drift — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Human gate vs automation; eval breadth; prompt vs skills — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Placebo tuning, eval overfit, no rollback — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`feedback-pro`**, **`planning-pro`**, **`testing-pro`**, **`repo-tooling-pro`**, **`skills-self-review-pro`**, **`git-operations-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Contributor workflow (summary)

Harvest fixes into skills via PR — **`contributor-workflow.md`**.

Details: [references/contributor-workflow.md](references/contributor-workflow.md)

### Versions (summary)

Model IDs, eval fixtures — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Agent purpose, stakes, traffic volume, current metrics, constraints.
2. **Problem / goal** — Drift class, incident, or uplift target.
3. **System design** — Feedback loop and signal sources — **`agent-improvement-feedback-system-model.md`**.
4. **Decision reasoning** — Which lever (prompt vs skill vs tool vs model); human gate? — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Experiment table, checklist, rollback — still labeled **Code** in spirit (tables/checklists as deliverable artifacts).
6. **Trade-offs** — Eval cost, latency, reviewer time, automation risk.
7. **Failure modes** — Goodhart, confounding, leakage, drift — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — Monitoring cadence; hand off to **`testing-pro`**, **`security-pro`**, **`skills-self-review-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Feedback & control system model** | [references/agent-improvement-feedback-system-model.md](references/agent-improvement-feedback-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Failure diagnosis and patterns | [references/failure-diagnosis-and-patterns.md](references/failure-diagnosis-and-patterns.md) |
| Improvement loop design | [references/improvement-loop-design.md](references/improvement-loop-design.md) |
| Metrics and verification | [references/metrics-and-verification.md](references/metrics-and-verification.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Contributor workflow | [references/contributor-workflow.md](references/contributor-workflow.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Agent repeats the same mistakes; need a self-improvement routine.  
**Expected output:** Full **Suggested response format** — baseline, taxonomy, loop, verification, harvest — **`agent-improvement-feedback-system-model.md`**.

### 2 — Tricky (edge case)

**Input:** Five prompt changes; eval improved; ship tonight.  
**Expected output:** Attribution failure; isolate or shadow; holdout — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** Use `analyze-skills` to uplift bundle quality.  
**Expected output:** **`repo-tooling-pro`** commands — **`skills-self-review-pro`** checklist — this skill for **hypothesis → PR → validate → measure** loop.

## Checklist before calling the skill done

### Evidence

- [ ] Baseline and targets explicit — **`quality-validation-and-guardrails.md`**.
- [ ] Failure patterns grouped by **root cause** — **`failure-diagnosis-and-patterns.md`**.

### Loop

- [ ] Interventions have pass/fail criteria — **`improvement-loop-design.md`**.
- [ ] Regression / holdout path — **`metrics-and-verification.md`**.
- [ ] **Single-change** or documented factorial — **`decision-tree.md`**.

### Governance

- [ ] Residual risks and monitoring cadence — **`failure-modes-detection-mitigation.md`**.
- [ ] Human review path for high-stakes domains — **`decision-framework-and-trade-offs.md`**.
- [ ] Recurring pattern → **skills PR** path — **`contributor-workflow.md`**.
