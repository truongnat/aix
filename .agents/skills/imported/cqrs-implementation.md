# Skill: cqrs-implementation
Schema: antigrav.skill@v1

```json
{
  "description": "Implement Command Query Responsibility Segregation for scalable architectures. Use when separating read and write models, optimizing query performance, or building event-sourced systems.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154368,
  "model": "qwen3:8b",
  "name": "cqrs-implementation",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "cqrs-implementation/SKILL.md",
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
Implement Command Query Responsibility Segregation for scalable architectures. Use when separating read and write models, optimizing query performance, or building event-sourced systems.

## When to Use
- Separating read and write concerns
- Scaling reads independently from writes
- Building event-sourced systems
- Optimizing complex query scenarios
- Different read/write data models are needed
- High-performance reporting is required

## Examples
- Comprehensive guide to implementing CQRS (Command Query Responsibility Segregation) patterns.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `cqrs-implementation/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# CQRS Implementation Comprehensive guide to implementing CQRS (Command Query Responsibility Segregation) patterns. ## Use this skill when - Separating read and write concerns - Scaling reads independently from writes - Building event-sourced systems - Optimizing complex query scenarios - Different read/write data models are needed - High-performance reporting is required ## Do not use this skill when - The domain is simple and CRUD is sufficient - You cannot operate separate read/write models - Strong immediate consistency is required everywhere ## Instructions - Identify read/write workloads and consistency needs. - Define command and query models with clear boundaries. - Implement read model projections and synchronization. - Validate performance, recovery, and failure modes. - If detai

{{input}}
