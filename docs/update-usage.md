# Update Usage

## Purpose

Refresh project runtime-native harness files without touching project state in `.harness/`.

## What Update Does

- refreshes `.ai-harness/` with overwrite semantics
- refreshes the selected runtime entrypoint with overwrite semantics
- optionally refreshes `.git/info/exclude` when `--visibility private` is passed

## What Update Does Not Do

- does not update `.harness/`
- does not remove files outside known harness paths
- does not edit `.gitignore`
- does not support global update in this step
- does not support manual runtime update
- primary Node CLI does not support `--ref`

## Commands

```bash
npx ai-engineering-harness update
npx ai-engineering-harness update --provider cursor --yes
```

## Cache Update

Update always refreshes `.ai-harness/` for project runtime-native installs.

- overwrite semantics are forced internally
- dry-run shows `WOULD COPY .ai-harness/...`

## Runtime Entrypoint Update

Update refreshes the selected runtime entrypoint with overwrite semantics.

Examples:

- `cursor` → `.cursor/commands/`, `.cursor/rules/`
- `generic` / `codex` → `AGENTS.md`
- `claude` → `.claude/CLAUDE.md`, `.claude/settings.json`
- `gemini` → `.gemini/extensions/ai-engineering-harness/`

## `.harness` Safety

Update preserves `.harness/` completely.

- no `.harness` overwrite
- no `.harness` removal
- no `--init-harness` support during update

### Skeleton note

If your repo was initialized by an older install path, the first TypeScript-backed install or
re-init can treat existing `.harness/*.md` skeleton files as overwrite candidates. The current
generator keeps the trailing newline required by normal POSIX text files, while older generators
could differ by one byte. Review the diff and keep or overwrite intentionally.

## Git Hygiene

Update only changes ignore settings when `--visibility private` is passed.

```bash
npx ai-engineering-harness update --provider cursor --visibility private --yes
```

Without `--visibility`, update leaves `.git/info/exclude` unchanged.

## Dry Run

```bash
npx ai-engineering-harness update --provider cursor --dry-run --yes
```

Dry-run prints the update plan plus the cache/runtime writes it would perform.

## Examples

Refresh Cursor from the latest tag:

```bash
npx ai-engineering-harness update
```

Refresh Cursor non-interactively:

```bash
npx ai-engineering-harness update --provider cursor --yes
```

No shell installer path remains in the current surface.
