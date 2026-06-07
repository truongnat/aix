# One-Line Installer Design

## Purpose

Design `install.sh` for remote, dependency-free installation into a target repository without manual clone.

## install.sh Responsibilities

1. Parse CLI flags and print usage on error
2. Verify `node` is available
3. Download a pinned or default ref of the pack (GitHub archive tarball)
4. Extract to a temporary directory
5. Run `node bin/aih.js install --target <resolved-target>` with forwarded flags (`--dry-run`, `--force`)
6. Remove temporary directory on success or failure
7. Print next steps (profile, validate from downloaded pack or global CLI when available)

`install.js` remains the **canonical** file copy implementation. `install.sh` is a bootstrap wrapper only.

## Implementation Status

Implemented in repository root [install.sh](../install.sh):

| Flag | Status |
|---|---|
| `--target <path>` | implemented (default `.`) |
| `--dry-run` | implemented |
| `--force` | implemented |
| `--ref <git-ref>` | implemented (default `main`) |
| `--help` | implemented |
| `--global` | planned (future `bin/ai-harness.js`) |

Usage: [install-sh-usage.md](install-sh-usage.md).

## Required Flags

| Flag | Behavior |
|---|---|
| `--target <path>` | Target repository (default: current working directory) |
| `--dry-run` | Forward to `install.js` |
| `--force` | Forward to `install.js` |
| `--global` | Install `ai-harness` shim to user bin (planned; not in `install.sh` yet) |
| `--ref <tag>` | Git ref for archive download (for example `v0.9.1`); default `main` |
| `--help` | Usage |

## Remote Source Strategy

Preferred v1 approach (no new dependencies):

```txt
https://github.com/truongnat/ai-engineering-harness/archive/<ref>.tar.gz
```

Extract `ai-engineering-harness-<ref>/` (GitHub archive root folder naming) and run `install.js` from that directory.

Alternative for review-only flows: clone is not required; users may download tarball manually and run `install.js` locally.

## Temp Directory Strategy

- create `mktemp -d` (or platform equivalent)
- extract archive under temp dir
- `cd` to extracted pack root before `node bin/aih.js install`
- `trap` cleanup on EXIT

## Node Requirement

- require Node.js on PATH (same as today)
- do not bundle Node
- fail fast with clear message if `node` missing

## Cleanup Behavior

- always remove temp extract dir unless `--keep-temp` is added later for debugging
- do not leave partial copy in target on installer failure before `install.js` runs

## Error Behavior

- non-zero exit on download failure, extract failure, missing node, or `install.js` failure
- surface `install.js` stderr
- do not continue after failed download

## Security Notes

See [plugin-install-security.md](plugin-install-security.md).

## Pinning To Tags

Recommend production installs pin a release tag:

```bash
curl -fsSL .../install.sh | sh -s -- --ref v0.9.1 --runtime generic --scope project --init-harness --target .
```

Default `main` is for latest docs experiments; document risk in security doc.

## Relationship To install.js

| Layer | Role |
|---|---|
| `install.sh` | bootstrap, download, extract, invoke |
| `install.js` | `exportPaths`, copy/skip/force, summary, next steps |

Do not duplicate copy logic in shell beyond invoking Node.
