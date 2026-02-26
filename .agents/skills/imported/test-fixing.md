# Skill: test-fixing
Schema: antigrav.skill@v1

```json
{
  "description": "Run tests and systematically fix all failing tests using smart error grouping. Use when user asks to fix failing tests, mentions test failures, runs test suite and failures occur, or requests to ma...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154403,
  "model": "qwen3:8b",
  "name": "test-fixing",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "test-fixing/SKILL.md",
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
Run tests and systematically fix all failing tests using smart error grouping. Use when user asks to fix failing tests, mentions test failures, runs test suite and failures occur, or requests to ma...

## When to Use
- Explicitly asks to fix tests ("fix these tests", "make tests pass")
- Reports test failures ("tests are failing", "test suite is broken")
- Completes implementation and wants tests passing
- Mentions CI/CD failures due to tests

## Examples
- uv run pytest tests/path/to/test_file.py -v
     uv run pytest -k "pattern" -v

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `test-fixing/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Test Fixing Systematically identify and fix all failing tests using smart grouping strategies. ## When to Use - Explicitly asks to fix tests ("fix these tests", "make tests pass") - Reports test failures ("tests are failing", "test suite is broken") - Completes implementation and wants tests passing - Mentions CI/CD failures due to tests ## Systematic Approach ### 1. Initial Test Run Run `make test` to identify all failing tests. Analyze output for: - Total number of failures - Error types and patterns - Affected modules/files ### 2. Smart Error Grouping Group similar failures by: - **Error type**: ImportError, AttributeError, AssertionError, etc. - **Module/file**: Same file causing multiple test failure - **Root cause**: Missing dependencies, API changes, refactoring impacts Prioritize

{{input}}
