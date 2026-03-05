# Skill: ask-questions-if-underspecified
Schema: antigrav.skill@v1

```json
{
  "description": "Clarify requirements before implementing. Use when serious doubts arise.",
  "domain": "imported",
  "executor": "ollama",
  "imported_at_ms": 1772726746670,
  "model": "qwen3:8b",
  "name": "ask-questions-if-underspecified",
  "risk": "none",
  "source": "https://github.com/trailofbits/skills",
  "source_commit": "8f92c6dee05a130f7f7840806b1f3a8e58fb48df",
  "source_license": "CC0-1.0",
  "source_path": "plugins/ask-questions-if-underspecified/skills/ask-questions-if-underspecified/SKILL.md",
  "source_requested": "https://github.com/trailofbits/skills",
  "tags": [
    "ask",
    "external",
    "imported",
    "questions",
    "underspecified"
  ],
  "temperature": 0.1
}
```

## Overview
Clarify requirements before implementing. Use when serious doubts arise.

## When to Use
- Use when the task matches this skill domain.

## Examples
- 1) Scope?
a) Minimal change (default)
b) Refactor while touching the area
c) Not sure - use default
2) Compatibility target?
a) Current project defaults (default)
b) Also support older versions: <specify>
c) Not sure - use default

Reply with: defaults (or 1a 2a)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `https://github.com/trailofbits/skills`; resolved source `https://github.com/trailofbits/skills`; path `plugins/ask-questions-if-underspecified/skills/ask-questions-if-underspecified/SKILL.md`.
Pinned source commit: `8f92c6dee05a130f7f7840806b1f3a8e58fb48df`.
Detected source license: `CC0-1.0`.

Original excerpt:

# Ask Questions If Underspecified ## When to Use Use this skill when a request has multiple plausible interpretations or key details (objective, scope, constraints, environment, or safety) are unclear. ## When NOT to Use Do not use this skill when the request is already clear, or when a quick, low-risk discovery read can answer the missing details. ## Goal Ask the minimum set of clarifying questions needed to avoid wrong work; do not start implementing until the must-have questions are answered (or the user explicitly approves proceeding with stated assumptions). ## Workflow ### 1) Decide whether the request is underspecified Treat a request as underspecified if after exploring how to perform the work, some or all of the following are not clear: - Define the objective (what should change v

{{input}}
