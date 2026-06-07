# NPX CLI UX

## Purpose

`npx ai-engineering-harness` is the **primary** install UX for v0.11.x (experimental). Interactive wizard powered by `@clack/prompts` (intro, detected hints, multiselect, plan, spinner, outro) — see [terminal-wizard-ux.md](terminal-wizard-ux.md).

**Active providers:** Claude Code, Cursor, Codex, Gemini. OpenCode is not offered in the wizard (v0.11.0).

## Primary command

```bash
npx ai-engineering-harness install
```

Aliases: `npx aih install`, `aih install` (global/link).

## Detection is recommendation only

Hints (`.cursor/`, `.claude/`, `.gemini/`, harness `AGENTS.md`) mark providers **(recommended)** and may preselect in the wizard. Claude is listed first as primary. The CLI **never** silently installs based on detection alone.

## Slash commands after install

Project-scoped **canonical commands** (`harness-plan`, `harness-verify`, …) route through `.ai-harness/runtime-commands/` → `.ai-harness/commands/`. Native slash support is provider-dependent — Cursor uses `.cursor/commands/`, Claude uses `.claude/commands/`; Codex uses plugin packaging plus `AGENTS.md` fallback; Gemini uses extension packaging plus `GEMINI.md` context. See [runtime-command-surface.md](runtime-command-surface.md).

## Install wizard

Uses `@clack/prompts` when stdin/stdout is a TTY:

1. Package version, target, git repo
2. Detected provider hints (informational)
3. Multiselect providers (space / enter)
4. Install mode: project private | project shared | global
5. Init `.harness/`?
6. Install `.ai-harness/` cache?
7. Plan + non-Git warning for private mode
8. Confirm
9. Spinner + in-process backend run per provider
10. Outro with `harness-plan` (ask agent) and `doctor` next steps

```txt
Will install:
  .ai-harness/
  .harness/
  .cursor/commands/
  .cursor/rules/
  .git/info/exclude block

Will not modify:
  .gitignore
  root commands/
  root skills/
  root workflows/
  root templates/
  root patterns/
```

## Update / uninstall

```bash
npx ai-engineering-harness update
npx ai-engineering-harness uninstall
```

Interactive: select **installed** providers. Uninstall defaults keep `.ai-harness/` and `.harness/`; optional full cleanup removes runtime entrypoints plus cache/state through the in-process backend.

## Non-interactive

```bash
npx ai-engineering-harness install --provider cursor --yes
npx ai-engineering-harness install --provider cursor,claude --yes --dry-run
npx ai-engineering-harness uninstall --provider cursor --yes
npx ai-engineering-harness uninstall --all --yes
```

| Flag | Purpose |
|------|---------|
| `--provider` | Primary; comma-separated (`--runtime` alias) |
| `--scope` | `project` \| `global` |
| `--visibility` | `private` \| `shared` |
| `--target`, `--dry-run`, `--yes`, `--all`, `--verbose` | See `npx ai-engineering-harness --help` |

Without `--provider` in non-interactive mode: `No provider selected. Pass --provider cursor or run interactively.`

## npm package

Published as `ai-engineering-harness`. See [npm-publish.md](npm-publish.md). Tarball excludes `test/` and `examples/`.

## Limitations

- Antigravity disabled in wizard
- Stable runtime support not claimed
- Manual + runtime-native cannot combine in one install

## Related

- [v0.10.0-release-notes.md](v0.10.0-release-notes.md)
- [private-install-git-hygiene.md](private-install-git-hygiene.md)
