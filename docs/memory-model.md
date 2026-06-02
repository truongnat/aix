# Memory Model

## Purpose

This document defines the project memory model for `ai-engineering-harness`. It extends memory beyond a single `REMEMBER.md` note and explains how agents should recall and update durable context safely.

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

`.harness/MEMORY.md` should hold durable memory that applies across goals:

- stable project facts
- recurring constraints
- repeated hazards
- durable decisions
- reusable verification or debug commands
- important open questions that affect multiple goals

This file should be concise, sanitized, and worth reading before planning.

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

Use the small-repo mode when one shared `MEMORY.md` plus goal-level `REMEMBER.md` is enough to capture durable lessons safely.

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

Read shared memory first to identify known architecture facts, hazards, and prior root causes before exploring the repo.

### Discuss

Use memory to challenge false assumptions, surface constraints, and identify prior decisions that shape scope.

### Plan

Recall relevant project facts, hazards, decisions, and reusable commands before writing the plan.

### Run

Use memory as a guardrail against repeating known mistakes or violating prior decisions without approval.

### Verify

Use reusable commands, known regression areas, and historical hazards to shape verification depth.

### Ship

Reference memory when summarizing what changed, what risks remain, and what future work should know.

### Remember

Promote only durable, sanitized lessons into memory artifacts. Leave ephemeral session detail out.

## Practical Rule

If a memory entry will help a future agent plan or verify more safely, keep it. If it is transient, sensitive, or only useful to the just-finished session, do not store it.
