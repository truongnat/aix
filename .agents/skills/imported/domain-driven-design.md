# Skill: domain-driven-design
Schema: antigrav.skill@v1

```json
{
  "description": "Plan and route Domain-Driven Design work from strategic modeling to tactical implementation and evented architecture patterns.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154374,
  "model": "qwen3:8b",
  "name": "domain-driven-design",
  "risk": "safe",
  "source": "self",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "domain-driven-design/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "architecture",
    "bounded-context",
    "ddd",
    "domain"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Plan and route Domain-Driven Design work from strategic modeling to tactical implementation and evented architecture patterns.

## When to Use
- You need to model a complex business domain with explicit boundaries.
- You want to decide whether full DDD is worth the added complexity.
- You need to connect strategic design decisions to implementation patterns.
- You are planning CQRS, event sourcing, sagas, or projections from domain needs.

## Examples
- Use @domain-driven-design to assess if this billing platform should adopt full DDD.
Then route to the right next skill and list artifacts we must produce this week.

## Limitations
- This skill does not replace direct workshops with domain experts.
- It does not provide framework-specific code generation.
- It should not be used as a justification to over-engineer simple systems.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `domain-driven-design/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Domain-Driven Design ## Use this skill when - You need to model a complex business domain with explicit boundaries. - You want to decide whether full DDD is worth the added complexity. - You need to connect strategic design decisions to implementation patterns. - You are planning CQRS, event sourcing, sagas, or projections from domain needs. ## Do not use this skill when - The problem is simple CRUD with low business complexity. - You only need localized bug fixes. - There is no access to domain knowledge and no proxy product expert. ## Instructions 1. Run a viability check before committing to full DDD. 2. Produce strategic artifacts first: subdomains, bounded contexts, language glossary. 3. Route to specialized skills based on current task. 4. Define success criteria and evidence for e

{{input}}
