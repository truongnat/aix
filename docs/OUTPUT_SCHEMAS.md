# Output Schemas

## Purpose

This document is the source-of-truth for machine-readable output contracts
exposed by the command surface:

- `ask` -> `ask.v1`
- `plan` -> `plan.v1`
- `implement` -> `implement.v1`

These schemas are versioned to prevent contract drift across phases.

---

## Schema: `ask.v1`

Produced by:

- `asd ask "<question>" --json`

Top-level shape:

```json
{
  "schema_version": "ask.v1",
  "question": "string",
  "intent": "overview|bug_location|next_step|generic",
  "answer": "string",
  "retrieval_mode": "string",
  "project_root": "string",
  "synthesis_mode": "string",
  "requires_plan": "boolean",
  "confidence": "number",
  "action_proposal": {
    "action_type": "string",
    "reason": "string",
    "suggested_command": "string"
  },
  "plan_request": {
    "goal": "string",
    "constraints": ["string"]
  },
  "hits": [
    {
      "id": "string",
      "source": "string",
      "score": "number",
      "excerpt": "string"
    }
  ],
  "evidence": ["string"],
  "next_steps": ["string"]
}
```

Notes:

- `action_proposal` is optional (`null` when no action suggested).
- `plan_request` is optional (`null` when `requires_plan=false`).

---

## Schema: `plan.v1`

Produced by:

- `asd plan "<goal>" --json`

Top-level shape:

```json
{
  "schema_version": "plan.v1",
  "plan": {
    "goal": "string",
    "assumptions": ["string"],
    "risks": ["string"],
    "acceptance_criteria": ["string"],
    "tasks": [
      {
        "id": "string",
        "title": "string",
        "objective": "string",
        "expected_output": "string",
        "validation_commands": ["string"],
        "done_criteria": ["string"]
      }
    ]
  },
  "verification": {
    "ok": "boolean",
    "checks": [
      {
        "name": "string",
        "ok": "boolean",
        "message": "string"
      }
    ]
  }
}
```

Notes:

- `verification.ok=false` means the plan must not be executed by `implement`.

---

## Schema: `implement.v1`

Produced by:

- `asd implement "<goal>" --json`
- `asd implement --plan-file <path> --json`

Top-level shape:

```json
{
  "schema_version": "implement.v1",
  "run_id": "string",
  "goal": "string",
  "plan_source": "generated|file",
  "selected_tasks": "number",
  "reports": [
    {
      "task_id": "string",
      "title": "string",
      "dry_run": "boolean",
      "command_results": [
        {
          "command": "string",
          "ok": "boolean",
          "exit_code": "number|null",
          "stdout_preview": "string",
          "stderr_preview": "string"
        }
      ],
      "verification_ok": "boolean"
    }
  ],
  "ok": "boolean"
}
```

Notes:

- `run_id` is persisted in `.agents/memory/implement_runs.json`.
- `ok=false` means at least one task verification failed.

---

## Compatibility Rules

1. New fields may be added in the same `*.v1` schema only when they are optional.
2. Renaming or removing existing fields requires a new major schema version (`*.v2`).
3. Consumers should always branch behavior using `schema_version`.
