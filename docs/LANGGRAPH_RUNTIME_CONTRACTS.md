# LangGraph Runtime Contracts

## Purpose

This document defines the core runtime contracts for the rebuild direction
described in:

- [LANGGRAPH_REBUILD_PLAN.md](./LANGGRAPH_REBUILD_PLAN.md)

These contracts are the source of truth for:

- local web UI behavior
- LangGraph state transitions
- harness governance inputs and outputs
- execution adapter boundaries

This file is intentionally product-first and implementation-agnostic.

---

## Design Goals

The contracts below must support a system where:

1. the user interacts through a local web UI
2. the user can create a `/goal`
3. the system analyzes, plans, executes, verifies, and loops until done
4. every non-trivial phase is supervised by the harness
5. state is resumable and inspectable

These contracts should optimize for:

- explicitness
- resumability
- testability
- deterministic state transitions
- safe execution control

---

## Contract Rules

### Rule 1

Every persisted runtime object must have a stable identifier.

### Rule 2

Every stateful object must carry timestamps.

### Rule 3

Every execution-facing object must contain enough information for audit and resume.

### Rule 4

Every verification-facing object must distinguish:

- pass
- fail but retryable
- fail and requires replan
- blocked and requires human input

### Rule 5

UI concerns must not leak into runtime state except through explicit view-safe fields.

---

## Core Contracts

### `GoalSpec`

Purpose:

- normalize a user goal from the local UI into a runtime-safe objective

Required fields:

- `goal_id`
- `thread_id`
- `raw_input`
- `normalized_goal`
- `goal_type`
- `constraints`
- `success_criteria`
- `risk_level`
- `created_at_ms`
- `updated_at_ms`

Suggested shape:

```json
{
  "goal_id": "goal-uuid-or-stable-id",
  "thread_id": "thread-uuid-or-stable-id",
  "raw_input": "/goal make onboarding flow production ready",
  "normalized_goal": "Make onboarding flow production ready",
  "goal_type": "delivery",
  "constraints": [
    "Preserve existing auth flow",
    "Do not widen scope beyond onboarding"
  ],
  "success_criteria": [
    "Onboarding flow works end to end",
    "Regression checks pass"
  ],
  "risk_level": "medium",
  "created_at_ms": 0,
  "updated_at_ms": 0
}
```

Notes:

- `goal_type` may start with a small enum:
  - `delivery`
  - `bugfix`
  - `analysis`
  - `migration`
- `risk_level` should stay simple:
  - `low`
  - `medium`
  - `high`

---

### `GoalAnalysis`

Purpose:

- capture the result of the initial analysis step before planning

Required fields:

- `goal_id`
- `summary`
- `scope_in`
- `scope_out`
- `repo_signals`
- `unknowns`
- `recommended_next_action`
- `created_at_ms`

Suggested shape:

```json
{
  "goal_id": "goal-1",
  "summary": "Goal affects onboarding UI and backend validation path.",
  "scope_in": [
    "Onboarding screens",
    "Validation and submit flow"
  ],
  "scope_out": [
    "Auth redesign",
    "Unrelated dashboard changes"
  ],
  "repo_signals": [
    "src/app/onboarding",
    "src/server/validation"
  ],
  "unknowns": [
    "Missing final acceptance text from product"
  ],
  "recommended_next_action": "create_plan",
  "created_at_ms": 0
}
```

---

### `ExecutionPlan`

Purpose:

- define the approved work shape before execution

Required fields:

- `plan_id`
- `goal_id`
- `title`
- `summary`
- `phases`
- `tasks`
- `dependencies`
- `acceptance_criteria`
- `verification_strategy`
- `status`
- `created_at_ms`
- `updated_at_ms`

Suggested shape:

```json
{
  "plan_id": "plan-1",
  "goal_id": "goal-1",
  "title": "Onboarding hardening plan",
  "summary": "Plan to analyze, patch, verify, and finalize onboarding flow.",
  "phases": [
    "analysis",
    "implementation",
    "verification"
  ],
  "tasks": [
    "task-1",
    "task-2"
  ],
  "dependencies": [
    {
      "from": "task-1",
      "to": "task-2"
    }
  ],
  "acceptance_criteria": [
    "End-to-end onboarding path works",
    "Regression suite passes"
  ],
  "verification_strategy": [
    "Run targeted tests",
    "Run repo doctor",
    "Run package checks"
  ],
  "status": "draft",
  "created_at_ms": 0,
  "updated_at_ms": 0
}
```

Allowed `status` values:

- `draft`
- `verified`
- `rejected`
- `superseded`

---

### `TaskTicket`

Purpose:

- represent the smallest safe unit of execution

Required fields:

- `task_id`
- `plan_id`
- `phase`
- `title`
- `objective`
- `input_context`
- `action_type`
- `constraints`
- `expected_output`
- `validation_commands`
- `done_criteria`
- `rollback_strategy`
- `status`
- `attempt_count`
- `created_at_ms`
- `updated_at_ms`

Suggested shape:

```json
{
  "task_id": "task-1",
  "plan_id": "plan-1",
  "phase": "implementation",
  "title": "Patch onboarding validation",
  "objective": "Fix onboarding validation mismatch without changing auth flow.",
  "input_context": [
    "src/app/onboarding/form.tsx",
    "src/server/validation/onboarding.ts"
  ],
  "action_type": "code_change",
  "constraints": [
    "Do not widen scope",
    "Keep patch minimal"
  ],
  "expected_output": "Validation path is aligned across UI and backend.",
  "validation_commands": [
    "pnpm test onboarding",
    "pnpm lint"
  ],
  "done_criteria": [
    "Tests pass",
    "No regression in auth flow"
  ],
  "rollback_strategy": "Revert onboarding validation patch only.",
  "status": "pending",
  "attempt_count": 0,
  "created_at_ms": 0,
  "updated_at_ms": 0
}
```

Allowed `action_type` values:

- `analysis`
- `code_change`
- `test_run`
- `verification`
- `git_operation`
- `reporting`

Allowed `status` values:

- `pending`
- `ready`
- `running`
- `verifying`
- `completed`
- `failed`
- `blocked`
- `skipped`

---

### `VerificationResult`

Purpose:

- describe whether a task result is acceptable and what happens next

Required fields:

- `verification_id`
- `task_id`
- `ok`
- `decision`
- `findings`
- `evidence`
- `retryable`
- `needs_replan`
- `requires_human`
- `created_at_ms`

Suggested shape:

```json
{
  "verification_id": "verify-1",
  "task_id": "task-1",
  "ok": false,
  "decision": "retry",
  "findings": [
    "Targeted tests still fail for one edge case"
  ],
  "evidence": [
    "pnpm test onboarding => 1 failing test"
  ],
  "retryable": true,
  "needs_replan": false,
  "requires_human": false,
  "created_at_ms": 0
}
```

Allowed `decision` values:

- `accept`
- `retry`
- `repair`
- `replan`
- `block_for_human`

---

### `RunState`

Purpose:

- hold the entire goal execution state for LangGraph and the local UI

Required fields:

- `run_id`
- `thread_id`
- `goal_spec`
- `goal_analysis`
- `plan`
- `task_queue`
- `current_task_id`
- `current_phase`
- `completed_tasks`
- `failed_tasks`
- `verification_results`
- `artifacts`
- `audit_events`
- `status`
- `created_at_ms`
- `updated_at_ms`

Suggested shape:

```json
{
  "run_id": "run-1",
  "thread_id": "thread-1",
  "goal_spec": "goal-1",
  "goal_analysis": "analysis-1",
  "plan": "plan-1",
  "task_queue": [
    "task-1",
    "task-2"
  ],
  "current_task_id": "task-1",
  "current_phase": "implementation",
  "completed_tasks": [],
  "failed_tasks": [],
  "verification_results": [],
  "artifacts": [],
  "audit_events": [],
  "status": "running",
  "created_at_ms": 0,
  "updated_at_ms": 0
}
```

Allowed `status` values:

- `idle`
- `analyzing`
- `planning`
- `verifying_plan`
- `decomposing`
- `running`
- `verifying_task`
- `repairing`
- `blocked`
- `completed`
- `failed`
- `aborted`

---

### `AuditEvent`

Purpose:

- persist an auditable event stream for timeline, resume, and incident review

Required fields:

- `event_id`
- `run_id`
- `event_type`
- `summary`
- `payload`
- `created_at_ms`

Suggested shape:

```json
{
  "event_id": "evt-1",
  "run_id": "run-1",
  "event_type": "task_started",
  "summary": "Started task task-1",
  "payload": {
    "task_id": "task-1"
  },
  "created_at_ms": 0
}
```

---

## Harness Contracts

The harness layer should consume and produce explicit contracts too.

### `PreflightReport`

Purpose:

- block execution before the graph enters implementation

Required fields:

- `run_id`
- `ok`
- `checks`
- `blocking_findings`
- `warnings`

### `PlanVerificationReport`

Purpose:

- decide whether a plan can move into decomposition/execution

Required fields:

- `plan_id`
- `ok`
- `checks`
- `repair_hints`

### `TaskExecutionReport`

Purpose:

- record command-level execution detail for a task

Required fields:

- `task_id`
- `ok`
- `command_results`
- `artifacts`
- `created_at_ms`

---

## UI Shell Assumptions

These assumptions are deliberately explicit so the local web UI does not drift from runtime design.

### Stack assumptions

- local web UI
- `shadcn/ui` latest as component foundation
- design system wrappers may be added on top
- no terminal UI assumption

### Core screens

- goal thread view
- run timeline view
- task detail panel
- verification panel
- approvals and controls panel
- run history list

### UI state requirements

The local UI must be able to render:

- current goal
- current phase
- current task
- verification decision
- retry / replan / blocked state
- final completion summary

### UI controls

The UI must support:

- create `/goal`
- inspect plan
- approve plan
- interrupt run
- resume run
- retry failed task
- force replan
- inspect evidence

### UI must not assume

- a single linear message stream is enough
- all failures are recoverable without human input
- every goal immediately becomes executable
- command output text is the only debugging source

---

## LangGraph Node IO

Each LangGraph node should operate on a small, explicit slice of `RunState`.

### Node: `goal_intake`

Input:

- raw user message

Output:

- `GoalSpec`

### Node: `analyze_goal`

Input:

- `GoalSpec`
- repository context

Output:

- `GoalAnalysis`

### Node: `create_plan`

Input:

- `GoalSpec`
- `GoalAnalysis`

Output:

- `ExecutionPlan`

### Node: `verify_plan`

Input:

- `ExecutionPlan`

Output:

- `PlanVerificationReport`

### Node: `decompose_tasks`

Input:

- verified `ExecutionPlan`

Output:

- `TaskTicket[]`

### Node: `execute_task`

Input:

- `TaskTicket`
- current repo/runtime context

Output:

- `TaskExecutionReport`

### Node: `verify_task`

Input:

- `TaskExecutionReport`

Output:

- `VerificationResult`

### Node: `repair_or_replan`

Input:

- `VerificationResult`

Output:

- retry decision
- task patch decision
- or plan regeneration signal

### Node: `finalize_goal`

Input:

- terminal `RunState`

Output:

- final summary
- evidence rollup
- completion or blocked report

---

## Compatibility Guidance

### Runtime versioning

Each persisted object should eventually carry:

- `schema_version`

This allows controlled migration of:

- stored run state
- task records
- UI hydration payloads

### Migration policy

- adding optional fields is allowed without major version bump
- renaming or removing fields requires a new schema version
- UI should branch on schema version where needed

---

## Approval Checklist

Review should confirm:

1. these contracts are sufficient for the local UI
2. these contracts are sufficient for LangGraph state transitions
3. these contracts are sufficient for harness governance
4. `RunState` is the central persisted runtime object
5. `TaskTicket` is the minimum execution unit
6. UI remains local web UI with `shadcn/ui`

---

## Next Step After Approval

If approved, the next implementation step is:

- scaffold the new local web app shell
- define the initial LangGraph node skeleton around these contracts
- keep current CLI as support tooling only
