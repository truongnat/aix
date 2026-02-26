# Skill: ddd-strategic-design
Schema: antigrav.skill@v1

```json
{
  "description": "Design DDD strategic artifacts including subdomains, bounded contexts, and ubiquitous language for complex business domains.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154372,
  "model": "qwen3:8b",
  "name": "ddd-strategic-design",
  "risk": "safe",
  "source": "self",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "ddd-strategic-design/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "bounded-context",
    "ddd",
    "strategic-design",
    "ubiquitous-language"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Design DDD strategic artifacts including subdomains, bounded contexts, and ubiquitous language for complex business domains.

## When to Use
- Defining core, supporting, and generic subdomains.
- Splitting a monolith or service landscape by domain boundaries.
- Aligning teams and ownership with bounded contexts.
- Building a shared ubiquitous language with domain experts.

## Examples
- Use @ddd-strategic-design to map our commerce domain into bounded contexts,
classify subdomains, and propose team ownership.

## Limitations
- This skill does not produce executable code.
- It cannot infer business truth without stakeholder input.
- It should be followed by tactical design before implementation.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `ddd-strategic-design/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# DDD Strategic Design ## Use this skill when - Defining core, supporting, and generic subdomains. - Splitting a monolith or service landscape by domain boundaries. - Aligning teams and ownership with bounded contexts. - Building a shared ubiquitous language with domain experts. ## Do not use this skill when - The domain model is stable and already well bounded. - You need tactical code patterns only. - The task is purely infrastructure or UI oriented. ## Instructions 1. Extract domain capabilities and classify subdomains. 2. Define bounded contexts around consistency and ownership. 3. Establish a ubiquitous language glossary and anti-terms. 4. Capture context boundaries in ADRs before implementation. If detailed templates are needed, open `references/strategic-design-template.md`. ## Requ

{{input}}
