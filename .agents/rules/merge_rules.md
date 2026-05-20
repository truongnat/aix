---
description: merge and conflict policy rules
trigger: always_on
---

# Merge Rules
Schema: agentic-sdlc.rule@v1

```json
{
  "require_validation_before_merge": true,
  "analyze_conflicts": true,
  "auto_conflict_resolution_assist": true,
  "auto_conflict_resolution_strategy": "ours",
  "auto_conflict_resolution_max_attempts": 2,
  "delete_feature_branch_after_merge": true,
  "protected_branches": ["main", "master"],
  "require_rebase_before_merge": false
}
```

## Policy Intent
- Keep workflow execution deterministic, auditable, and production-safe.
- Prefer explicit guardrails over implicit behavior.
