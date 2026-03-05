# Skill: webapp-testing
Schema: antigrav.skill@v1

```json
{
  "description": "Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser l",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153443,
  "model": "qwen3:8b",
  "name": "webapp-testing",
  "risk": "safe",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "webapp-testing/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/anthropic-skills",
  "tags": [
    "anthropic",
    "debugging",
    "external",
    "imported",
    "playwright",
    "testing",
    "webapp"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.

## When to Use
- Use when the task matches this skill domain.

## Examples
- User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Run: python scripts/with_server.py --help
        │        Then use the helper + write simplified Playwright script
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
- python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
- python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `webapp-testing/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

# Web Application Testing To test local web applications, write native Python Playwright scripts. **Helper Scripts Available**: - `scripts/with_server.py` - Manages server lifecycle (supports multiple servers) **Always run scripts with `--help` first** to see usage. DO NOT read the source until you try running the script first and find that a customized solution is abslutely necessary. These scripts can be very large and thus pollute your context window. They exist to be called directly as black-box scripts rather than ingested into your context window. ## Decision Tree: Choosing Your Approach ``` User task → Is it static HTML? ├─ Yes → Read HTML file directly to identify selectors │ ├─ Success → Write Playwright script using selectors │ └─ Fails/Incomplete → Treat as dynamic (below) │ └─

{{input}}
