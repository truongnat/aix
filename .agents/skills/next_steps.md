# Skill: next_steps
Schema: antigrav.skill@v1

```json
{
  "name": "next_steps",
  "domain": "agent",
  "description": "Derive the next actionable workflow tasks from current progress notes.",
  "risk": "none",
  "source": "self",
  "tags": ["planning", "workflow", "orchestration"],
  "executor": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.1
}
```

## Overview
Create concise, execution-ready next tasks based on current workflow context.

## When to Use
- Use when workflow progress needs to be decomposed into follow-up tasks.
- Use when status notes are available but action sequencing is unclear.

## Examples
Input:
```
feature merged; tests flaky on CI; missing release note
```

Expected output shape:
```json
{
  "summary": "what to do next",
  "actions": ["action 1", "action 2"],
  "risks": ["blocking risk"]
}
```

## Limitations
- Suggests actions but does not modify workflow files directly.
- Requires reasonably complete context to prioritize correctly.

Add more tasks to the workflow dynamically.
Input should be a newline-separated list of tasks.

{{input}}
