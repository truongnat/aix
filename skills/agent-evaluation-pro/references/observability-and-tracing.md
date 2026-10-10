# Observability and Tracing

## Framework comparison

### LangSmith

- **Best for**: LangChain / LangGraph teams.
- **Features**: Deep tracing, debugging, evals, prompt management.
- **Deployment**: Cloud-hosted or self-hosted.
- **Integration**: Native with LangChain; SDK available for custom agents.

### Arize Phoenix

- **Best for**: OTel-native, model-agnostic, self-hosted preference.
- **Features**: Tracing, evals, prompt experiments, embeddings visualization.
- **Deployment**: Self-hosted or cloud.
- **Integration**: OpenTelemetry protocol; works with any framework.

### Langfuse

- **Best for**: Open-source, self-hosted, prompt management + tracing.
- **Features**: Traces, scores, prompt versioning, datasets.
- **Deployment**: Self-hosted or cloud.
- **Integration**: SDK for Python, TypeScript, and more.

### Braintrust

- **Best for**: CI-native evals, statistical testing, dataset versioning.
- **Features**: Evals, experiments, diffing, custom scorers.
- **Deployment**: Cloud.
- **Integration**: CLI and SDK; integrates with CI/CD pipelines.

### Promptfoo

- **Best for**: CLI-first, red-teaming, cheapest simple evals.
- **Features**: Prompt comparison, red-team plugins, CI integration.
- **Deployment**: Self-hosted or cloud.
- **Integration**: CLI, config-driven, works with any model.

## What to trace

- **Inputs**: User query, system prompt, few-shot examples, context documents.
- **Outputs**: Model response, structured data, tool calls.
- **Intermediate steps**: Reasoning traces, tool results, retrieval chunks.
- **Metadata**: Model name, version, temperature, token count, latency, user ID.
- **Scores**: Evaluation metrics attached to each trace.

## Alerting

- P99 latency spike.
- Error rate increase (JSON parse failures, tool execution errors).
- Score regression on golden dataset.
- Cost per query threshold breach.
