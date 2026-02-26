---
description: branching strategy rules
trigger: always_on
---

# Branching Rules
Schema: antigrav.rule@v1

```json
{
  "strategy": "thread-per-branch",
  "prefix": "thread/",
  "allow_auto_create": true,
  "allow_auto_checkout": true,
  "cleanup_after_merge": true
}
```
