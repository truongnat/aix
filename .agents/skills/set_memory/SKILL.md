# Skill: set_memory
Schema: agentic-sdlc.skill@v1

```json
{
  "name": "set_memory",
  "domain": "agent",
  "description": "Normalize and structure KEY=VALUE memory updates for downstream workflow steps.",
  "risk": "none",
  "source": "self",
  "tags": ["memory", "state", "workflow"],
  "executor": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.0
}
```

## Overview
Prepare memory state updates in a deterministic KEY=VALUE style for runtime consumption.

## When to Use
- Use when a workflow step needs to persist small state values for later steps.
- Use when input state is noisy and must be normalized.

## Examples
Input:
```
RELEASE_TAG=v1.2.3
```

Expected output shape:
```json
{
  "summary": "memory update validated",
  "actions": ["store RELEASE_TAG=v1.2.3"],
  "risks": []
}
```

## Limitations
- Does not write to external databases directly.
- Intended for small key-value state, not large documents.

Store a value in memory using KEY=VALUE format.
Useful for passing state between steps using {{memory.KEY}}.

Input:
{{input}}
