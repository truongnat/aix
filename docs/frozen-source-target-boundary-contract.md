# Frozen Source Pack vs Target Repo Boundary Contract

## Purpose

Record the boundary between the harness **source pack** and **target repository** for `v1.0.0`.

## Contract Status

**Frozen for v1.0.0** (v0.9.0 Step 5).

## Source Pack Responsibilities

This repository (`ai-engineering-harness`) is the canonical source pack. It owns:

- `AGENTS.md` template contract for the pack (source copy)
- `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`
- adoption, validation, runtime, packaging, and release documentation
- `install.js`, `validate.js`, `PACK.md`
- examples and dogfood evidence (not the installed layout for product repos)
- structural self-validation: `node validate.js`

The source pack is **not** the product repository.

## Target Repo Responsibilities

The target repository is where product work happens. It owns:

- application or product source code
- installed harness operating surface (subset from source pack)
- `.harness/` profile artifacts
- `.harness/goals/<goal-id>/` goal artifacts
- project-specific harness state and decisions

## Installed Surface Boundary

- target receives the [frozen default installed surface](frozen-installed-surface-contract.md) via `install.js` or manual copy
- not a full mirror of the source repository
- `PACK.md` and `validate.js` are **not** in default install

## Product Work Boundary

- implementation, features, bugs, and ship evidence live in the **target** repo
- confusing the source pack for the product repo is a **bug or documentation issue**, not a supported workflow

## Validation Boundary

- target structural validation runs from the **source pack** with:

```bash
node validate.js --target <path> --profile-only
node validate.js --target <path> --goal <goal-id>
```

See [frozen validation contract](frozen-validation-contract.md).

## Packaging Boundary

- versioning, `PACK.md`, release archives, and verification checklists are **source pack** maintainer concerns
- target repos consume released or installed surfaces; they do not author the pack manifest

See [frozen packaging and release contract](frozen-packaging-release-contract.md).

## What Is Guaranteed

- clear separation: source = pack authoring; target = product + adopted harness
- install copies operating surface; profile and goals are created in target `.harness/`
- runtime consumption uses target repo artifacts per [frozen runtime consumption contract](frozen-runtime-consumption-contract.md)

## What Is Not Guaranteed

- a global plugin registry or standard vendoring path for all teams
- target repos hosting pack maintenance docs by default
- automatic sync between source examples and target `.harness/` without mapping ([harness-example-to-target-layout.md](harness-example-to-target-layout.md))

## Allowed Additive Changes

- clearer docs and diagrams
- optional team choice to vendor `PACK.md` or `validate.js` into a target (not default)

## Breaking Changes

See [breaking-change-policy.md](breaking-change-policy.md).

Breaking for this contract:

- moving product work or required `.harness/` authoring into the source pack as default
- requiring target repos to be forks of the harness repository
- changing validation to require target-local `validate.js` without migration

## Relationship To TARGET.md

[TARGET.md](../TARGET.md) states product intent for the harness system. This contract operationalizes source vs target for adopters.

## Relationship To plugin-model.md

[plugin-model.md](plugin-model.md) explains plugin-like consumption. This contract is the v1.0.0 boundary freeze.

## Relationship To distribution-model.md

[distribution-model.md](distribution-model.md) explains distribution concepts. Installed surface and target artifacts follow this boundary.

## v1.0.0 Notes

- dogfood used external target repos with source-pack validation — matches this contract
- any doc that implies “work in the harness repo as your app” should be corrected, not treated as a new workflow
