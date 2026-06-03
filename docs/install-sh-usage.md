# install.sh Usage

## Purpose

Document the one-line remote installer for `ai-engineering-harness` into a target repository without manual clone.

## Recommended: Runtime-native Install

`install.sh` supports **runtime** + **scope** selection and calls [install-runtime.js](../install-runtime.js) for non-`manual` runtimes. Modes are **experimental** until manual session checks pass — see [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

```bash
sh install.sh --runtime cursor --scope project --init-harness --dry-run --yes
sh install.sh --runtime cursor --scope project --init-harness --yes
```

Pin a release: `--ref v0.9.1` ([plugin-install-security.md](plugin-install-security.md)).

Validate from the source pack: `node validate.js --target <repo> --runtime <name> --profile-only` ([runtime-aware-validation.md](runtime-aware-validation.md)).

## Manual Fallback (root copy)

Non-interactive `curl | sh` **without** `--runtime` defaults to **`manual`**: downloads the pack and runs `install.js`, which **copies** the default installed surface into the target repo root (`AGENTS.md`, `commands/`, `skills/`, …). Use only when runtime-native install is not suitable — [scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md).

## Runtime Selector

`install.sh` accepts **runtime** and **scope** and prints an install plan before executing.

| Flag | Purpose |
|---|---|
| `--runtime <name>` | `claude`, `codex`, `cursor`, `gemini`, `generic`, `all`, `manual` (`opencode` legacy uninstall only via `aih.sh`) |
| `--scope <name>` | `global` or `project` (required for non-manual when non-interactive) |
| `--init-harness` | Scaffold project `.harness/` profile files (project scope; see [harness-init-usage.md](harness-init-usage.md)) |
| `--legacy-root` | Alias for `--runtime manual` |
| `--yes` | Skip confirmation prompt |

**Experimental:** Non-`manual` runtimes call [install-runtime.js](../install-runtime.js). File/install dogfood complete (D1–D6); **stable support: No** — see [runtime-native-install-audit.md](runtime-native-install-audit.md).

**Only `--runtime manual`** performs legacy root copy (`install.js`). Other runtimes write runtime-specific paths only (no `commands/`/`skills/` at repo root):

- **Dry-run:** prints `WOULD CREATE` / `UPDATE` lines; no root pack copy (uses local pack when `install.sh` is run from clone)
- **Write:** creates runtime-specific files only

Non-interactive install without `--runtime` defaults to `manual` and prints a **fallback warning**.

Windsurf is not exposed as a separate runtime until its native payload and docs are verified. Use the `cursor` runtime only when you intentionally want the Cursor rule path.

See [interactive-installer-design.md](interactive-installer-design.md), [runtime-install-matrix-research.md](runtime-install-matrix-research.md), [project-state-policy.md](project-state-policy.md).

## Quick Install (manual fallback only)

From your **product repository** root (root copy — not runtime-native):

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

Validate after init: `node validate.js --target <repo> --profile-only` from source pack.

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
4. Runs `node install.js --target <absolute-path>` from the extracted pack
5. Removes the temporary directory on exit

Copy behavior is defined by [install.js](../install.js). Root bulk copy is **fallback only**, not the v1 default install model.

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
