# install.sh Usage

## Purpose

Document the one-line remote installer for `ai-engineering-harness` into a target repository without manual clone.

Canonical scope: remote `install.sh` wrapper behavior, review-before-run flow, and manual fallback entrypoints.

Use [install-command-model.md](install-command-model.md) as the source of truth for `aih.sh` command defaults and flags. Use [runtime-native-install.md](runtime-native-install.md) for the per-runtime payload matrix and follow-up actions after runtime-native install.

## Recommended: Runtime-native Install

`install.sh` supports **runtime** + **scope** selection and calls [lib/install-runtime.ts](../lib/install-runtime.ts) for non-`manual` runtimes. Modes are **experimental** until manual session checks pass — see [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

```bash
sh install.sh --runtime cursor --scope project --init-harness --dry-run --yes
sh install.sh --runtime cursor --scope project --init-harness --yes
```

Pin a release: `--ref v0.9.1` ([plugin-install-security.md](plugin-install-security.md)).

Validate from the source pack: `node bin/validate.js --target <repo> --runtime <name> --profile-only` ([runtime-aware-validation.md](runtime-aware-validation.md)).

## Manual Fallback (legacy root copy)

Non-interactive `curl | sh` **without** `--runtime` defaults to **`manual`**: downloads the pack and runs `node bin/aih.js install`, which copies the default installed surface into the target repo root (`AGENTS.md`, `commands/`, `skills/`, …). Use only when runtime-native install is not suitable — [scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md).

## Wrapper Scope

`install.sh` is the compatibility wrapper for remote installs and advanced explicit flows.

- It accepts the same install-oriented flags documented in [install-command-model.md](install-command-model.md).
- It delegates runtime-native writes to [lib/install-runtime.ts](../lib/install-runtime.ts) and runtime-specific payload paths documented in [runtime-native-install.md](runtime-native-install.md).
- It keeps legacy root copy available only through `--runtime manual` / `--legacy-root` compatibility behavior.
- Non-interactive install without `--runtime` defaults to `manual` and prints a fallback warning.

## Quick Install (manual fallback only)

From your **product repository** root (legacy root copy, not runtime-native):

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh
```

Prefer runtime-native with explicit flags (see [Recommended](#recommended-runtime-native-install) above). Default `--target` is `.`.

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
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --ref v0.9.1 --runtime cursor --scope project --init-harness --target .
```

Default ref is `main`. Prefer tags for reproducible installs ([plugin-install-security.md](plugin-install-security.md)).

## Review Before Run

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh -o install-harness.sh
less install-harness.sh
sh install-harness.sh --ref v0.9.1 --target .
```

## Requirements

- `node` on PATH
- `tar` on PATH
- `curl` or `wget` for download
- writable target directory (must exist for write install; dry-run allows missing target leaf with existing parent)

## `.harness` Init

Project scope only. Rejects `--scope global --init-harness`.

```bash
sh install.sh --runtime claude --scope project --target . --init-harness --dry-run --yes
sh install.sh --runtime claude --scope project --target . --init-harness --yes
```

Non-interactive: pass `--init-harness` explicitly. Interactive project scope may prompt to init.

Validate after init: `node bin/validate.js --target <repo> --profile-only` from source pack.

## Examples (selector)

```bash
sh install.sh --runtime manual --target . --dry-run
sh install.sh --legacy-root --target . --dry-run
sh install.sh --runtime claude --scope project --dry-run --yes
sh install.sh --runtime cursor --scope global --dry-run --yes
```

## What Manual Fallback Does

When `--runtime manual` (or default non-interactive fallback):

1. Prints install plan and confirms (unless `--yes`)
2. Downloads `https://github.com/truongnat/ai-engineering-harness/archive/<ref>.tar.gz`
3. Extracts to a temporary directory
4. Runs `node bin/aih.js install --target <absolute-path>` from the extracted pack
5. Removes the temporary directory on exit

Copy behavior is defined by the `bin/aih.js install` surface. Legacy root bulk copy is **fallback only**, not the v1 default install model.

## Runtime-Native Notes

- Runtime-native modes remain **experimental** until manual session checks pass — see [runtime-dogfood-summary.md](runtime-dogfood-summary.md).
- Windsurf is not exposed as a separate documented path until its native payload is verified; use the `cursor` runtime only when you intentionally want the Cursor rule path.
- `--runtime manual` is the only mode that performs legacy root copy.

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
node bin/validate.js --target <path> --profile-only
```

Target repos do not receive `bin/validate.js` by default; run validation from the pack source after install.
