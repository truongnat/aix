# Agent Evaluation Integration Map

## ai-integration-pro

- **When**: The evaluation is part of building or iterating the agent itself.
- **Ownership split**:
  - `agent-evaluation-pro`: Metric design, dataset, statistical testing.
  - `ai-integration-pro`: Agent architecture, tool selection, RAG, memory.

## prompt-engineering-pro

- **When**: Comparing prompt variants or designing templates for eval.
- **Ownership split**:
  - `agent-evaluation-pro`: Measuring prompt quality with metrics.
  - `prompt-engineering-pro`: Designing the prompt variants themselves.

## testing-pro

- **When**: General software testing strategy and CI structure.
- **Ownership split**:
  - `agent-evaluation-pro`: LLM-specific evals (metrics, datasets, tracing).
  - `testing-pro`: Unit tests, integration tests for non-LLM code, test pyramid.

## security-pro

- **When**: Safety red-teaming beyond agent output evaluation.
- **Ownership split**:
  - `agent-evaluation-pro`: Automated red-team scoring, safety metrics.
  - `security-pro`: Infrastructure hardening, threat modeling, pentesting.

## ci-cd-pro

- **When**: Pipeline design, deployment gates, artifact management.
- **Ownership split**:
  - `agent-evaluation-pro`: What to evaluate and how to score.
  - `ci-cd-pro`: Pipeline structure, gating logic, artifact publishing.
