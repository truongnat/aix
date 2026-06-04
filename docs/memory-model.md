# Memory Model

## Purpose

This document defines the project memory model for `ai-engineering-harness`. It explains how agents should recall and update durable context safely across shared typed memory artifacts and goal-level lessons.

## Core Rules

- Recall before planning.
- Remember after shipping.
- Sanitize before storing.

Memory exists to improve future engineering decisions, not to preserve raw session output.

## Memory Types

### Project Facts

Stable facts about the repository, architecture, delivery model, or operational environment.

### Decisions

Deliberate choices that future work should understand before changing behavior or structure.

### Root Causes

Confirmed explanations for prior failures, regressions, or incidents.

### Reusable Commands

Commands or sequences that repeatedly help verify, debug, or ship work safely.

### Constraints

Rules, approvals, compliance limits, platform boundaries, or project-level operating restrictions.

### Hazards

Known failure modes, risky areas, fragile integrations, and regression-prone paths.

### Open Questions

Important unresolved items that must be revisited before future planning or execution.

## Shared Project Memory

Shared project memory should be typed so command workflows can recall the right context quickly:

### `.harness/DECISIONS.md`

Use for durable project decisions that shape future planning, implementation, or verification.

- architectural choices
- policy decisions
- accepted tradeoffs
- constraints that exist because of a deliberate choice

### `.harness/HAZARDS.md`

Use for recurring risks and fragile areas that should change how future work is mapped, planned, or verified.

- regression-prone paths
- brittle integrations
- confirmed failure modes
- mitigation and verification focus

### `.harness/INDEX.md`

Use for reusable commands, verification recipes, and durable lookup pointers.

- repeatable verification commands
- common debug or inspection commands
- links to important repo docs or memory artifacts
- evidence capture guidance that applies across goals

### `.harness/MEMORY.md`

Use for the memory policy or profile when a repository adopts the harness workflow. This file explains memory boundaries; it should not become the only operational memory sink once typed memory artifacts exist.

## Goal-Level Memory

`.harness/goals/<goal-id>/REMEMBER.md` should hold memory learned from one goal:

- what changed
- what root cause was confirmed
- what verification evidence mattered
- what lesson should influence similar future goals
- what should be promoted to shared project memory

Not every goal-level lesson belongs in shared memory. Only durable, reusable items should move upward.

## Small Repository Mode

For tiny repositories or first-time adoption, start with the lighter guidance in [docs/small-repo-memory.md](small-repo-memory.md).

Use the small-repo mode when one shared `MEMORY.md` plus goal-level `REMEMBER.md` is enough to capture durable lessons safely. As complexity grows, split shared memory into `DECISIONS.md`, `HAZARDS.md`, and `INDEX.md`.

## What Must Never Be Stored

Do not store:

- secrets
- credentials
- API keys
- tokens
- customer data
- private business data
- raw production logs with sensitive details
- copied internal conversations that contain sensitive context

## How Memory Is Used In The Loop

### Map

Read `HAZARDS.md` first when present so known failure modes shape the initial map. Then use `INDEX.md` for lookup pointers and reusable commands.

### Discuss

Use `DECISIONS.md` and `HAZARDS.md` to challenge false assumptions, surface constraints, and identify prior decisions that shape scope.

### Plan

Recall `DECISIONS.md`, `HAZARDS.md`, and `INDEX.md` before writing the plan.

### Run

Use memory as a guardrail against repeating known mistakes or violating prior decisions without approval.

### Verify

Use `INDEX.md` for reusable commands and verification recipes, and use `HAZARDS.md` for regression-prone areas.

### Ship

Reference memory when summarizing what changed, what risks remain, and what future work should know.

### Remember

Promote only durable, sanitized lessons into the right memory artifact:

- `DECISIONS.md` for project-level choices
- `HAZARDS.md` for recurring risks or root-cause patterns
- `INDEX.md` for reusable commands and recipes
- goal-level `REMEMBER.md` for lessons that are still local to the completed goal

## Practical Rule

If a memory entry will help a future agent plan or verify more safely, keep it. If it is transient, sensitive, or only useful to the just-finished session, do not store it.
