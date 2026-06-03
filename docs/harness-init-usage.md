# Harness Init Usage

## Purpose

Document **project-local** `.harness/` scaffolding via [install.sh](../install.sh). This is shared across all runtimes before runtime-native install modes land.

## Project Scope Only

- `.harness/` is created **inside the target repository** only.
- **Global** scope with `--init-harness` is **rejected**.
- There is **no** `~/.harness/` or shared global harness state.

## Commands

Dry-run (no writes, no network for non-manual runtimes):

```bash
sh install.sh --runtime claude --scope project --target . --init-harness --dry-run --yes
```

Write scaffold:

```bash
sh install.sh --runtime claude --scope project --target . --init-harness --yes
```

Manual fallback + harness init (downloads pack, then scaffolds `.harness/`):

```bash
sh install.sh --runtime manual --target . --init-harness --dry-run
```

Non-interactive **requires** explicit `--init-harness` (no silent scaffold). Interactive **project** scope may prompt to init after scope selection.

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

Init does **not** create runtime bootstrap files such as `AGENTS.md`. Those belong to runtime modes (e.g. `generic`, `codex`) or `manual` fallback via `install.js`.

To get both `.harness/` and `AGENTS.md` from `runtime/bootstrap/AGENTS.project.md`:

```bash
sh install.sh --runtime generic --scope project --target . --init-harness --yes
# or
sh install.sh --runtime codex --scope project --target . --init-harness --yes
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

`--force` applies to `.harness/` profile files only. Runtime installers and manual `install.js` fallback respect `--force` for their own files (including `AGENTS.md` when the runtime writes it).

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
node validate.js --target <path-to-product-repo> --profile-only

# Runtime-native (match install --runtime)
node validate.js --target <path-to-product-repo> --runtime generic --profile-only
node validate.js --target <path-to-product-repo> --runtime codex --profile-only
node validate.js --target <path-to-product-repo> --runtime cursor --profile-only
```

Checks `.harness/` paths and required headings per [frozen-target-profile-contract.md](frozen-target-profile-contract.md). Runtime bootstrap paths per [runtime-aware-validation.md](runtime-aware-validation.md).

## Commit Policy

**v0.9.1:** Installer does **not** modify ignore files. **v0.9.2:** project **private** mode prefers `.git/info/exclude` (not tracked); `.gitignore` only with `--ignore-strategy gitignore` — [git-hygiene-policy.md](git-hygiene-policy.md). See [project-state-policy.md](project-state-policy.md).

## Related

- [interactive-installer-design.md](interactive-installer-design.md)
- [install-sh-usage.md](install-sh-usage.md)
- [project-state-policy.md](project-state-policy.md)
