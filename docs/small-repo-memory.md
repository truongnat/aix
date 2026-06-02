# Small Repo Memory

## Purpose

This guide explains the minimum useful memory surface for tiny repositories and first-time harness adopters.

## When To Use

Use this mode when:

- the repository is very small
- the team is just learning the harness
- the work surface is narrow enough that a large memory structure would be noise
- you still want durable lessons and safety boundaries without heavy artifact overhead

## Minimal Memory Surface

For a small repository, start with:

- `.harness/MEMORY.md`
- goal-level `.harness/goals/<goal-id>/REMEMBER.md`

Do not create many memory subfiles yet.

Record only durable, reusable lessons.

## Recommended `MEMORY.md` Shape

Keep shared memory short and practical:

- project facts
- decisions
- constraints
- hazards
- reusable commands
- open questions

If the file starts filling with session noise, logs, or one-off details, it has become too large for small-repo mode.

## What To Remember

- project facts that affect future work
- decisions that should not be re-litigated
- root causes of bugs
- reusable commands
- constraints and hazards
- open questions that affect planning

## What Not To Remember

- secrets
- credentials
- tokens
- private customer data
- raw logs
- temporary thoughts
- one-off implementation noise

## Tiny Repo Examples

Useful small-repo memory entries:

- "The repo uses a single lightweight feature workflow and expects human review before ship."
- "Use `node validate.js --target ../my-project --profile-only` after editing profile artifacts."
- "Guest session behavior must not change during health-check work."

## Safety Rules

- store only durable and sanitized lessons
- keep secrets and private data out of all memory artifacts
- summarize logs instead of copying them
- review memory artifacts before commit

## When To Grow Beyond This

Add more memory structure only when:

- multiple goals are creating repeated reusable lessons
- the project has enough stable architecture facts to justify richer shared memory
- a single `MEMORY.md` no longer stays concise and useful

## Relationship To `docs/memory-model.md`

Use [docs/memory-model.md](memory-model.md) for the full memory model.

Use this guide as the lighter starting mode for tiny repositories. It narrows the memory surface, but it does not weaken the core safety rules.
