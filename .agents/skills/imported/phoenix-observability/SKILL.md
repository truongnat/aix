# Skill: phoenix-observability
Schema: antigrav.skill@v1

```json
{
  "description": "Open-source AI observability platform for LLM tracing, evaluation, and monitoring. Use when debugging LLM applications with detailed traces, running evaluations on datasets, or monitoring production A",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155464,
  "model": "qwen3:8b",
  "name": "phoenix-observability",
  "risk": "safe",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "17-observability/phoenix/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "arize",
    "debugging",
    "evaluation",
    "external",
    "imported",
    "llm ops",
    "monitoring",
    "observability",
    "opentelemetry",
    "phoenix",
    "tracing"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Open-source AI observability platform for LLM tracing, evaluation, and monitoring. Use when debugging LLM applications with detailed traces, running evaluations on datasets, or monitoring production AI systems with real-time insights.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install arize-phoenix

# With specific backends
pip install arize-phoenix[embeddings]  # Embedding analysis
pip install arize-phoenix-otel         # OpenTelemetry config
pip install arize-phoenix-evals        # Evaluation framework
pip install arize-phoenix-client       # Lightweight REST client
- import phoenix as px

# Launch in notebook (ThreadServer mode)
session = px.launch_app()

# View UI
session.view()  # Embedded iframe
print(session.url)  # http://localhost:6006
- # Start Phoenix server
phoenix serve

# With PostgreSQL
export PHOENIX_SQL_DATABASE_URL="postgresql://user:pass@host/db"
phoenix serve --port 6006

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `17-observability/phoenix/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Phoenix - AI Observability Platform Open-source AI observability and evaluation platform for LLM applications with tracing, evaluation, datasets, experiments, and real-time monitoring. ## When to use Phoenix **Use Phoenix when:** - Debugging LLM application issues with detailed traces - Running systematic evaluations on datasets - Monitoring production LLM systems in real-time - Building experiment pipelines for prompt/model comparison - Self-hosted observability without vendor lock-in **Key features:** - **Tracing**: OpenTelemetry-based trace collection for any LLM framework - **Evaluation**: LLM-as-judge evaluators for quality assessment - **Datasets**: Versioned test sets for regression testing - **Experiments**: Compare prompts, models, and configurations - **Playground**: Interactiv

{{input}}
