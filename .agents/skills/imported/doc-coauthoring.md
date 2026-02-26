# Skill: doc-coauthoring
Schema: antigrav.skill@v1

```json
{
  "description": "Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This wor",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153428,
  "model": "qwen3:8b",
  "name": "doc-coauthoring",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "doc-coauthoring/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/anthropic-skills",
  "tags": [
    "anthropic",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.

## When to Use
- Use when the task matches this skill domain.

## Examples
- This skill provides a structured workflow for guiding users through collaborative document creation. Act as an active guide, walking users through three stages: Context Gathering, Refinement & Structure, and Reader Testing.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `doc-coauthoring/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

# Doc Co-Authoring Workflow This skill provides a structured workflow for guiding users through collaborative document creation. Act as an active guide, walking users through three stages: Context Gathering, Refinement & Structure, and Reader Testing. ## When to Offer This Workflow **Trigger conditions:** - User mentions writing documentation: "write a doc", "draft a proposal", "create a spec", "write up" - User mentions specific doc types: "PRD", "design doc", "decision doc", "RFC" - User seems to be starting a substantial writing task **Initial offer:** Offer the user a structured workflow for co-authoring the document. Explain the three stages: 1. **Context Gathering**: User provides all relevant context while Claude asks clarifying questions 2. **Refinement & Structure**: Iteratively b

{{input}}
