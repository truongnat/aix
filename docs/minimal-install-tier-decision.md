# Minimal Install Tier Decision

## Purpose

Record the v0.9.0 decision on whether to implement a minimal install tier before `v1.0.0`.

## Dogfood Evidence

From `v0.8.0` Scenario A and B:

- default `bin/aih.js install` copies approximately 83 paths successfully
- tiny and mobile skeleton repos both completed install → profile → goal → validation
- friction log rated large install surface as **low** severity, not blocking
- follow-up backlog listed minimal install as v0.9 contract candidate, not v1 blocker
- no v1 blockers found in either scenario

## Decision

**Do not implement a minimal install tier before `v1.0.0`.**

The default installed surface remains the only supported install contract for v1.

This decision supports freezing one default installed surface in [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md) for v1.0.0.

## Rationale

- default install works end-to-end in dogfood evidence
- introducing tiers before v1 adds contract branching (`full` vs `minimal`) without a proven adoption failure
- `bin/aih.js install` and [installed-surface-contract.md](installed-surface-contract.md) are easier to freeze with one default surface
- minimal tier can be designed post-v1 with explicit breaking-change and migration policy if still needed

## Consequences

- v0.9.0 freezes current `exportPaths` as the installed surface contract
- tiny-repo adopters may install more files than strictly necessary; optional docs remain optional in contract sense but are still copied by default install today
- future minimal tier must be a **major** or explicitly versioned extension with migration docs, not a silent shrink

## Future Revisit Criteria

Revisit minimal install tier when **all** are true:

- repeated dogfood or user evidence that ~83 paths blocks adoption
- a documented `minimal` path list maintained alongside `exportPaths`
- validator or manifest story for which tier was installed
- breaking-change policy updated for tier selection

Until then, classify as **post-v1 optional** or **v1.x candidate**, not a v1.0.0 requirement.
