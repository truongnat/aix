# Memory Profile

## Purpose

Describe what long-lived memory this repository should retain.

## Current Status

- Status: draft
- Storage model: markdown files in `.harness/`

## Recall Before Planning

- Relevant entries in `DECISIONS.md`
- Known regression areas in `HAZARDS.md`
- Reusable commands in `INDEX.md`
- Active session remember notes if the current goal is a continuation

## Remember After Shipping

- Root causes worth reusing
- Verification recipes that saved time
- Project-level decisions that affect future plans
- Hazards that should change planning or verification next time
- Approved delta specs that should be promoted into `.harness/specs/` when enabled
- Delegated worker observations that should be compacted into `.harness/memory/workers/<agent>.md` when enabled

## Memory Types

| Artifact | Stores | When to update |
| --- | --- | --- |
| `DECISIONS.md` | durable project decisions | after approval |
| `HAZARDS.md` | recurring failure modes | after confirmed incident or review |
| `INDEX.md` | reusable commands and references | after a repeatable workflow is proven |
| `.harness/specs/` | optional durable behavior specs | after approved delta-spec changes |
| `.harness/memory/workers/<agent>.md` | optional delegated-worker notes | after enabled worker runs |
| `REMEMBER.md` | goal-level lessons | after shipping verified work |

## Forbidden Content

- Secrets, credentials, tokens
- Customer data or private business data
- One-off notes that belong only in a local scratchpad
- Temporary task status that belongs in active session artifacts

## Human Review

List borderline memory items that may need promotion or deletion.

## Example Entry

- Lesson: release-facing doc changes must update validator assertions in the same patch
- Why it matters: docs can drift silently while tests stay green
- Where to store it: promote to `INDEX.md` if repeated across multiple goals
- Verification impact: run `node bin/validate.js` whenever docs or templates move
