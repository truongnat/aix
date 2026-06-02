# install.sh Usage

## Purpose

Document the one-line remote installer for `ai-engineering-harness` into a target repository without manual clone.

## Important: Fallback / Manual Installer

**Current `install.sh` is not the final runtime-native plugin installer.**

It downloads the pack and runs `install.js`, which **copies** the default installed surface into the target repo root (`AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, `docs/`, …). That path is **fallback / manual** only until the interactive installer ships.

Target UX (in progress): choose **runtime** + **scope** → install to runtime-correct locations → project-local `.harness/` only when needed. See [interactive-installer-design.md](interactive-installer-design.md), [runtime-install-matrix-research.md](runtime-install-matrix-research.md), [project-state-policy.md](project-state-policy.md).

## Quick Install

From your **product repository** root:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
```

Default `--target` is the current working directory (`.`).

## Explicit Target

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target ../my-project
```

## Dry Run

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target . --dry-run
```

## Force

Overwrite existing installed files:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target . --force
```

## Pin Ref / Tag

Install a specific GitHub ref (branch or tag):

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --ref v0.9.0 --target .
```

Default ref is `main`. Prefer tags for reproducible installs ([plugin-install-security.md](plugin-install-security.md)).

## Review Before Run

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh -o install-harness.sh
less install-harness.sh
sh install-harness.sh --ref v0.9.0 --target .
```

## Requirements

- `node` on PATH
- `tar` on PATH
- `curl` or `wget` for download
- writable target directory (must exist for write install; dry-run allows missing target leaf with existing parent)

## What It Does

1. Downloads `https://github.com/truongnat/ai-engineering-harness/archive/<ref>.tar.gz`
2. Extracts to a temporary directory
3. Runs `node install.js --target <absolute-path>` from the extracted pack
4. Removes the temporary directory on exit

Copy behavior is defined by [install.js](../install.js) and [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md).

## What It Does Not Do

- does not use `sudo`
- does not publish to npm or marketplace
- does not install runtime adapters
- does not send telemetry
- does not read secrets or `.env` files
- does not reimplement `exportPaths` in shell
- does not install a global `ai-harness` CLI yet (`--global` is future work)

## Troubleshooting

| Problem | Check |
|---|---|
| `node is required` | Install Node.js |
| `curl or wget is required` | Install curl or wget |
| `failed to download archive` | Network, ref name, or GitHub availability |
| `target directory does not exist` | Create target path or fix `--target` |
| Wrong files installed | Confirm cwd when piping `curl \| sh`; use `--target` explicitly |

Validate from a **downloaded pack** or maintainer clone:

```bash
node validate.js --target <path> --profile-only
```

Target repos do not receive `validate.js` by default; run validation from the pack source after install.
