# Skill: internal-comms
Schema: antigrav.skill@v1

```json
{
  "description": "A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal com",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153431,
  "model": "qwen3:8b",
  "name": "internal-comms",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "internal-comms/SKILL.md",
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
A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).

## When to Use
- 3P updates (Progress, Plans, Problems)
- Company newsletters
- FAQ responses
- Status reports
- Leadership updates
- Project updates
- Incident reports

## Examples
- To write internal communications, use this skill for: - 3P updates (Progress, Plans, Problems) - Company newsletters - FAQ responses - Status reports - Leadership updates - Project updates - Incident reports

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `internal-comms/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

## When to use this skill To write internal communications, use this skill for: - 3P updates (Progress, Plans, Problems) - Company newsletters - FAQ responses - Status reports - Leadership updates - Project updates - Incident reports ## How to use this skill To write any internal communication: 1. **Identify the communication type** from the request 2. **Load the appropriate guideline file** from the `examples/` directory: - `examples/3p-updates.md` - For Progress/Plans/Problems team updates - `examples/company-newsletter.md` - For company-wide newsletters - `examples/faq-answers.md` - For answering frequently asked questions - `examples/general-comms.md` - For anything else that doesn't explicitly match one of the above 3. **Follow the specific instructions** in that file for formatting,

{{input}}
