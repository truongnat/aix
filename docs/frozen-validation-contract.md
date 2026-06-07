# Frozen Validation Contract

## Purpose

Record the `bin/validate.js` structural behavior contract frozen for `v1.0.0` as part of `v0.9.0` Stable Contract Freeze.

## Contract Status

**Frozen for v1.0.0** (v0.9.0 Step 4).

Implementation: [bin/validate.js](../bin/validate.js). Usage guide: [target-repo-validation.md](target-repo-validation.md).

## Validation Modes

| Mode | CLI | `parseValidateArgs` mode |
|---|---|---|
| Source pack validation | `node bin/validate.js` | `harness-repository` |
| Target profile validation | `node bin/validate.js --target <path>` | `target-profile` |
| Target profile (explicit) | `node bin/validate.js --target <path> --profile-only` | `target-profile` |
| Target goal validation | `node bin/validate.js --target <path> --goal <goal-id>` | `target-goal` |
| Runtime-aware profile | `node bin/validate.js --target <path> --runtime <name> --profile-only` | `target-profile` (+ `runtime`) |
| Runtime-aware goal | `node bin/validate.js --target <path> --runtime <name> --goal <goal-id>` | `target-goal` (+ `runtime`) |

**Extension (v0.9.x):** [runtime-aware-validation.md](runtime-aware-validation.md) adds `--runtime` for target validation. Legacy AGENTS.md-only profile mode remains the default without `--runtime`; that is **not** the final v1 behavior for all runtime-native install modes.

Rules:

- empty argv → source pack validation against the harness repository root
- `--target <path>` without `--goal` → **profile** validation (same as `--profile-only`)
- `--target` + `--goal <goal-id>` → goal validation (profile checks run first)
- `--profile-only` and `--goal` cannot be combined

## Source Pack Validation

Command:

```bash
node bin/validate.js
```

Guaranteed checks include:

- required source-pack files in `bin/validate.js` `requiredFiles`
- command and skill heading contracts
- template non-empty and heading contracts
- example harness profile and goal heading contracts
- `AGENTS.md` completion and memory discipline headings
- [frozen PACK.md contract](frozen-pack-contract.md) headings

Success message shape:

```txt
Harness validation passed. Checked <N> required files/contracts.
```

Failure prefix:

```txt
Harness validation failed:
```

## Target Profile Validation

Commands:

```bash
node bin/validate.js --target <path>
node bin/validate.js --target <path> --profile-only
```

Validates [frozen target profile contract](frozen-target-profile-contract.md):

- **Default:** `AGENTS.md` and `.harness/` profile files exist; required headings per profile file
- **With `--runtime`:** `.harness/` profile + runtime bootstrap paths per [runtime-aware-validation.md](runtime-aware-validation.md) (no `AGENTS.md` for `cursor`, etc.)

Run from the **source pack** working directory; `<path>` is resolved relative to `process.cwd()`.

Success message:

```txt
Target repository validation passed. Checked profile contract.
```

## Target Goal Validation

Command:

```bash
node bin/validate.js --target <path> --goal <goal-id>
```

Validates:

1. frozen target profile contract (same as profile mode)
2. [frozen goal artifact contract](frozen-goal-artifact-contract.md) for `.harness/goals/<goal-id>/`

Success message:

```txt
Target repository validation passed. Checked goal contract: <goal-id>.
```

## Required CLI Arguments

| Argument | Required when |
|---|---|
| (none) | source pack mode |
| `--target <path>` | any target mode |
| `--goal <goal-id>` | goal mode; must follow `--target` |
| `--profile-only` | optional; explicit profile mode only |

Usage errors print:

```txt
Validation usage error:
- <message>
```

Known usage messages:

- `Unsupported argument: <arg>`
- `Missing required path after --target`
- `Missing required goal id after --goal`
- `--profile-only cannot be combined with --goal`

## Guaranteed Checks

Structural only:

- required paths exist (`assertExists`)
- required `##` headings appear in file content (`assertHeadings`, substring match)
- selected templates are non-empty (`assertNonEmpty` on source pack templates)

Cross-contract:

- PACK.md headings → [frozen-pack-contract.md](frozen-pack-contract.md)
- target profile → [frozen-target-profile-contract.md](frozen-target-profile-contract.md)
- target goals → [frozen-goal-artifact-contract.md](frozen-goal-artifact-contract.md)
- default install surface is separate; `bin/validate.js` is **not** installed into targets by default → [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md)

## Failure Message Contract

Each failure line is prefixed with `- ` in CLI output.

| Situation | Message shape |
|---|---|
| Missing path | `Missing required path: <relative-path>` |
| Missing heading | `<relative-path> is missing heading: <heading>` |
| Empty template file (source pack) | `<relative-path> is empty` |

Usage errors are separate from structural failures and use the `Validation usage error:` header.

Adopters and tooling may rely on these shapes for v1.0.0.

## What Is Not Guaranteed

- semantic validation of markdown bodies
- secret scanning or PII detection
- deep repository or codebase scanning
- application or feature correctness
- heading **order** validation
- `PACK.md` body or version value validation
- `bin/validate.js` present inside target repositories
- validation of installed surface file list beyond structural contracts checked in source pack mode

## Allowed Additive Changes

- new required source-pack docs in `requiredFiles` (non-breaking for target repos if targets unchanged)
- new fixtures and tests
- additional usage messages for new flags if additive and documented
- clearer success/failure wording that does not change detection rules

## Breaking Changes

See [breaking-change-policy.md](breaking-change-policy.md).

Breaking for this contract:

- changing `--target <path>` default away from profile validation without migration
- changing missing path or missing heading message shapes
- requiring semantic checks for repos that pass structural validation today
- requiring `validate.js` inside target repos by default
- making `--profile-only` + `--goal` accepted when they conflict today

## Relationship To bin/validate.js

This document describes behavior implemented in [bin/validate.js](../bin/validate.js):

- `parseValidateArgs`
- `validateHarnessRepository` / `validateRepository`
- `validateTargetProfile`
- `validateTargetGoal`
- `main` exit codes: `0` pass, `1` fail

## Relationship To Frozen Contracts

| Frozen contract | Validation entry |
|---|---|
| PACK.md | source pack `node bin/validate.js` |
| Installed surface | not validated as a diff; install uses `exportPaths` |
| Target profile | `--target` / `--profile-only` |
| Goal artifacts | `--target` + `--goal` |

## v1.0.0 Notes

- one dependency-free validator in the source pack
- target validation always uses `--target` from source pack cwd
- structural pass ≠ ship-ready product
