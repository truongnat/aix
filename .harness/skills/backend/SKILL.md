---
id: backend
name: Backend Domain Skill
status: draft
scope: domain
version: 1
can_block: false
can_write: false
inputs:
  - target service boundary
  - expected contract change
  - data or auth constraints
outputs:
  - selected domain guidance
  - generated harness profile entries
tools:
  - harness-map
  - harness-discuss
  - harness-plan
  - harness-verify
---

# Backend Domain Skill

## Purpose

Route API, service, and persistence work toward contract-safe checks.

## When To Use

- API endpoints, request handling, business logic, or persistence changes
- auth boundaries, queues, jobs, and data consistency work
- service-side contract changes with side effects

## When Not To Use

- UI-only work
- docs-only edits
- infrastructure changes without application logic

## Inputs

- target service boundary
- expected contract change
- data or auth constraints

## Workflow

- map the affected handlers, services, and persistence boundary
- choose tests that exercise the contract instead of only happy paths
- treat migrations and idempotency as first-class verification items
- capture root cause and reusable commands after shipping

## Operating Principles

- Prefer the backend pack as the routing aid for this repository.
- Keep the generated surface small and reviewable.
- Do not generate a domain skill when the stack signal is weak or absent.

## Reasoning Procedure

- start from the request/response contract and work inward
- verify durability and error handling where state changes
- prefer integration checks for boundaries that can drift silently

## Action Loop

- inspect the request path and storage boundary
- narrow the change set before implementation
- run focused contract or integration tests
- record any rollback or migration notes explicitly

## Examples

- new API endpoint -> backend domain skill with migration and auth checks
- job queue bug -> backend domain skill with idempotency verification

## Output Contract

- record selected backend signals in the project config and skills profile
- generate `.harness/skills/backend/` when selected

## Checklist Before Done

- do not generate if the repository has no server-side signals
- do not skip migration or auth checks when the change crosses those boundaries

## Common Failure Modes

- happy-path-only tests: endpoint returns 200 but durable state is wrong
  - Counter: assert the persisted side effect directly
- missing migration: local dev passes but clean environment fails
  - Counter: test on a clean database or explicit migration state
