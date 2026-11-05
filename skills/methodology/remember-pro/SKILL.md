---
name: remember-pro
description: >-
  Capture durable lessons, architectural decisions, and operational constraints
  into persistent memory and session artifacts. Prevents rediscovery across
  agent sessions. Use after solving tricky bugs, making architectural tradeoffs,
  or finishing major features. Triggers: "remember", "save lesson", "record
  decision", "durable memory".
x-kind: process
x-version: 0.1.0
x-tags: [memory, remember, durable, lessons, decisions]
x-roles: [planner, coder, reviewer, architect]
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# remember-pro

## Purpose

Capture durable lessons, constraints, and decisions that will improve later sessions.

## When To Use

- after completing and verifying meaningful work
- after resolving a tricky tradeoff or root cause
- after resolving a root cause or tricky tradeoff
- when new constraints should shape future decisions

## When Not To Use

- for transient status that will be obsolete soon
- for noisy details that do not help future work
- when the lesson cannot be written safely without exposing sensitive data

## Inputs

- verification and ship artifacts under `.aix/sessions/<session-id>/`
- prior memory notes if present
- the durable lesson, decision, or hazard to preserve

## Workflow

1. Review the goal, plan, verification, and outcome.
2. Identify the durable fact, decision, root cause, or hazard worth keeping.
3. Exclude temporary details, secrets, and private business data.
4. Write concise memory tied to affected areas.
5. If the work produced an approved delta spec, record that the durable spec layer should absorb it when enabled.
6. Confirm the note would help a future session start faster.
7. Save **`REMEMBER.md`** to `.aix/sessions/<session-id>/REMEMBER.md` (see [session artifacts contract](../../_shared/session-artifacts-contract.md)).
8. Save a durable memory record to **`.aix/runtime/memory/<id>.md`** (or run `aix memory push "<title>" "<body>" --tags "<tags>"`) so subsequent sessions can search and reuse this lesson before starting new tasks.

## Operating Principles

- Memory should reduce rediscovery.
- Durable decisions beat narrative history.
- Short, precise memory loads faster.
- Record constraints that are easy to forget but costly to miss.

## Reasoning Procedure

1. Restate the durable lesson and why it matters later.
2. Check that the lesson is stable, reusable, and safe to store.
3. Convert it into a short memory entry with references.
4. Stop and report blocked if the lesson would capture sensitive data.

## Action Loop

- Thought: identify the durable decision or hazard worth keeping.
- Action: inspect the evidence and draft the memory entry.
- Observation: verify the entry is factual, scoped, and sanitized.
- Repeat until the lesson is ready to record.

## Examples

### Example 1

Input: Repeated validation failures showed a missing heading requirement.

Output:
- Remember note: add the heading to the validator before relying on the doc surface.
- Durable decision: required metadata must be enforced by packages/registry/src/schema.ts.
- Affected-area references: packages/registry/src/schema.ts, packages/registry/src/registry.ts.

### Example 2

Input: Recording the lesson would require secrets or private data.

Output:
- Blocked: unsafe to store in memory.
- Needed next step: summarize the pattern without sensitive details.

## Output Contract

This skill must produce:

- **`REMEMBER.md`** under `.aix/sessions/<session-id>/` recording durable decisions, lessons, and hazards
- A durable memory record in **`.aix/runtime/memory/<id>.md`** (or via `aix memory push "<title>" "<body>" --tags "<tags>"`) for future sessions to discover
## Common Failure Modes

- saving transient execution chatter
- storing secrets or sensitive business details
- writing a lesson before verifying whether it is durable

## Checklist Before Done

- [ ] The memory is durable
- [ ] Transient noise was removed
- [ ] The affected area is clear
- [ ] The note helps future work
- [ ] No secrets or private business data are stored
