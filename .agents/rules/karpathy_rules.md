---
description: Karpathy coding discipline rules for LLM subagent interactions.
---

# Karpathy Coding Discipline Rules
Schema: agentic-sdlc.rule@v1

```json
{
  "require_karpathy_discipline": true,
  "inject_system_prompt": true,
  "enforce_think_step": true,
  "enforce_simplicity_check": true,
  "enforce_surgical_diff": true,
  "enforce_goal_criteria": true,
  "max_changed_files_warning": 10,
  "max_diff_lines_warning": 500
}
```

## Policy Intent

- Reduce overengineering, scope creep, and silent assumptions in AI-assisted coding.
- Enforce the four Karpathy principles across all LLM subagent interactions.
- Keep diffs minimal, auditable, and directly traceable to the user's request.
- Prefer explicit guardrails over implicit behavior.

## Enforcement Behavior

When `require_karpathy_discipline` is `true`:

1. **System prompt injection**: The `karpathy_discipline` skill's system prompt is prepended to every `llm_subagent` call.
2. **Think step gate**: Workflows with `enforce_think_step` require a planning/assumption step before implementation.
3. **Simplicity check**: Agent output exceeding `max_diff_lines_warning` triggers a simplicity review warning.
4. **Surgical diff check**: Changes touching more than `max_changed_files_warning` files trigger a scope review warning.
5. **Goal criteria**: Each workflow step must define verifiable success criteria.

## Disabling

To disable globally, set `require_karpathy_discipline` to `false`.
To disable per-workflow, add `skip_rules: ["karpathy_rules"]` to the workflow metadata.
