# Skill: projection-patterns
Schema: antigrav.skill@v1

```json
{
  "description": "Build read models and projections from event streams. Use when implementing CQRS read sides, building materialized views, or optimizing query performance in event-sourced systems.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154396,
  "model": "qwen3:8b",
  "name": "projection-patterns",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "projection-patterns/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Build read models and projections from event streams. Use when implementing CQRS read sides, building materialized views, or optimizing query performance in event-sourced systems.

## When to Use
- Building CQRS read models
- Creating materialized views from events
- Optimizing query performance
- Implementing real-time dashboards
- Building search indexes from events
- Aggregating data across streams

## Examples
- Comprehensive guide to building projections and read models for event-sourced systems.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `projection-patterns/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Projection Patterns Comprehensive guide to building projections and read models for event-sourced systems. ## Use this skill when - Building CQRS read models - Creating materialized views from events - Optimizing query performance - Implementing real-time dashboards - Building search indexes from events - Aggregating data across streams ## Do not use this skill when - The task is unrelated to projection patterns - You need a different domain or tool outside this scope ## Instructions - Clarify goals, constraints, and required inputs. - Apply relevant best practices and validate outcomes. - Provide actionable steps and verification. - If detailed examples are required, open `resources/implementation-playbook.md`. ## Resources - `resources/implementation-playbook.md` for detailed patterns

{{input}}
