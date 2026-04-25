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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** goals, baseline, failure categories, and constraints. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.