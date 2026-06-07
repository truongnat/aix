# Packaging Model

## Purpose

Explain what capability pack packaging means in `ai-engineering-harness` and how it relates to distribution without heavy automation.

## What Packaging Means Here

Packaging means making the markdown capability pack easier to:

- identify as a named, versioned pack
- verify before install or archive distribution
- map to the installed surface and release archive shape
- reason about manually without a package manager

The canonical manifest is `PACK.md` at the source pack root.

## What Packaging Does Not Mean

Packaging does not mean:

- npm publishing
- marketplace automation
- runtime plugin implementation
- compiled or installed plugin packages
- server, database, or background systems
- semantic validation or deep repository scanning

## Source Pack

The source pack is this repository.

It contains the full authored surface: commands, skills, workflows, patterns, templates, docs, examples, `bin/aih.js`, `bin/validate.js`, and `PACK.md`.

## Installed Surface

The installed surface is the deliberate subset copied into a target repository.

See [installed-surface-contract.md](installed-surface-contract.md). The manifest's Included Surface section describes what belongs in a distributable pack; `bin/aih.js install` defines what is copied by default into target repos.

## Pack Manifest

`PACK.md` is the markdown-first pack manifest.

It records pack name, version, type, purpose, included surface, consumption modes, runtime compatibility, validation commands, and safety boundaries.

See [pack-manifest-spec.md](pack-manifest-spec.md).

## Release Archive

A release archive is a versioned snapshot of the capability-pack surface for manual distribution.

Archives should include `PACK.md` so adopters can verify pack identity and expected validation commands before copying into a target repository.

See [release-archive-model.md](release-archive-model.md) and [release-archive-checklist.md](release-archive-checklist.md).

## Verification

Before release or manual archive distribution, run [pack-verification-checklist.md](pack-verification-checklist.md).

It verifies `PACK.md`, included surface, installed surface alignment with `bin/aih.js install`, release archive consistency, and structural validation commands.

## Manual Packaging Flow

Follow [manual-packaging-guide.md](manual-packaging-guide.md) for the full maintainer workflow.

Summary:

1. confirm the release scope matches [v0.7.0 plan](v0.7.0-plan.md) boundaries
2. update `PACK.md` pack version to the releasing version
3. complete [pack-verification-checklist.md](pack-verification-checklist.md)
4. verify the repository with the validation commands listed in `PACK.md`
5. assemble a release archive using the release archive checklist
6. include `PACK.md` in the archive root
7. tag the source repository manually

Archive generation scripts are not required for `v0.7.0`.

## Future Automation Boundary

Later optional work may add:

- archive generation scripts
- manifest-to-surface diff checks
- registry or marketplace distribution

Those are separate from the `v0.7.0` manifest and documentation contract.

## Safety Boundaries

- markdown remains the source of truth
- no secrets or private business data in pack artifacts
- structural validation only
- no runtime adapters under the name of packaging
