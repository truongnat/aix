# NPX CLI UX

## Purpose

`npx ai-engineering-harness` is the **primary** install UX for v0.10.0 (experimental). It provides an interactive wizard similar to `npx skills add`: clear header, detected context, keyboard-driven selection, install plan, and confirmation.

Shell scripts (`aih.sh`, `install.sh`, `aih.ps1`) remain as fallbacks.

## Primary command

```bash
npx ai-engineering-harness install
```

Aliases: `npx aih install`, local `node bin/aih.js install`.

## Screenshot-style flow

```txt
ai-engineering-harness

Source: https://github.com/truongnat/ai-engineering-harness
Version: 0.10.0
Target: /path/to/my-project
Git repo: yes

Select provider(s) to install (space to toggle, enter to confirm)
(space to toggle, enter to confirm)

> [x] Cursor (recommended)
  [ ] Claude Code
  [ ] Codex
  [ ] Gemini
  [ ] OpenCode
  [ ] Generic AGENTS.md
  [ ] Manual fallback
  [ ] Antigravity (planned)

Install mode:
> Project private — local to this checkout, ignored via .git/info/exclude
  Project shared — visible in git status
  Global — runtime-level install where supported

Initialize .harness project state? [Y/n]
Install .ai-harness capability cache? [Y/n]

Will install:
  .ai-harness/
  .harness/
  .cursor/rules/ai-engineering-harness.mdc
  .git/info/exclude block

Will not modify:
  .gitignore
  root commands/
  root skills/

Proceed with install? [Y/n]
```

## Detection is recommendation only

The wizard scans the target for hints (`.cursor/`, `.claude/`, `.gemini/`, `.opencode/`, harness-owned `AGENTS.md`) and marks matching providers as **(recommended)**. It does **not** auto-install based on detection alone — you must toggle providers and confirm.

## Install wizard steps

1. Header (source, version, target, git repo)
2. Multi-select providers (checkbox UI when TTY supports raw mode)
3. Install mode (project private / project shared / global)
4. Initialize `.harness/` (default yes when missing)
5. Install `.ai-harness/` cache (default yes for project runtime-native)
6. Plan summary
7. Confirm
8. Backend install via `aih.sh` (one provider per invocation)

## Update wizard

```bash
npx ai-engineering-harness update
```

Lists **installed** providers (from entrypoint files), preselects them, lets you choose which to refresh, then calls `aih.sh update` per provider.

## Uninstall wizard

```bash
npx ai-engineering-harness uninstall
```

Lists installed providers, optional removal of `.ai-harness/`, `.harness/`, or full cleanup (`--all` on backend).

## Status and doctor

```bash
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

Delegates to `aih.sh status` / `aih.sh doctor` (local checks, no network).

## Non-interactive flags

```bash
npx ai-engineering-harness install --provider cursor --yes
npx ai-engineering-harness install --provider cursor,claude --yes --dry-run
npx ai-engineering-harness install --runtime cursor --scope project --visibility private --target . --yes
```

| Flag | Purpose |
|---|---|
| `--provider` | Provider id(s), comma-separated (`--runtime` alias) |
| `--scope` | `project` or `global` |
| `--visibility` | `private` or `shared` (project scope) |
| `--target` | Target directory |
| `--ref` | Git ref when using remote bootstrap paths |
| `--dry-run` | Preview only |
| `--yes` | Skip confirmation |

Without `--provider` in non-interactive mode (no TTY or `--yes` without explicit selection rules): fails with  
`No provider selected. Pass --provider cursor or run interactively.`

## Windows

- Prefer `npx ai-engineering-harness install` as the primary entry.
- v0.10.0 still shells out to `aih.sh` — **Git Bash or WSL** must provide `sh`.
- If `sh` is missing: `Git Bash or WSL is required for the shell backend in v0.10.0. Native JS backend is planned.`
- PowerShell profile warnings (PSReadLine, etc.) are unrelated to this CLI.

## Relation to `aih.sh`

The Node CLI is the **frontend**; `aih.sh` is the **backend** for install/update/uninstall in v0.10.0. This keeps dogfooded shell logic while shipping an NPX-friendly wizard.

## Limitations (experimental)

- No Antigravity install (shown disabled in wizard).
- No native PowerShell/JS install backend yet.
- Multi-provider install runs sequential `aih.sh install` calls; cache installs once on the first runtime-native provider.
- Manual fallback cannot be combined with runtime-native providers in one wizard session.
- Stable per-runtime support is **not** claimed.

## Related

- [simple-cli-ux.md](simple-cli-ux.md) — shell lifecycle commands
- [interactive-installer-design.md](interactive-installer-design.md) — earlier installer design
- [private-install-git-hygiene.md](private-install-git-hygiene.md) — `.git/info/exclude` behavior
