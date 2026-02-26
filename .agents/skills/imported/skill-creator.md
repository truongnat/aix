# Skill: skill-creator
Schema: antigrav.skill@v1

```json
{
  "description": "Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, update or optimize an existing skill, run evals to test a skil",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153439,
  "model": "qwen3:8b",
  "name": "skill-creator",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "skill-creator/SKILL.md",
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
Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, update or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.

## When to Use
- Use when the task matches this skill domain.

## Examples
- skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/    - Executable code for deterministic/repetitive tasks
    ├── references/ - Docs loaded into context as needed
    └── assets/     - Files used in output (templates, icons, fonts)
- cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
- ## Report structure
ALWAYS use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `skill-creator/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

# Skill Creator A skill for creating new skills and iteratively improving them. At a high level, the process of creating a skill goes like this: - Decide what you want the skill to do and roughly how it should do it - Write a draft of the skill - Create a few test prompts and run claude-with-access-to-the-skill on them - Help the user evaluate the results both qualitatively and quantitatively - While the runs happen in the background, draft some quantitative evals if there aren't any (if there are some, you can either use as is or modify if you feel something needs to change about them). Then explain them to the user (or if they already existed, explain the ones that already exist) - Use the `eval-viewer/generate_review.py` script to show the user the results for them to look at, and also

{{input}}
