# Workflow: agent-eval

## Metadata

| Field | Value |
|-------|-------|
| **id** | `agent-eval` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `agent_version` | Yes | The agent version to evaluate (current baseline) |
| `eval_goal` | Yes | correctness, latency, cost, safety, or combo |
| `dataset_path` | Yes | Path to golden dataset (JSON or CSV) |
| `framework` | No | Promptfoo, Braintrust, LangSmith, Arize, Langfuse, or custom |

## Steps

### Step 1 — define metrics

- **Type:** skill
- **Skill:** `agent-evaluation-pro`
- **Input:** `eval_goal`
- **Output:** Metric set definition (exact match, embedding similarity, LLM-as-judge, latency, cost)

### Step 2 — validate dataset

- **Type:** skill
- **Skill:** `agent-evaluation-pro`
- **Input:** `dataset_path`
- **Output:** Dataset validation report (coverage, edge cases, version)

### Step 3 — run baseline eval

- **Type:** skill
- **Skill:** `agent-evaluation-pro`
- **Input:** `agent_version`, metrics, dataset
- **Output:** Baseline scores per metric

### Step 4 — implement new variant

- **Type:** skill
- **Skill:** `ai-integration-pro` or `prompt-engineering-pro`
- **Input:** Improvement hypothesis (new prompt, model, or tool)
- **Output:** New agent variant

### Step 5 — run comparison eval

- **Type:** skill
- **Skill:** `agent-evaluation-pro`
- **Input:** Baseline + new variant, same dataset
- **Output:** Side-by-side scores with statistical significance

### Step 6 — gate decision

- **Type:** skill
- **Skill:** `agent-evaluation-pro`
- **Input:** Comparison results, CI gate criteria
- **Output:** Approve / reject / iterate with justification

### Step 7 — integrate into CI

- **Type:** skill
- **Skill:** `ci-cd-pro`
- **Input:** Eval script, gate criteria
- **Output:** CI pipeline config that runs eval on every PR

## Outputs

| Artifact | Description |
|----------|-------------|
| Metric set definition | Chosen metrics (exact match, embedding similarity, LLM-as-judge, latency, cost) |
| Baseline scores | Per-metric scores for the current agent version |
| Comparison report | Side-by-side baseline vs. variant scores with statistical significance |
| Gate decision | Approve / reject / iterate verdict with justification |
| CI eval config | Pipeline config running the eval suite on every PR |
