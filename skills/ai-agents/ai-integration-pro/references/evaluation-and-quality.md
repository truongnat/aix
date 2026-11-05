# Evaluation and quality gates

Move from “works once” to **safe iteration**: prompts and models change — quality must be **measured**.

## Layers

| Layer | Purpose |
|-------|---------|
| **Offline eval** | Golden sets, regression before deploy |
| **Online eval** | Shadow traffic, canary, user thumbs |
| **Production metrics** | Latency, cost, error rates, parse failures |

## Golden set

- Fixed **inputs** (and tool mocks) with **expected properties**: JSON schema validity, required fields, citation ids present, tone constraints.
- Version prompts with **prompt id**; run suite on every change.

## Task-specific metrics

- **Structured output** — schema pass rate; **semantic** checks via assertions or lightweight judge model (use sparingly).
- **RAG** — citation correctness (chunk id matches source); **hallucination** sampling.
- **Tool use** — tool selection accuracy, argument validity rate, **success rate** after execution.
- **SLOs** — latency **p50/p95**, tokens per request, cost per successful task.

## Human-in-the-loop

- Sample production traces for **review** when stakes are high (finance, medical routing).

## Regression before model upgrade

- Never ship new **model id** without A/B or offline parity check on golden set — **`versions.md`**.

## Review checklist

- [ ] **Golden / smoke** tests exist for critical prompts.
- [ ] **Prompt/model changes** require eval pass or explicit risk acceptance.
- [ ] **Tool** and **parse failure** rates monitored.
