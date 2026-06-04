# Installed Surface Contract

## Purpose

Define the deliberate subset of the source repository that should be installed or vendored into a target repository.

## Source Repository

The source repository is the canonical pack source.

It contains:

- authoring docs
- examples
- release notes
- maintenance materials
- the full installable operating surface

Not every source-repository file belongs in a target repository.

## Target Repository

The target repository is where product work happens.

It should receive only the installed surface needed for agents to use the harness safely and consistently.

## Installed Surface

The installed surface is the subset copied by `install.js` or vendored manually into the target repository.

It is a deliberate subset, not a mirror of the whole source repository.

## Required Installed Files

Required installed files include:

- `AGENTS.md`
- `docs/adoption-guide.md`
- `docs/tool-discovery-and-routing.md`
- `docs/target-repo-validation.md`
- `docs/install-to-profile-walkthrough.md`
- `docs/validation-troubleshooting.md`
- `docs/small-repo-memory.md`

## Required Installed Directories

Required installed directories include:

- `commands/`
- `skills/`
- `workflows/`
- `patterns/`
- `templates/`

## Optional Installed Files

Optional but useful installed files can include:

- `tool-capabilities/`
- `scripts/discover-tools.js`
- `docs/target-repo-validation-checklist.md`
- `docs/target-repo-validation-prompts.md`
- `docs/install-output-example.md`
- `docs/host-repo-checklist.md`
- `docs/usage-examples.md`
- `docs/runtime-compatibility.md`

These remain optional because different target repos may need different levels of guidance.

## PACK.md And The Installed Surface

`PACK.md` is a source-pack and release-archive manifest.

- include `PACK.md` in release archives so adopters can verify pack identity and validation commands
- do not require `PACK.md` inside every target repository by default
- teams may copy `PACK.md` into a target repo when they want local pack metadata for vendored or audited adoption

`install.js` does not need to copy `PACK.md` unless a future release explicitly adds that as an optional install flag.

## What Must Not Be Installed

Do not treat these as part of the default installed surface:

- release notes unless explicitly useful
- `PACK.md` unless the target repo explicitly wants pack metadata locally
- repository maintenance docs
- CI-only files unless needed
- private or local artifacts
- generated state
- runtime, server, or database files

The installed surface should stay focused on agent operating context, not source-repo maintenance.

## How install.js Uses This Contract

`install.js` should export the required installed surface plus a small set of optional adoption-facing docs.

It should not blindly copy the full source repository.

## How Agents Should Use The Installed Surface

Agents should use the installed surface from inside the target repository:

- read `AGENTS.md`
- use commands, skills, workflows, patterns, and templates
- create `.harness/` profile and goal artifacts in the target repo
- run target validation there

The source repository remains the canonical pack source, not the product work tree.

## Safety Notes

- keep markdown as the source of truth
- install only the surface the target repo actually needs
- do not copy maintenance-only or private artifacts into target repos
- do not introduce runtime code, generated state, or automation-heavy distribution behavior

## Frozen Contract

The v1.0.0-stable default installed surface is recorded in [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md).
