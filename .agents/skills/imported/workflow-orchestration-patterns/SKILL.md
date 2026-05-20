# Skill: workflow-orchestration-patterns
Schema: agentic-sdlc.skill@v1

```json
{
  "description": "Design durable workflows with Temporal for distributed systems. Covers workflow vs activity separation, saga patterns, state management, and determinism constraints. Use when building long-running pro",
  "domain": "imported",
  "executor": "ollama",
  "imported_at_ms": 1772726592693,
  "model": "qwen3:8b",
  "name": "workflow-orchestration-patterns",
  "risk": "safe",
  "source": "https://github.com/wshobson/agents",
  "source_commit": "ade0c7a211d04fa1354d10359737cace5c6fc5b0",
  "source_license": "MIT",
  "source_path": "plugins/backend-development/skills/workflow-orchestration-patterns/SKILL.md",
  "source_requested": "https://github.com/wshobson/agents",
  "tags": [
    "external",
    "imported",
    "orchestration",
    "patterns",
    "temporal"
  ],
  "temperature": 0.1
}
```

## Overview
Design durable workflows with Temporal for distributed systems. Covers workflow vs activity separation, saga patterns, state management, and determinism constraints. Use when building long-running processes, distributed transactions, or microservice orchestration.

## When to Use
- Use when the task matches this skill domain.

## Examples
- Does it touch external systems? → Activity
Is it orchestration/decision logic? → Workflow
- For each step:
  1. Register compensation BEFORE executing
  2. Execute the step (via activity)
  3. On failure, run all compensations in reverse order (LIFO)

## Limitations
- Using `datetime.now()` instead of `workflow.now()`
- Threading or async operations in workflow code
- Calling external APIs directly from workflow
- Non-deterministic logic in workflows
- Non-idempotent operations (can't handle retries)
- Missing timeouts (activities run forever)
- No error classification (retry validation errors)
- Ignoring payload limits (2MB per argument)

## Imported Notes
Imported from requested source `https://github.com/wshobson/agents`; resolved source `https://github.com/wshobson/agents`; path `plugins/backend-development/skills/workflow-orchestration-patterns/SKILL.md`.
Pinned source commit: `ade0c7a211d04fa1354d10359737cace5c6fc5b0`.
Detected source license: `MIT`.

Original excerpt:

# Workflow Orchestration Patterns Master workflow orchestration architecture with Temporal, covering fundamental design decisions, resilience patterns, and best practices for building reliable distributed systems. ## When to Use Workflow Orchestration ### Ideal Use Cases (Source: docs.temporal.io) - **Multi-step processes** spanning machines/services/databases - **Distributed transactions** requiring all-or-nothing semantics - **Long-running workflows** (hours to years) with automatic state persistence - **Failure recovery** that must resume from last successful step - **Business processes**: bookings, orders, campaigns, approvals - **Entity lifecycle management**: inventory tracking, account management, cart workflows - **Infrastructure automation**: CI/CD pipelines, provisioning, deploym

{{input}}
