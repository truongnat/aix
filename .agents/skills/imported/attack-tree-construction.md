# Skill: attack-tree-construction
Schema: antigrav.skill@v1

```json
{
  "description": "Build comprehensive attack trees to visualize threat paths. Use when mapping attack scenarios, identifying defense gaps, or communicating security risks to stakeholders.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154361,
  "model": "qwen3:8b",
  "name": "attack-tree-construction",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "attack-tree-construction/SKILL.md",
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
Build comprehensive attack trees to visualize threat paths. Use when mapping attack scenarios, identifying defense gaps, or communicating security risks to stakeholders.

## When to Use
- Visualizing complex attack scenarios
- Identifying defense gaps and priorities
- Communicating risks to stakeholders
- Planning defensive investments or test scopes

## Examples
- Systematic attack path visualization and analysis.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `attack-tree-construction/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Attack Tree Construction Systematic attack path visualization and analysis. ## Use this skill when - Visualizing complex attack scenarios - Identifying defense gaps and priorities - Communicating risks to stakeholders - Planning defensive investments or test scopes ## Do not use this skill when - You lack authorization or a defined scope to model the system - The task is a general risk review without attack-path modeling - The request is unrelated to security assessment or design ## Instructions - Confirm scope, assets, and the attacker goal for the root node. - Decompose into sub-goals with AND/OR structure. - Annotate leaves with cost, skill, time, and detectability. - Map mitigations per branch and prioritize high-impact paths. - If detailed templates are required, open `resources/imp

{{input}}
