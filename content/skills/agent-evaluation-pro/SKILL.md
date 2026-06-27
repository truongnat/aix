---
name: agent-evaluation-pro
description: >
  Evaluate, observe, and improve AI agent / LLM output quality with structured
  metrics, regression testing, red-teaming, and CI/CD integration.


  Use this skill when measuring agent correctness, setting up prompt regression
  tests, debugging agent failures at scale, or building an evaluation pipeline
  for production agents.


  Do not use for general software testing (use testing-pro) or for building the
  agent itself (use ai-integration-pro).


  Triggers: "evaluate agent", "LLM testing", "prompt regression", "agent
  observability", "trace agent", "red team LLM", "agent quality", "eval
  pipeline", "golden dataset", "output scoring", "LLM benchmark", "compare
  prompts", "A/B test agent".
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# Agent and LLM evaluation (professional)

Skill text is **English**; match the user's response language from Cursor User Rules / project rules when applicable.

Use evaluation frameworks (Promptfoo, Braintrust, LangSmith, Arize Phoenix, Langfuse) and academic literature on LLM evaluation as authority. This skill encodes **metric design**, **dataset curation**, **regression testing**, **red-teaming**, **observability**, and **CI integration** for agentic systems. Confirm **evaluation goal** (correctness, latency, cost, safety), **baseline**, and **dataset size** before proposing a pipeline.

## Boundary

**`agent-evaluation-pro`** owns **metric design**, **dataset curation**, **regression testing**, **red-teaming**, **agent observability** (tracing, logging, scoring), and **CI evaluation pipelines**. It does **not** own building the agent, prompt engineering depth, or general software testing — combine with **`ai-integration-pro`**, **`prompt-engineering-pro`**, and **`testing-pro`** as needed.

| Skill | When to combine with **`agent-evaluation-pro`** |
|-------|-------------------------------------------------|
| **`ai-integration-pro`** | When the evaluation is part of building or iterating on the agent itself |
| **`prompt-engineering-pro`** | When comparing prompt variants or designing prompt templates for eval |
| **`testing-pro`** | General software testing strategy, test pyramid, CI structure |
| **`security-pro`** | Red-teaming for safety, jailbreak detection, adversarial testing |
| **`ci-cd-pro`** | Pipeline design, deployment gates, artifact management |

## When to use

- Designing evaluation metrics for an agent (correctness, hallucination, latency, cost, safety).
- Building a golden dataset or benchmark for regression testing.
- Comparing two prompts, models, or agent versions with A/B or statistical testing.
- Setting up tracing and observability (LangSmith, Langfuse, Arize Phoenix, Braintrust).
- Red-teaming an agent for safety, jailbreaks, or prompt injection.
- Integrating evals into CI/CD so bad outputs block deploy.
- Debugging why an agent fails on specific inputs via trace analysis.
- Trigger keywords: `evaluate agent`, `LLM testing`, `prompt regression`, `red team`, `agent observability`, `eval pipeline`

## When not to use

- **General software testing** (unit tests, integration tests for non-LLM code) — use **`testing-pro`**.
- **Building the agent** (prompt design, tool selection, RAG) — use **`ai-integration-pro`**.
- **Prompt engineering depth** (chain-of-thought, few-shot design) — use **`prompt-engineering-pro`**.
- **Security pentesting** of non-agent infrastructure — use **`security-pro`**.

## Required inputs

- **Evaluation goal** — correctness, latency, cost, safety, user satisfaction, or combination.
- **Baseline** — current agent version, human benchmark, or competitor.
- **Dataset size** — number of examples; representative of production distribution.
- **Framework preference** — Promptfoo, Braintrust, LangSmith, Arize Phoenix, Langfuse, or custom.

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** evaluation goal, baseline, dataset size, and framework → verify: [scope documented].
2. **State assumptions** about data distribution, metric stability, and human label availability (**Think Before Coding**).
3. **Apply** minimum metric set first; add complexity only when justified (**Simplicity First**).
4. **Make surgical changes** — only evaluate what the request asks for (**Surgical Changes**).
5. **Define success criteria**; loop until verified with statistical significance (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Clarify what "good" means before choosing metrics. A correctness metric for a coding agent differs from a creativity metric for a writing agent.
2. **Simplicity First** — Start with exact-match or human-judged correctness. Add embedding similarity, LLM-as-judge, or multi-metric scoring only when needed.
3. **Surgical Changes** — Add only the evaluation dimensions the request requires. Don't build a full observability suite for a one-off prompt comparison.
4. **Goal-Driven Execution** — Done = metric is reproducible, statistically significant, and actionable.
5. **Human ground truth is gold** — Automated metrics approximate human judgment. Calibrate automated metrics against human labels regularly.
6. **Regression > benchmark** — A dataset that catches regressions on your actual traffic is more valuable than a public benchmark.
7. **Trace everything** — Without traces, debugging agent failures is guesswork. Log inputs, outputs, intermediate steps, and scores.

## Default recommendations by scenario

| Scenario | Default |
|----------|---------|
| One-off prompt comparison | **Promptfoo** with exact-match or LLM-as-judge |
| Continuous CI eval | **Braintrust** or **LangSmith** with dataset versioning |
| Safety / red-teaming | **Promptfoo** red-team plugin or custom adversarial dataset |
| Production observability | **LangSmith** (LangChain) or **Arize Phoenix** (OTel-native) |
| Cost-sensitive eval | Self-hosted **Promptfoo** or custom script with local judge |
| Multi-model comparison | **Braintrust** evals with statistical significance testing |

## Decision trees

Summary: goal → metric → dataset → tool → CI.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: evaluating on training data, single metric obsession, no human calibration, ignoring latency/cost, no regression dataset, evaluating once and forgetting.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Metrics and scoring (summary)

- **Exact match**: String or JSON equality. Simplest, most strict.
- **Embedding similarity**: Cosine similarity of output vs. reference. Good for semantic equivalence.
- **LLM-as-judge**: Another LLM scores output quality. Calibrate against humans.
- **Rule-based**: Regex, JSON Schema validation, code compilation. Good for structured outputs.
- **Latency / cost**: Track token usage and response time per query.

Details: [references/metrics-and-scoring.md](references/metrics-and-scoring.md)

### Dataset curation (summary)

- Golden dataset: representative of production traffic, not training data.
- Edge cases: failure modes from past traces, adversarial examples.
- Versioning: treat datasets like code — version, review, branch.

Details: [references/dataset-curation.md](references/dataset-curation.md)

### Observability and tracing (summary)

- LangSmith: LangChain ecosystem; deep tracing, debugging, evals.
- Arize Phoenix: OTel-native, self-hostable, model-agnostic.
- Langfuse: Open-source, self-hostable, prompt management + tracing.
- Braintrust: CI-native, statistical testing, dataset versioning.
- Promptfoo: CLI-first, red-teaming, cheapest for simple cases.

Details: [references/observability-and-tracing.md](references/observability-and-tracing.md)

### Red-teaming and safety (summary)

- Adversarial datasets: jailbreaks, prompt injection, data extraction.
- Automated red-teaming: Promptfoo plugins, Garak, PurpleLlama.
- Human review: safety-critical outputs need human-in-the-loop.

Details: [references/red-teaming-and-safety.md](references/red-teaming-and-safety.md)

## Cross-skill handoffs

- **`ai-integration-pro`** — when the eval is part of building or iterating the agent itself.
- **`prompt-engineering-pro`** — when comparing prompt variants or designing templates for eval.
- **`testing-pro`** — for general software testing strategy and CI structure.
- **`security-pro`** — for safety red-teaming beyond agent output evaluation.
- **`ci-cd-pro`** — for pipeline design, deployment gates, and artifact management.

Details: [references/integration-map.md](references/integration-map.md)

## Suggested response format (implement / review)

1. **Issue or goal** — What is being evaluated and why.
2. **Recommendation** — Metric set, dataset approach, framework choice, and CI plan.
3. **Code** — Dataset schema, evaluation script, metric implementation, and trace config.
4. **Residual risks** — Metric bias, dataset drift, cost escalation, false positive/negative rates.

## Resources in this skill

| Topic | File |
|-------|------|
| Metrics and scoring patterns | [references/metrics-and-scoring.md](references/metrics-and-scoring.md) |
| Dataset curation best practices | [references/dataset-curation.md](references/dataset-curation.md) |
| Observability and tracing frameworks | [references/observability-and-tracing.md](references/observability-and-tracing.md) |
| Red-teaming and safety | [references/red-teaming-and-safety.md](references/red-teaming-and-safety.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

**Input:** "Our customer support agent sometimes gives wrong refund policy answers. How do we catch regressions?"
- Build a **golden dataset** of 50 representative queries with correct answers.
- Metric: **exact match** on refund-eligibility boolean + **embedding similarity** on explanation text.
- Framework: **Promptfoo** for quick setup; **Braintrust** for CI integration.
- Baseline: current production agent output.
- Gate: new deploy must match or exceed baseline on 95% of examples.
- **Verify:** Dataset covers edge cases (partial refunds, expired policies, international orders).

**Input (tricky):** "Is our LLM-as-judge metric actually reliable?"
- Calibrate: run LLM judge vs. human labels on 100 examples; compute Cohen's kappa.
- If kappa < 0.7: the judge is unreliable. Switch to human labels or improve judge prompt.
- Document the calibration result and re-run quarterly.
- **Verify:** Calibration report includes agreement rate, confusion matrix, and examples of disagreement.

**Input (cross-skill):** "We need to A/B test a new prompt and ship it safely."
- **`agent-evaluation-pro`**: Design metric, dataset, and statistical test.
- **`prompt-engineering-pro`**: Design the new prompt variant and control.
- **`ci-cd-pro`**: Implement canary deploy with eval gate.
- **`ai-integration-pro`**: Integrate the winning prompt into the agent.
- **Verify:** Each skill owns a clear slice; eval gate blocks bad deploys.

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum metric set; no speculative complexity (Simplicity First)
- [ ] Only evaluated dimensions directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified with statistical significance (Goal-Driven Execution)
- [ ] Metric calibrated against human labels where possible
- [ ] Dataset is representative of production traffic, not training data
- [ ] Regression dataset exists and is versioned
- [ ] Tracing configured (LangSmith, Langfuse, Arize, or custom)
- [ ] CI gate documented: what score blocks deploy
- [ ] Residual risks called out: metric bias, drift, cost
