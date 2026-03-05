# Skill: langsmith-observability
Schema: antigrav.skill@v1

```json
{
  "description": "LLM observability platform for tracing, evaluation, and monitoring. Use when debugging LLM applications, evaluating model outputs against datasets, monitoring production systems, or building systemati",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155463,
  "model": "qwen3:8b",
  "name": "langsmith-observability",
  "risk": "safe",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "17-observability/langsmith/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "debugging",
    "evaluation",
    "external",
    "imported",
    "langsmith",
    "llm ops",
    "monitoring",
    "observability",
    "production",
    "testing",
    "tracing"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
LLM observability platform for tracing, evaluation, and monitoring. Use when debugging LLM applications, evaluating model outputs against datasets, monitoring production systems, or building systematic testing pipelines for AI applications.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install langsmith

# Set environment variables
export LANGSMITH_API_KEY="your-api-key"
export LANGSMITH_TRACING=true
- from langsmith import traceable
from openai import OpenAI

client = OpenAI()

@traceable
def generate_response(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# Automatically traced to LangSmith
result = generate_response("What is machine learning?")
- from langsmith.wrappers import wrap_openai
from openai import OpenAI

# Wrap client for automatic tracing
client = wrap_openai(OpenAI())

# All calls automatically traced
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `17-observability/langsmith/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# LangSmith - LLM Observability Platform Development platform for debugging, evaluating, and monitoring language models and AI applications. ## When to use LangSmith **Use LangSmith when:** - Debugging LLM application issues (prompts, chains, agents) - Evaluating model outputs systematically against datasets - Monitoring production LLM systems - Building regression testing for AI features - Analyzing latency, token usage, and costs - Collaborating on prompt engineering **Key features:** - **Tracing**: Capture inputs, outputs, latency for all LLM calls - **Evaluation**: Systematic testing with built-in and custom evaluators - **Datasets**: Create test sets from production traces or manually - **Monitoring**: Track metrics, errors, and costs in production - **Integrations**: Works with OpenA

{{input}}
