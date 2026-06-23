# Terminal Wizard UX

## Purpose

Polished `@clack/prompts` wizard for `npx ai-engineering-harness install|update|uninstall`. UI lives in `lib/cli-ui.js`; business logic stays in `lib/cli-main.js` and `lib/cli-backend.js`.

Inspired by modern CLIs: shadcn, create-t3-app, `npx skills add`.

## Architecture

| Layer | Module | Role |
|-------|--------|------|
| Entry | `bin/aih.js` | Node shebang, delegates to `cli-main` |
| Logic | `lib/cli-main.js` | Args, validation, plan, backend orchestration |
| UI | `lib/cli-ui.js` | `@clack/prompts` intro, multiselect, confirm, spinner, outro |
| Backend | `lib/backend/*.js` + helpers | In-process lifecycle execution; `--verbose` streams raw backend output |
| Fallback prompts | `lib/cli-prompts.js` | Readline TUI (legacy; interactive path uses clack when TTY) |

## Interactive install flow

1. **Intro** — package version, target path, git repo, experimental banner
2. **Providers** — multiselect with `detected` hint; Antigravity disabled (planned)
3. **Install mode** — project private (default) | project shared | global
4. **Confirm** — init `.harness/`, install `.ai-harness/` cache
5. **Plan** — `Will install` / `Will not modify` blocks + slash command preview
6. **Proceed** — confirm before writes
7. **Spinner** — `Installing harness…` while the in-process backend runs per provider
8. **Outro** — success + next steps (use `harness-plan` for this repo, `doctor`)

Detection **recommends and preselects** only; it never auto-installs without explicit selection.

## Update / uninstall

Same intro + multiselect over **installed** providers, plan note, confirm, spinner, outro.

Uninstall adds optional cache/state removal and full cleanup (`--all`).

## Status / doctor

Interactive TTY: clack intro + grouped summary with ✓ / ! / ✗ symbols.

Non-TTY or `--yes` flows: compact plain-text blocks (no prompts).

## Non-interactive

When stdin/stdout is not a TTY, or `--yes`, or `--provider` is passed:

- Compact plan (no clack)
- One-line progress (`Installing harness…`)
- Result line (`Installed.` / `Updated.` / `Uninstalled.`)
- Errors to stderr with retry hints

```bash
npx ai-engineering-harness install --provider cursor --yes
npx ai-engineering-harness install --provider cursor --yes --dry-run
npx ai-engineering-harness uninstall --provider cursor --yes
npx ai-engineering-harness uninstall --all --yes
```

## Verbose backend

Default: hide raw backend stdout/stderr unless the command fails.

```bash
npx ai-engineering-harness install --provider cursor --yes --verbose
```

## Windows

Interactive wizard requires a TTY. Non-interactive `--yes` flows work in CI and PowerShell without clack.
