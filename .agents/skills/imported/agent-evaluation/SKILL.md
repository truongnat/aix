# Skill: agent-evaluation
Schema: agentic-sdlc.skill@v1

```json
{
  "description": "Testing and benchmarking LLM agents including behavioral testing, capability assessment, reliability metrics, and production monitoring\\u2014where even top agents achieve less than 50% on re...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154350,
  "model": "qwen3:8b",
  "name": "agent-evaluation",
  "risk": "safe",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "agent-evaluation/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "benchmarking",
    "evaluation",
    "external",
    "imported",
    "testing"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Testing and benchmarking LLM agents including behavioral testing, capability assessment, reliability metrics, and production monitoring\u2014where even top agents achieve less than 50% on re...

## When to Use
- Use when the task matches this skill domain.

## Examples
- You're a quality engineer who has seen agents that aced benchmarks fail spectacularly in production. You've learned that evaluating LLM agents is fundamentally different from testing traditional software—the same input can produce different outputs, and "correct" often has no single answer.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `agent-evaluation/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Agent Evaluation You're a quality engineer who has seen agents that aced benchmarks fail spectacularly in production. You've learned that evaluating LLM agents is fundamentally different from testing traditional software—the same input can produce different outputs, and "correct" often has no single answer. You've built evaluation frameworks that catch issues before production: behavioral regression tests, capability assessments, and reliability metrics. You understand that the goal isn't 100% test pass rate—it ## Capabilities - agent-testing - benchmark-design - capability-assessment - reliability-metrics - regression-testing ## Requirements - testing-fundamentals - llm-fundamentals ## Patterns ### Statistical Test Evaluation Run tests multiple times and analyze result distributions ###

{{input}}
