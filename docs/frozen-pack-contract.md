# Frozen PACK.md Contract

## Purpose

Record the `PACK.md` manifest contract frozen for `v1.0.0` as part of `v0.9.0` Stable Contract Freeze.

## Contract Status

**Frozen for v1.0.0** (v0.9.0 Step 2).

Normative spec: [pack-manifest-spec.md](pack-manifest-spec.md). Canonical example: [PACK.md](../PACK.md).

## Frozen PACK.md Headings

These `##` headings must be present in every `PACK.md`:

| Heading |
|---|
| Pack Name |
| Pack Version |
| Pack Type |
| Purpose |
| Included Surface |
| Consumption Modes |
| Runtime Compatibility |
| Validation Commands |
| Safety Boundaries |
| Non-Goals |

Enforced in `bin/validate.js` as `packRequiredHeadings`.

## Manifest Location

- **Source pack:** repository root (`PACK.md` next to `AGENTS.md`)
- **Release archive:** archive root (same relative path)
- **Target repository:** **not** required by default; teams may copy `PACK.md` for vendored or audited adoption

## Manifest Format

- Markdown with required `##` sections
- No JSON manifest requirement for v1.0.0
- Human-readable and agent-friendly

## What Is Guaranteed

- required heading **presence** is validated by `node bin/validate.js` on the source pack
- `PACK.md` exists at source pack root for releases built from this repository
- manifest describes pack identity, surface summary, consumption modes, validation commands, and safety boundaries at heading level

## What Is Not Guaranteed

- heading **order** (not validated)
- body **semantics** or version value correctness (not validated)
- release archive file list hashing or checksums
- automatic sync between manifest body and `bin/aih.js install` surface (maintainers verify manually via checklist)

## Allowed Additive Changes

- clarifying body text under frozen headings
- optional future `##` sections **not** added to `packRequiredHeadings` until explicitly versioned
- pack version string updates in `## Pack Version` body

## Breaking Changes

See [breaking-change-policy.md](breaking-change-policy.md).

Breaking for this contract:

- removing any required heading above
- renaming a required heading without migration
- requiring `PACK.md` inside every target repository by default

## Validation Behavior

Source pack:

```bash
node bin/validate.js
```

- checks `PACK.md` exists
- checks each required `##` heading appears at least once
- does **not** parse or validate section body contents

Target repos:

- structural target validation does **not** require `PACK.md` by default

## Relationship To PACK.md

[PACK.md](../PACK.md) is the live manifest for this repository. Release tags and archives should ship the matching `PACK.md` for that version.

## Relationship To pack-manifest-spec.md

[pack-manifest-spec.md](pack-manifest-spec.md) describes the manifest format for authors. This document is the **freeze record** for v1.0.0: what adopters and maintainers can rely on not changing without a breaking release.

## v1.0.0 Notes

- one markdown manifest, ten required headings
- target adoption does not depend on local `PACK.md` unless the team opts in
- semantic validation of manifest bodies remains out of scope for v1.0.0
