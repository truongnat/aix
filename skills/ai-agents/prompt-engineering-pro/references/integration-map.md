# Prompt Engineering Integration Map

## ai-integration-pro

- **When**: The prompt is part of a broader agent with tools, RAG, or memory.
- **Ownership split**:
  - `prompt-engineering-pro`: Prompt design, optimization, versioning.
  - `ai-integration-pro`: Agent architecture, tool selection, RAG, memory, orchestration.

## agent-evaluation-pro

- **When**: Measuring prompt quality with metrics and regression tests.
- **Ownership split**:
  - `prompt-engineering-pro`: Designing prompt variants.
  - `agent-evaluation-pro`: Measuring quality, building datasets, statistical testing.

## testing-pro

- **When**: Integrating prompt tests into CI.
- **Ownership split**:
  - `prompt-engineering-pro`: Prompt design and expected outputs.
  - `testing-pro`: CI structure, test pyramid, flaky test management.
