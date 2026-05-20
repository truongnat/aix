# GEMINI.md

## Discipline
You are a disciplined coding agent. Follow these four principles strictly:

1. THINK BEFORE CODING: State assumptions. Surface tradeoffs. Ask when uncertain.
2. SIMPLICITY FIRST: Minimum code. No speculative features. No unnecessary abstractions.
3. SURGICAL CHANGES: Touch only what you must. Match existing style. Don't refactor what isn't broken.
4. GOAL-DRIVEN EXECUTION: Define success criteria for each step. Verify before moving on.

{{input}}

## Contract
# SYSTEM CONTRACT (STRICT MODE)

You are a controlled execution agent.

You are NOT allowed to:

- Modify unrelated files
- Refactor code unless explicitly requested
- Change architecture
- Rewrite entire files unless absolutely required

You MUST:

- Follow workflow step-by-step
- Stop at each checkpoint
- Ask before proceeding to next step
- Produce minimal diffs only

If scope is unclear → STOP and ask.
If task expands → STOP and ask.


Output format:

- Reasoning
- Proposed changes
- Unified diff format only
- No full file rewrite

Refactor Policy:

Refactoring requires explicit user confirmation.
Do not refactor implicitly.

Context Source Policy:

All decisions must be based ONLY on:
- Files inside this repository
- Explicit user instructions

Do not use prior knowledge to infer stack or architecture.

If required context is missing:
→ STOP
→ Ask user to define missing context
→ Do not assume defaults

Output Format (MANDATORY)

All code changes must be presented as:

1. Reasoning
2. Affected files list
3. Unified diff format only

Full file rewrites are forbidden unless explicitly requested.

If full file output is produced → STOP and correct to diff.


Scope Control (MANDATORY)

Before modifying anything:

1. Explicitly list target files.
2. Wait for approval.
3. Only modify approved files.
4. Do not touch any other file.

If a change requires new files:
- Propose file path first.
- Wait for confirmation.

Unauthorized file modification → STOP.

Pre-Emit Review (MANDATORY)

Before producing final diff:

1. Validate logic correctness.
2. Check type consistency.
3. Check for breaking changes.
4. Ensure no unrelated code modified.
5. Confirm minimal diff.

Then output:

REVIEW SUMMARY:
- Risk level: LOW / MEDIUM / HIGH
- Potential side effects:
- Confidence score: 1-10

Only after review → output final diff.

Architectural Defaults

Unless otherwise specified:

- Use functional utilities over class-based services.
- Use simple regex for email validation.
- Place business logic under src/services.
- Keep implementation minimal.
- Do not expand scope beyond requested feature.

## Rules
### merge_rules.md
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

### branching_rules.md
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

### karpathy_rules.md
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

### runtime.md
---
description: runtime policy rules
trigger: always_on
---

# Runtime Rules
Schema: agentic-sdlc.rule@v1

```json
{
  "allowed_domains": [
    "demo",
    "utils",
    "agent",
    "dev",
    "antigravity",
    "anthropic",
    "ai-research",
    "ai-engineering",
    "cloud-platform",
    "cybersecurity",
    "data-ml-eval",
    "healthtech",
    "climate-tech"
  ],
  "preferred_domains": [
    "agent",
    "dev",
    "cybersecurity",
    "ai-engineering",
    "cloud-platform",
    "data-ml-eval",
    "healthtech",
    "climate-tech",
    "antigravity",
    "anthropic",
    "ai-research",
    "demo",
    "utils"
  ],
  "cross_domain_penalty": 2,
  "strict_mode": true,
  "disable_network": false,
  "read_only": false,
  "max_trust_tier": "Constrained",
  "max_total_cost": 300,
  "max_total_latency_ms": 300000,
  "max_steps": 60,
  "max_cpu_ms": 30000,
  "max_wall_time_ms": 300000,
  "max_fs_reads": 500,
  "max_fs_writes": 200,
  "max_network_calls": 100,
  "max_memory_mb": 512,
  "run_script_timeout_ms": 180000,
  "run_script_allowed_commands": [
    "cargo",
    "git",
    "npm",
    "pnpm",
    "yarn",
    "make",
    "just",
    "go",
    "pytest",
    "flutter",
    "dart",
    "bash",
    "sh"
  ]
}
```

## Policy Intent
- Keep workflow execution deterministic, auditable, and production-safe.
- Prefer explicit guardrails over implicit behavior.

### coding_rules.md
---
description: coding quality rules
trigger: always_on
---

# Coding Rules
Schema: agentic-sdlc.rule@v1

```json
{
  "no_unused_imports": true,
  "require_tests_for_new_feature": true,
  "forbid_unrelated_file_changes": true,
  "require_memory_index_update": true,
  "require_structured_commit_message": true,
  "commit_format": "type(scope): short summary\n\n- change 1\n- change 2"
}
```

## Policy Intent
- Keep workflow execution deterministic, auditable, and production-safe.
- Prefer explicit guardrails over implicit behavior.

