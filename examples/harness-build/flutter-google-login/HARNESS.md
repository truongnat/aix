# Harness Profile

> Do not include credentials, tokens, customer data, or private business data.

## Purpose

Define the project-specific operating model for adding Google login to a Flutter app while preserving guest mode.

## Current Status

- Status: approved example
- Last updated: 2026-06-02
- Owner: demo harness build

## Scope

- Product or system type: Flutter mobile application with optional authenticated experience
- Primary stack: Flutter client with possible backend auth/session boundary
- Delivery model: feature delivery with manual and automated verification
- Risk level: medium because guest and signed-in flows share state boundaries

## Operating Model

- Primary workflow: feature
- Execution model: goal-driven SDLC with explicit task, review, and verification loops
- Primary team pattern: Producer-Reviewer
- Primary skill packs: mobile, backend
- Core skills: using-harness, mapping-codebase, discussing-goals, writing-plans, executing-plans, verification, code-review, remembering
- Quality gate posture: strict for auth, guest flow, and session behavior

## Operating Boundaries

- The harness should guide: planning, implementation scope control, verification, review, and memory for auth-related feature work
- The harness should not manage: provider secret storage, backend redesign beyond approved scope, or runtime orchestration

## Required References

- Team architecture guide: `docs/team-architecture-selection.md`
- Memory model: `docs/memory-model.md`
- SDLC execution model: `docs/sdlc-execution-model.md`
- Quality gates: `docs/quality-gates-matrix.md`

## Assumptions

- [ ] Guest mode already exists and is an accepted product requirement.
- [ ] Google login will attach to existing app navigation rather than replace guest entry.
- [ ] A backend session boundary may need verification even if the UI change is local.

## Unknowns

- [ ] Whether refresh token or backend-issued session rules already exist
- [ ] Whether guest data needs migration on sign-in

## Human Review

- Status: approved example
- Notes: Chosen to demonstrate a bounded harness profile for the north-star scenario.
