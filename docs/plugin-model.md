# Plugin Model

## Purpose

Clarify what it means for `ai-engineering-harness` to behave like a plugin-like markdown capability pack for AI coding agents.

## What Plugin-Like Means

Plugin-like means the harness is consumed as a reusable operating surface rather than treated as the user's product repository.

The canonical source stays here, but agents should load or copy the relevant harness artifacts into the repository where product work actually happens.

## What Plugin-Like Does Not Mean

It does not mean:

- a compiled runtime plugin
- a server-side integration
- a package manager release artifact today
- a marketplace automation flow today
- a requirement to work inside this repository as if it were the user's app

## Consumption Modes

Current and future consumption modes can include:

- local install or copy into a target repo
- vendored harness directory inside a target repo
- global agent capability folder
- release archive
- future package or plugin registry

## Recommended Current Mode

Recommended current mode:

- use this repository as the canonical source
- install or copy the operating surface into a target repository
- validate profile and goal artifacts there
- do not treat this harness repository as the working app repository

Plugin-like consumption depends on a clear installed surface contract so agents know exactly what belongs in the target repository.

See also:

- [docs/consumption-modes.md](consumption-modes.md)
- [docs/consume-as-pack.md](consume-as-pack.md)
- [docs/installed-surface-contract.md](installed-surface-contract.md)

## Future Modes

Possible later modes:

- cleaner vendoring conventions
- release archives optimized for adoption
- optional plugin or package registry distribution

These are distribution concerns, not runtime-platform goals.

## Runtime Boundaries

- no runtime adapters yet
- no server-side orchestration
- no database-backed state
- no semantic application validation

## Safety Boundaries

- keep markdown as the source of truth
- copy only the operating surface needed by the target repository
- do not persist secrets or private business data in harness artifacts
- avoid turning distribution into heavy automation before the model is proven

## Relationship To Superpowers / GSD Style Usage

The intended feel is closer to a reusable superpower pack or agent capability pack than to a standalone product framework.

Agents should be able to consume the harness as discipline, process, templates, and validation guidance inside an existing workflow.

## Frozen Source-Target Boundary

v1.0.0-stable source pack vs target repository boundaries are recorded in [frozen-source-target-boundary-contract.md](frozen-source-target-boundary-contract.md).
