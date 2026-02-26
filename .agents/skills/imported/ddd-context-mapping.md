# Skill: ddd-context-mapping
Schema: antigrav.skill@v1

```json
{
  "description": "Map relationships between bounded contexts and define integration contracts using DDD context mapping patterns.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154370,
  "model": "qwen3:8b",
  "name": "ddd-context-mapping",
  "risk": "safe",
  "source": "self",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "ddd-context-mapping/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "anti-corruption-layer",
    "antigravity",
    "context-map",
    "ddd",
    "integration"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Map relationships between bounded contexts and define integration contracts using DDD context mapping patterns.

## When to Use
- Defining integration patterns between bounded contexts.
- Preventing domain leakage across service boundaries.
- Planning anti-corruption layers during migration.
- Clarifying upstream and downstream ownership for contracts.

## Examples
- Use @ddd-context-mapping to define how Checkout integrates with Billing,
Inventory, and Fraud contexts, including ACL and contract ownership.

## Limitations
- This skill does not replace API-level schema design.
- It does not guarantee organizational alignment by itself.
- It should be revisited when team ownership changes.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `ddd-context-mapping/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# DDD Context Mapping ## Use this skill when - Defining integration patterns between bounded contexts. - Preventing domain leakage across service boundaries. - Planning anti-corruption layers during migration. - Clarifying upstream and downstream ownership for contracts. ## Do not use this skill when - You have a single-context system with no integrations. - You only need internal class design. - You are selecting cloud infrastructure tooling. ## Instructions 1. List all context pairs and dependency direction. 2. Choose relationship patterns per pair. 3. Define translation rules and ownership boundaries. 4. Add failure modes, fallback behavior, and versioning policy. If detailed mapping structures are needed, open `references/context-map-patterns.md`. ## Output requirements - Relationship

{{input}}
