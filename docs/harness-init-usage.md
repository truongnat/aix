# Harness Init Usage

## Purpose

Document **project-local** `.harness/` scaffolding for the primary Node.js CLI and the shell/bootstrap fallback path.

## Project Scope Only

- `.harness/` is created **inside the target repository** only.
- **Global** scope with `--init-harness` is **rejected**.
- There is **no** `~/.harness/` or shared global harness state.

## Commands

Dry-run (no writes, no network for non-manual runtimes):

```bash
npx ai-engineering-harness install --provider claude --scope project --target . --dry-run --yes
```

Write scaffold:

```bash
npx ai-engineering-harness install --provider claude --scope project --target . --yes
```

Shell/bootstrap fallback with explicit harness init:

```bash
sh install.sh --runtime manual --target . --init-harness --dry-run
```

Primary Node CLI project installs initialize `.harness/` automatically when it is missing. The explicit `--init-harness` flag belongs to the shell/bootstrap fallback surface.

## Generated Files

Minimal structural skeletons (required `##` headings only):

| Path | Role |
|---|---|
| `.harness/HARNESS.md` | Operating model |
| `.harness/TEAM.md` | Team pattern |
| `.harness/SKILLS.md` | Skill selection |
| `.harness/WORKFLOW.md` | Command sequence |
| `.harness/GATES.md` | Quality gates |
| `.harness/MEMORY.md` | Memory policy |
| `.harness/goals/.gitkeep` | Goals directory placeholder |

Init does **not** create runtime bootstrap files such as `AGENTS.md`. Those belong to runtime modes (e.g. `generic`, `codex`) or `manual` fallback via `bin/aih.js install`.

To get both `.harness/` and `AGENTS.md` from `runtime/bootstrap/AGENTS.project.md`:

```bash
npx ai-engineering-harness install --provider generic --scope project --target . --yes
# or
npx ai-engineering-harness install --provider codex --scope project --target . --yes
```

Runtimes that do not write `AGENTS.md` (e.g. `cursor`, `claude`) require `AGENTS.md` from another runtime or `manual` install before `--profile-only` validation passes.

Fill content after init. Do not store secrets in `.harness/`.

## Dry Run

Prints `WOULD CREATE`, `WOULD SKIP`, or `WOULD OVERWRITE` per file. No filesystem writes.

## Existing Files

| Situation | Behavior |
|---|---|
| File exists, no `--force` | `SKIP` (or `WOULD SKIP` in dry-run) |
| File exists, `--force` | `OVERWRITE` (or `WOULD OVERWRITE`) |
| File missing | `CREATE` (or `WOULD CREATE`) |

## Force

`--force` applies to `.harness/` profile files only. Runtime installers and the legacy manual fallback respect `--force` for their own files (including `AGENTS.md` when the runtime writes it).

## Global Scope Rejection

```bash
sh install.sh --runtime claude --scope global --init-harness --yes
```

Exits with:

```txt
Global install cannot create shared .harness state. Run project install inside each repo.
```

## Validate After Init

From the **source pack** (maintainer clone):

```bash
# Legacy / AGENTS.md-based targets (manual install or default)
node bin/validate.js --target <path-to-product-repo> --profile-only

# Runtime-native (match install --runtime)
node bin/validate.js --target <path-to-product-repo> --runtime generic --profile-only
node bin/validate.js --target <path-to-product-repo> --runtime codex --profile-only
node bin/validate.js --target <path-to-product-repo> --runtime cursor --profile-only
```

Checks `.harness/` paths and required headings per [frozen-target-profile-contract.md](frozen-target-profile-contract.md). Runtime bootstrap paths per [runtime-aware-validation.md](runtime-aware-validation.md).

## Commit Policy

Project **private** mode prefers `.git/info/exclude` (not tracked). Shell/bootstrap fallback may expose explicit ignore-strategy controls; the primary Node CLI does not. See [git-hygiene-policy.md](git-hygiene-policy.md) and [project-state-policy.md](project-state-policy.md).

## Related

- [interactive-installer-design.md](interactive-installer-design.md)
- [install-sh-usage.md](install-sh-usage.md)
- [project-state-policy.md](project-state-policy.md)
