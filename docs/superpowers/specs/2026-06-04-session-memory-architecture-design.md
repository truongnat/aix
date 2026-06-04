# Session Memory Architecture Design

## Summary

This design introduces a session-based `.harness` memory architecture for `ai-engineering-harness`.

The current flat `.harness` layout does not scale well across multiple goals, multiple planning iterations, or long-running work. The new design makes sessions the owner of working artifacts while keeping the root `.harness` directory as an index and routing layer.

This document covers `v0.12.0 Step 3A` only:

- file-based session memory as the default
- strict session ownership of working artifacts
- root `.harness` as router and durable entrypoint
- migration guidance for legacy flat layouts

Optional graph memory remains out of implementation scope for this step.

## Goals

- Make file-based session memory the default and source of truth.
- Ensure each major workstream has its own session folder and working artifacts.
- Keep root `.harness` small, explicit, and machine-readable.
- Remove the assumption that active work lives in flat root files such as `.harness/PLAN.md`.
- Preserve backward compatibility through explicit migration guidance instead of silent fallback behavior.

## Non-Goals

- Do not require Neo4j or any graph backend.
- Do not make graph memory authoritative.
- Do not silently migrate or delete legacy artifacts.
- Do not keep dual active sources of truth between root files and session files.
- Do not expand this step into full graph sync or heavy memory infrastructure.

## Core Principles

- Root `.harness` is an index and router.
- Sessions own working artifacts.
- Files are the source of truth.
- Durable memory is promoted intentionally, not implicitly.
- Ambiguous state must block rather than guess.

## Proposed `.harness` Structure

```txt
.harness/
  INDEX.md
  STATE.md
  MEMORY.md
  TOOL_CONTEXT.md
  config.json

  sessions/
    YYYY-MM-DD-short-title/
      SESSION.md
      GOAL.md
      DISCUSSION.md
      PLAN-001.md
      TASKS.md
      VERIFY.md
      SHIP.md
      REMEMBER.md
      BLOCKED.md
      NOTES.md
      artifacts/

  decisions/
    DEC-0001-title.md

  hazards/
    HAZ-0001-title.md

  memory/
    project.md
    conventions.md
    provider-support.md
    command-surface.md
    known-problems.md
```

## Root Artifact Roles

### `INDEX.md`

The primary agent entrypoint for memory navigation.

Responsibilities:

- define read order
- point to the active session
- point to durable memory areas
- document that working state belongs under `sessions/`

### `STATE.md`

The machine-readable router for active work.

Responsibilities:

- identify the active session
- identify current phase and current command
- identify the current active plan file
- expose blocked state explicitly

Proposed fields:

```md
# Harness State

## Active Session

session: sessions/2026-06-04-session-memory-architecture

## Current Phase

phase: plan

## Current Command

command: harness-plan

## Current Plan

current_plan: PLAN-001.md

## Blocked

blocked: false
blocked_file:
```

### `MEMORY.md`

Short durable memory summary for the project.

Responsibilities:

- summarize high-value reusable lessons
- point to topic memory, decisions, and hazards
- remain small enough to read early

### `TOOL_CONTEXT.md`

Repository-local snapshot of detected tools and routing guidance.

### `config.json`

Memory configuration for the harness.

Proposed default:

```json
{
  "memory": {
    "backend": "files",
    "sessionStrategy": "date-title",
    "sourceOfTruth": "files",
    "graph": {
      "enabled": false,
      "provider": "neo4j",
      "uriEnv": "NEO4J_URI",
      "userEnv": "NEO4J_USER",
      "passwordEnv": "NEO4J_PASSWORD"
    }
  }
}
```

## Session Identity

Session folders use:

```txt
YYYY-MM-DD-short-title
```

Rules:

- lowercase only
- hyphen-separated
- punctuation stripped
- max 60 chars
- title derived from user goal or request
- append `-01`, `-02`, and so on if collisions occur

Examples:

```txt
2026-06-04-tool-discovery-routing
2026-06-04-session-memory-architecture
2026-06-04-session-memory-architecture-01
```

## Session Artifact Set

Each session owns the working artifacts for one active workstream.

### `SESSION.md`

Session metadata and canonical links.

Suggested fields:

- session id
- title
- status
- started at
- current phase
- current command
- summary
- links to goal, current plan, tasks, and verify

### `GOAL.md`

Defines the problem, desired outcome, and acceptance criteria for the session.

### `DISCUSSION.md`

Captures active discussion, unresolved questions, and design tradeoffs for the session.

### `PLAN-001.md`

The first concrete session plan. Later revisions can become `PLAN-002.md`, `PLAN-003.md`, and so on.

### `TASKS.md`

Tracks session-local execution status.

### `VERIFY.md`

Stores fresh session-local evidence.

### `SHIP.md`

Stores session-local handoff summary.

### `REMEMBER.md`

Stores session-local lessons before promotion to durable memory.

### `BLOCKED.md`

Stores explicit blockers for the active session.

### `NOTES.md`

Stores temporary but useful session-local notes that are not yet durable memory.

### `artifacts/`

Stores supporting outputs such as:

- diff review notes
- command output logs
- exported tool discovery snapshots

## Command Behavior Changes

### `harness-start`

This command becomes the primary session router.

Required behavior:

1. Read `.harness/INDEX.md`
2. Read `.harness/STATE.md`
3. Detect whether an active session exists
4. Compare current request with the active session summary
5. Decide whether to:
   - continue the active session
   - start a new session
   - archive the old session and start a new one
6. Update `STATE.md`
7. Update `INDEX.md`
8. Ensure required session artifacts exist

If the current request does not clearly belong to the active session, the command must stop and ask the user which routing action to take.

### Workflow Commands

All workflow commands must resolve artifacts through `STATE.md`.

They must no longer assume flat root files such as:

- `.harness/GOAL.md`
- `.harness/PLAN.md`
- `.harness/TASKS.md`
- `.harness/VERIFY.md`

Instead they must resolve:

```txt
.harness/sessions/<active-session>/<artifact>
```

Examples:

- `harness-map`
  - reads root router plus active session
  - writes active session discussion or notes

- `harness-plan`
  - writes `PLAN-001.md`, `PLAN-002.md`, and so on
  - updates `current_plan` in `STATE.md`

- `harness-run`
  - reads active session plan, goal, and tasks
  - updates session-local task and execution state

- `harness-verify`
  - writes active session `VERIFY.md`

- `harness-ship`
  - writes active session `SHIP.md`

- `harness-remember`
  - writes active session `REMEMBER.md`
  - may promote durable lessons to `memory/`, `decisions/`, or `hazards/`

## Strict Source Of Truth Rules

- Root `.harness` does not hold active working artifacts.
- Active working artifacts live only under the active session.
- `STATE.md` is the only router for active session resolution.
- If both flat active artifacts and session artifacts appear to be active, commands must block due to ambiguity.

## Legacy Flat Layout Handling

Legacy flat layout means files such as:

- `.harness/GOAL.md`
- `.harness/PLAN.md`
- `.harness/TASKS.md`
- `.harness/VERIFY.md`

### Required Behavior

- detect legacy flat layout explicitly
- do not silently continue as if it were session-based
- do not silently delete or overwrite legacy files
- offer migration into a session folder
- preserve originals under `.harness/legacy/`

### Migration Flow

1. Detect flat artifacts in root
2. Create new session id
3. Create `.harness/legacy/<timestamp>/`
4. Preserve the original flat artifacts there
5. Create the new session folder
6. Copy or move migrated working artifacts into the session folder
7. Write `INDEX.md` and `STATE.md` for the new session model
8. Stop if any ambiguity remains

### Blocking Rule

If the system cannot determine a safe migration path, it must block and ask for human confirmation rather than guess.

## Templates Required For 3A

### Root Templates

- `templates/INDEX.md`
- `templates/STATE.md`
- `templates/MEMORY.md`
- `templates/TOOL_CONTEXT.md`
- `templates/harness-config.json`

### Session Templates

- `templates/SESSION.md`
- `templates/GOAL.md`
- `templates/DISCUSSION.md`
- `templates/PLAN.md`
- `templates/TASKS.md`
- `templates/VERIFY.md`
- `templates/SHIP.md`
- `templates/REMEMBER.md`
- `templates/BLOCKED.md`
- `templates/NOTES.md`

### Durable Memory Templates

- `templates/DECISION.md`
- `templates/HAZARD.md`

## Validation Requirements

Validation for 3A must require:

- session-memory templates exist
- root router templates exist
- config template exists and parses as JSON
- session naming rules are documented
- docs explain that files are the source of truth
- docs explain that root `.harness` is a router and index
- docs explain that sessions own working artifacts
- workflow command docs reference active session resolution from `STATE.md`
- templates do not encourage dumping active working state flat at root

## Documentation Required

### `docs/session-memory.md`

Must explain:

- root `.harness` is index and router
- sessions own working artifacts
- files are the source of truth
- durable memory promotion model

### `docs/memory-migration.md`

Must explain:

- how legacy flat layout is detected
- how migration works
- how originals are preserved
- when commands must block instead of guessing

## Scope Boundary For Step 3A

Included:

- session-based file memory structure
- templates
- docs
- validation
- workflow command contract updates
- migration guidance

Not included:

- required Neo4j support
- graph sync implementation
- graph-backed authoritative memory
- heavy memory infrastructure

Possible but optional if effort remains:

- helper for session naming
- lightweight `memory init --backend files`
- lightweight `memory status`

## Risks

- command docs and runtime prompts may drift if session-path rules are not updated consistently
- migration behavior can become ambiguous if flat layout and session layout are both present
- root router files may become bloated if they start collecting working state again

## Recommendation

Implement Step 3A first with strict session ownership and root router behavior.

Defer optional graph memory to a later step as documentation and schema only. This keeps the working model simple, git-friendly, reviewable, and predictable for agents.
