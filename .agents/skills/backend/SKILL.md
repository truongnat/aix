---
name: "Backend Domain Skill"
description: "Route API, service, and persistence work toward contract-safe checks."
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

## Checklist Before Done

- do not generate if the repository has no server-side signals
- do not skip migration or auth checks when the change crosses those boundaries
