---
description: branching strategy rules
trigger: always_on
---

# Branching Rules
Schema: agentic-sdlc.rule@v1

```json
{
  "strategy": "thread-per-branch",
  "prefix": "thread/",
  "allow_auto_create": true,
  "allow_auto_checkout": true,
  "cleanup_after_merge": true
}
```

## Policy Intent
- Keep workflow execution deterministic, auditable, and production-safe.
- Prefer explicit guardrails over implicit behavior.
