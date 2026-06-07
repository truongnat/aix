# Uninstall Usage

## Purpose

Safely remove `ai-engineering-harness` project runtime-native files without deleting unrelated user content.

Primary surface: `npx ai-engineering-harness uninstall`. Shell/bootstrap-only cleanup knobs stay on the fallback path.

## Safe Defaults

Default `uninstall` removes only the selected runtime entrypoint.

- keeps `.ai-harness/`
- keeps `.harness/`
- removes the harness block from `.git/info/exclude` when present
- does not edit `.gitignore`

If cache/state are kept, they may become visible in `git status` after uninstall because the local exclude block is removed.

## Commands

```bash
npx ai-engineering-harness uninstall
npx ai-engineering-harness uninstall --provider cursor --yes
npx ai-engineering-harness uninstall --all --yes
```

Shell/bootstrap fallback keeps explicit cleanup flags such as `--remove-cache` and `--remove-state`; see [install-sh-usage.md](install-sh-usage.md) for that surface.

## Runtime Entrypoints

| Runtime | Paths removed |
|---|---|
| `cursor` | `.cursor/commands/`, `.cursor/rules/` |
| `codex`, `generic`, `manual` | `AGENTS.md` only when clearly harness-owned |
| `claude` | `.claude/CLAUDE.md`; `.claude/settings.json` is skipped unless future safe ownership logic is added |
| `gemini` | `.gemini/extensions/ai-engineering-harness/` |
| `opencode` | `.opencode/plugins/ai-engineering-harness.js` (legacy uninstall only; not an active install target since v0.11.0) |

`opencode.json` is kept when uninstalling legacy OpenCode installs.

## Cache Removal

`.ai-harness/` is kept by default because multiple runtime entrypoints may share it.

- Primary Node CLI: use `--all` for full cleanup
- Shell/bootstrap fallback: `--remove-cache` removes `.ai-harness/`

## State Removal

`.harness/` is kept by default because it may contain user project goals, memory, and workflow state.

- Primary Node CLI: use `--all` for full cleanup
- Shell/bootstrap fallback: `--remove-state` removes `.harness/`

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
npx ai-engineering-harness uninstall --provider cursor --dry-run --yes
```

Expected output includes `WOULD REMOVE`, `WOULD KEEP`, `WOULD UPDATE`, or `SKIP`.

## Safety Warnings

- `AGENTS.md` is only removed when it clearly references `ai-engineering-harness`.
- `.claude/settings.json` is currently skipped unless future safe ownership logic is added.
- Global uninstall is planned but not implemented in this step.

## Examples

Remove only the Cursor runtime bootstrap:

```bash
npx ai-engineering-harness uninstall
```

Remove all runtime entrypoints plus cache and project state:

```bash
npx ai-engineering-harness uninstall --all --yes
```

Remove only the Cursor runtime bootstrap with explicit advanced flags:

```bash
npx ai-engineering-harness uninstall --provider cursor --yes
```

Shell/bootstrap fallback: remove Cursor bootstrap plus cache and project state:

```bash
sh aih.sh uninstall --runtime cursor --scope project --remove-cache --remove-state --yes
```
