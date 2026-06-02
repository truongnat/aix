# Frozen Runtime Consumption Contract

## Purpose

Record how AI coding runtimes consume the capability pack for `v1.0.0` as part of `v0.9.0` Stable Contract Freeze.

## Contract Status

**Frozen for v1.0.0** (v0.9.0 Step 5).

## Runtime Consumption Model

Runtime consumption means an agent uses the **installed harness surface** and **target `.harness/` artifacts** as operating context while working in the **target repository**.

It does **not** mean compiled plugins, runtime adapters, or server integrations.

## Source Pack

- this repository is the **canonical pack source**
- authors commands, skills, workflows, patterns, templates, docs, `install.js`, `validate.js`, and `PACK.md`
- not the product work tree

## Target Repository

- the **product work tree** where application code and delivery happen
- receives the [frozen installed surface](frozen-installed-surface-contract.md) via `install.js` or manual copy
- owns `.harness/` profile and goal artifacts

## Runtime

- the agent tool (Claude Code, Cursor, Codex, Gemini CLI, OpenCode, or similar)
- reads installed surface + `.harness/` from the target repo
- follows docs-only guidance under `docs/runtimes/`

## Required Runtime Read-First Surface

Inside the target repository, agents should read as needed:

- `AGENTS.md`
- installed `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`
- `.harness/` profile artifacts
- `.harness/goals/<goal-id>/` when a goal is active
- installed adoption docs (for example `docs/adoption-guide.md`, `docs/target-repo-validation.md`)

## Supported Runtime Guides

v1.0.0 documents consumption for:

- [Claude Code](runtimes/claude-code.md)
- [Cursor](runtimes/cursor.md)
- [Codex](runtimes/codex.md)
- [Gemini CLI](runtimes/gemini-cli.md)
- [OpenCode](runtimes/opencode.md)

See also [runtimes/comparison.md](runtimes/comparison.md) and [runtimes/README.md](runtimes/README.md).

## What Is Guaranteed

- docs-only runtime guidance (no adapter code in v1 contract)
- target repo is where agents operate day to day
- structural validation from source pack per [frozen validation contract](frozen-validation-contract.md)
- markdown remains the source of truth

## What Is Not Guaranteed

- runtime adapters, plugins, or MCP bridges as part of v1.0.0
- global capability folder standard across all tools
- identical feature parity across runtimes
- validation proving application correctness

## Allowed Additive Changes

- new runtime guide docs if additive
- comparison table rows and wording clarifications
- cross-links to frozen contracts

## Breaking Changes

See [breaking-change-policy.md](breaking-change-policy.md).

Breaking for this contract:

- requiring runtime adapters for documented v1 consumption
- documenting product work in the source pack as the default workflow

## Relationship To runtime-consumption-model.md

[runtime-consumption-model.md](runtime-consumption-model.md) explains the model. This document is the **freeze record** for v1.0.0.

## Relationship To runtimes/

[docs/runtimes/](runtimes/) holds per-runtime guides. They must stay consistent with this contract (target repo + installed surface + `.harness/`).

## Relationship To consume-as-pack.md

[consume-as-pack.md](consume-as-pack.md) is the short adoption flow. It must respect the [frozen source-target boundary](frozen-source-target-boundary-contract.md).

## v1.0.0 Notes

- install → profile → goal → validate from source pack
- no runtime plugins in scope; adapters are post-v1 optional work
