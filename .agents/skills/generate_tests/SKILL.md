# Skill: generate_tests
Schema: agentic-sdlc.skill@v1

```json
{
  "name": "generate_tests",
  "domain": "agent",
  "description": "Generate deterministic unit tests from feature or bugfix requirements.",
  "risk": "safe",
  "source": "self",
  "tags": ["testing", "unit-tests", "quality"],
  "executor": "ollama",
  "model": "qwen3:8b"
}
```

## Overview
Generate unit test suites with clear arrange-act-assert structure.

## When to Use
- Use when adding tests for a new feature or regression fix.
- Use when coverage is missing around risky code paths.

## Examples
Input:
```
Add tests for email normalization and duplicate-user rejection.
```

Expected output shape:
```json
{
  "summary": "test strategy",
  "actions": ["test case 1", "test case 2"],
  "risks": ["edge case to watch"]
}
```

## Limitations
- Generates test content only; does not run test commands.
- May require project-specific adaptation for frameworks/utilities.

Generate unit tests for:

{{input}}
