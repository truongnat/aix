# Frozen Installed Surface Contract

## Purpose

Record the default installed surface frozen for `v1.0.0` as part of `v0.9.0` Stable Contract Freeze.

## Contract Status

**Frozen for v1.0.0** (v0.9.0 Step 2).

Authoring guide: [installed-surface-contract.md](installed-surface-contract.md). Implementation: `install.js` `exportPaths`.

## Default Install Surface

The **only** supported install contract for v1.0.0 is the default surface copied by:

```bash
node install.js --target <path>
```

There is **no** minimal install tier before v1.0.0 ([minimal-install-tier-decision.md](minimal-install-tier-decision.md)).

## Required Files

Top-level file copied by default install:

- `AGENTS.md`

## Required Directories

Directories copied recursively (all files under each tree):

- `commands/`
- `skills/`
- `workflows/`
- `patterns/`
- `templates/`

## Required Adoption Docs

These `docs/` files are part of the frozen default install (`exportPaths`):

- `docs/adoption-guide.md`
- `docs/tool-discovery-and-routing.md`
- `docs/target-repo-validation.md`
- `docs/install-to-profile-walkthrough.md`
- `docs/validation-troubleshooting.md`
- `docs/small-repo-memory.md`

## Required Validation Docs

Target validation guidance installed by default:

- `docs/target-repo-validation.md` (listed above)
- `docs/target-repo-validation-checklist.md`
- `docs/target-repo-validation-prompts.md`

## Optional / Not Guaranteed Files

The following are copied by **default** install today but are adoption guidance extras, not separate validator contracts in the target repo:

- `docs/concepts.md`
- `docs/command-loop.md`
- `docs/artifact-layout.md`
- `docs/quality-gates.md`
- `docs/install-output-example.md`
- `tool-capabilities/`
- `scripts/discover-tools.js`
- `docs/usage-examples.md`
- `docs/host-repo-checklist.md`
- `docs/runtime-compatibility.md`

Adding more optional docs to `exportPaths` is **non-breaking** if existing paths remain.

## What Is Not Installed By Default

Not copied by `install.js` `exportPaths`:

- `PACK.md` (manifest stays in source pack / release archive)
- `validate.js` (run from source pack with `--target`)
- `install.js` (installer stays in source pack)
- `LICENSE`, `README.md` (unless team copies manually)
- release notes, roadmap, dogfood reports, and other source-only maintenance docs
- `examples/`, `.github/`, test fixtures, and full source repository mirror

## What Is Guaranteed

- default install copies exactly the `exportPaths` trees and files in `install.js`
- product work and `.harness/` profile and goals live in the **target** repository
- target structural validation runs from the **source** pack:

```bash
node validate.js --target <path> --profile-only
node validate.js --target <path> --goal <goal-id>
```

## What Is Not Guaranteed

- minimal install tier or `full` vs `minimal` modes (post-v1)
- `PACK.md` or `validate.js` inside target repos
- install copying the entire source repository
- semantic validation of installed content

## Allowed Additive Changes

- adding new paths to `exportPaths` without removing frozen required paths
- install summary / display improvements that do not change copy destinations
- documentation clarifications in [installed-surface-contract.md](installed-surface-contract.md)

## Breaking Changes

See [breaking-change-policy.md](breaking-change-policy.md).

Breaking for this contract:

- removing any required file or directory above from default `exportPaths`
- requiring `PACK.md` in target repos by default
- requiring `validate.js` inside target repos by default
- changing validation to require target-local `validate.js` without migration

## Relationship To install.js exportPaths

The frozen contract **is** the current `exportPaths` array in [install.js](../install.js):

```txt
AGENTS.md
commands
skills
workflows
patterns
templates
docs/concepts.md
docs/command-loop.md
docs/artifact-layout.md
docs/quality-gates.md
docs/adoption-guide.md
docs/install-output-example.md
docs/tool-discovery-and-routing.md
tool-capabilities/
scripts/discover-tools.js
docs/install-to-profile-walkthrough.md
docs/validation-troubleshooting.md
docs/small-repo-memory.md
docs/target-repo-validation.md
docs/target-repo-validation-checklist.md
docs/target-repo-validation-prompts.md
docs/usage-examples.md
docs/host-repo-checklist.md
docs/runtime-compatibility.md
```

Directory entries expand to all files beneath them at install time.

## Relationship To installed-surface-contract.md

[installed-surface-contract.md](installed-surface-contract.md) explains concepts (source vs target, optional docs). This document is the **freeze record** aligned with `exportPaths` for v1.0.0.

## v1.0.0 Notes

- one default installed surface only
- dogfood used ~83 expanded paths; acceptable for v1
- teams needing pack metadata in-target may copy `PACK.md` manually; not part of default install
