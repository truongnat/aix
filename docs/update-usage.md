# Update Usage

## Purpose

Refresh project runtime-native harness files from a selected pack ref without touching project state in `.harness/`.

## What Update Does

- downloads the selected `--ref`
- refreshes `.ai-harness/` with overwrite semantics
- refreshes the selected runtime entrypoint with overwrite semantics
- optionally refreshes `.git/info/exclude` when `--visibility private` is passed

## What Update Does Not Do

- does not update `.harness/`
- does not remove files outside known harness paths
- does not edit `.gitignore`
- does not support global update in this step
- does not support manual runtime update

## Commands

```bash
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --yes
sh install.sh update --runtime all --scope project --ref main --yes
```

## Ref Pinning

Use `--ref` to choose the GitHub branch or tag to fetch.

Examples:

```bash
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --yes
sh install.sh update --runtime cursor --scope project --ref main --yes
```

## Cache Update

Update always refreshes `.ai-harness/` for project runtime-native installs.

- overwrite semantics are forced internally
- dry-run shows `WOULD COPY .ai-harness/...`

## Runtime Entrypoint Update

Update refreshes the selected runtime entrypoint with overwrite semantics.

Examples:

- `cursor` → `.cursor/rules/ai-engineering-harness.mdc`
- `generic` / `codex` → `AGENTS.md`
- `claude` → `.claude/CLAUDE.md`, `.claude/settings.json`
- `gemini` → `.gemini/extensions/ai-engineering-harness/`
- `opencode` → `.opencode/plugins/ai-engineering-harness.js`

## `.harness` Safety

Update preserves `.harness/` completely.

- no `.harness` overwrite
- no `.harness` removal
- no `--init-harness` support during update

## Git Hygiene

Update only changes ignore settings when `--visibility private` is passed.

```bash
sh install.sh update --runtime cursor --scope project --ref main --visibility private --yes
```

Without `--visibility`, update leaves `.git/info/exclude` unchanged.

## Dry Run

```bash
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --dry-run
```

Dry-run prints the update plan plus the cache/runtime writes it would perform.

## Examples

Refresh Cursor from the latest tag:

```bash
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --yes
```

Refresh all supported project runtimes from `main`:

```bash
sh install.sh update --runtime all --scope project --ref main --yes
```
