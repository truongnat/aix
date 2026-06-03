# Uninstall Usage

## Purpose

Safely remove `ai-engineering-harness` project runtime-native files without deleting unrelated user content.

## Safe Defaults

Default `uninstall` removes only the selected runtime entrypoint.

- keeps `.ai-harness/`
- keeps `.harness/`
- removes the harness block from `.git/info/exclude` when present
- does not edit `.gitignore`

If cache/state are kept, they may become visible in `git status` after uninstall because the local exclude block is removed.

## Commands

```bash
sh aih.sh uninstall
sh aih.sh uninstall --runtime cursor --scope project --yes
sh aih.sh uninstall --all
sh aih.sh uninstall --runtime cursor --scope project --remove-cache --remove-state --yes
sh aih.sh uninstall --runtime all --scope project --remove-cache --remove-state --yes
```

## Runtime Entrypoints

| Runtime | Paths removed |
|---|---|
| `cursor` | `.cursor/rules/ai-engineering-harness.mdc` |
| `codex`, `generic`, `manual` | `AGENTS.md` only when clearly harness-owned |
| `claude` | `.claude/CLAUDE.md`; `.claude/settings.json` is skipped unless future safe ownership logic is added |
| `gemini` | `.gemini/extensions/ai-engineering-harness/` |
| `opencode` | `.opencode/plugins/ai-engineering-harness.js` (legacy uninstall only; not an active install target since v0.11.0) |
| `all` | union of active runtime entrypoints above |

`opencode.json` is kept when uninstalling legacy OpenCode installs.

## Cache Removal

`.ai-harness/` is kept by default because multiple runtime entrypoints may share it.

- `--remove-cache` removes `.ai-harness/`
- `--keep-cache` keeps `.ai-harness/` explicitly

## State Removal

`.harness/` is kept by default because it may contain user project goals, memory, and workflow state.

- `--remove-state` removes `.harness/`
- `--keep-state` keeps `.harness/` explicitly

## Git Exclude Cleanup

Project uninstall removes the delimited `ai-engineering-harness` block from `.git/info/exclude` when it exists:

```gitignore
# ai-engineering-harness start
...
# ai-engineering-harness end
```

Unrelated exclude lines are preserved.

## Dry Run

Use `--dry-run` to preview removals:

```bash
sh aih.sh uninstall --runtime cursor --scope project --dry-run
```

Expected output includes `WOULD REMOVE`, `WOULD KEEP`, `WOULD UPDATE`, or `SKIP`.

## Safety Warnings

- `AGENTS.md` is only removed when it clearly references `ai-engineering-harness`.
- `.claude/settings.json` is currently skipped unless future safe ownership logic is added.
- Global uninstall is planned but not implemented in this step.

## Examples

Remove only the Cursor runtime bootstrap:

```bash
sh aih.sh uninstall
```

Remove all runtime entrypoints plus cache and project state:

```bash
sh aih.sh uninstall --all
```

Remove only the Cursor runtime bootstrap with explicit advanced flags:

```bash
sh aih.sh uninstall --runtime cursor --scope project --yes
```

Remove Cursor bootstrap plus cache and project state:

```bash
sh aih.sh uninstall --runtime cursor --scope project --remove-cache --remove-state --yes
```
