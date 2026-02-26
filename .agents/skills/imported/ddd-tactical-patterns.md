# Skill: ddd-tactical-patterns
Schema: antigrav.skill@v1

```json
{
  "description": "Apply DDD tactical patterns in code using entities, value objects, aggregates, repositories, and domain events with explicit invariants.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154372,
  "model": "qwen3:8b",
  "name": "ddd-tactical-patterns",
  "risk": "safe",
  "source": "self",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "ddd-tactical-patterns/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "aggregates",
    "antigravity",
    "ddd",
    "domain-events",
    "tactical",
    "value-objects"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Apply DDD tactical patterns in code using entities, value objects, aggregates, repositories, and domain events with explicit invariants.

## When to Use
- Translating domain rules into code structures.
- Designing aggregate boundaries and invariants.
- Refactoring an anemic model into behavior-rich domain objects.
- Defining repository contracts and domain event boundaries.

## Examples
- class Order {
  private status: "draft" | "submitted" = "draft";

  submit(itemsCount: number): void {
    if (itemsCount === 0) throw new Error("Order cannot be submitted empty");
    if (this.status !== "draft") throw new Error("Order already submitted");
    this.status = "submitted";
  }
}

## Limitations
- This skill does not define deployment architecture.
- It does not choose databases or transport protocols.
- It should be paired with testing patterns for invariant coverage.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `ddd-tactical-patterns/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# DDD Tactical Patterns ## Use this skill when - Translating domain rules into code structures. - Designing aggregate boundaries and invariants. - Refactoring an anemic model into behavior-rich domain objects. - Defining repository contracts and domain event boundaries. ## Do not use this skill when - You are still defining strategic boundaries. - The task is only API documentation or UI layout. - Full DDD complexity is not justified. ## Instructions 1. Identify invariants first and design aggregates around them. 2. Model immutable value objects for validated concepts. 3. Keep domain behavior in domain objects, not controllers. 4. Emit domain events for meaningful state transitions. 5. Keep repositories at aggregate root boundaries. If detailed checklists are needed, open `references/tacti

{{input}}
