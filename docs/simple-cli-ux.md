# Simple CLI UX

## Primary UX (v0.10.x)

```bash
npx ai-engineering-harness install
npx ai-engineering-harness status
npx ai-engineering-harness doctor
npx ai-engineering-harness update
npx ai-engineering-harness uninstall
```

See [npx-cli-ux.md](npx-cli-ux.md) and [terminal-wizard-ux.md](terminal-wizard-ux.md). Detection **recommends** providers; the wizard requires explicit selection.

After install, use the local command catalog (`harness-plan`, `harness-verify`, …). Cursor and Claude expose native project commands; Codex uses plugin packaging plus `AGENTS.md` fallback; Gemini uses extension packaging plus `GEMINI.md` context — [runtime-command-surface.md](runtime-command-surface.md).

## Primary commands

```bash
npx ai-engineering-harness install
npx ai-engineering-harness update
npx ai-engineering-harness uninstall
npx ai-engineering-harness uninstall --all
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

Windows notes:

- Primary lifecycle commands run natively on Node.js; PowerShell can use `npx ai-engineering-harness ...` directly.
- In Windows PowerShell, `curl` is usually an alias for `Invoke-WebRequest`, so shell pipeline examples need `curl.exe`.
- Private git hygiene (`.git/info/exclude`) requires the target to be a Git repo; run `git init` or install inside a cloned repository.
- PowerShell profile warnings (for example PSReadLine prediction) are unrelated to ai-engineering-harness.

Windows PowerShell examples:

```powershell
npx ai-engineering-harness install --provider cursor --yes
```

Dogfood evidence: [scenario-f1-simple-cli-lifecycle.md](pack-dogfood-reports/scenario-f1-simple-cli-lifecycle.md).

## Defaults

### Install

- target: current directory
- provider: auto-detect
- scope: project
- visibility: private
- ignore strategy: info-exclude
- init `.harness/`: yes when missing
- install `.ai-harness/`: yes

### Update

- target: current directory
- provider: auto-detect from installed runtime files
- scope: project
- refresh `.ai-harness/`
- refresh runtime entrypoint
- preserve `.harness/`

### Uninstall

- target: current directory
- provider: auto-detect from installed runtime files
- scope: project
- remove runtime entrypoint
- remove `.git/info/exclude` harness block when present
- keep `.ai-harness/`
- keep `.harness/`

After default uninstall, kept `.ai-harness/` and `.harness/` may become visible in `git status` because the local exclude block is removed.

## Runtime Detection

Installed runtime detection order:

- `.cursor/commands/harness-plan.md` or `.cursor/rules/ai-engineering-harness.mdc` → `cursor`
- `.claude/CLAUDE.md` → `claude`
- `.gemini/extensions/ai-engineering-harness/GEMINI.md` → `gemini`
- `AGENTS.md` containing `ai-engineering-harness` → `generic`

Legacy `.opencode/plugins/ai-engineering-harness.js` may still be detected for **uninstall** only (OpenCode removed from install scope v0.11.0).

Install-time provider detection uses project hints such as `.cursor/`, `.claude/`, `.gemini/`, or a harness-owned `AGENTS.md`.

If no provider can be detected:

- interactive CLI: prompt for provider
- non-interactive CLI: fail and require `--provider`

Manual fallback is still supported explicitly with `--runtime manual` or `--legacy-root`, but it is no longer the default non-interactive path.

## Entrypoints

- `npx ai-engineering-harness` / `bin/aih.js` — **primary** interactive CLI (v0.11.x)
- legacy shell bootstrap docs live in the archive
- npm bin aliases: `ai-engineering-harness`, `aih`

## Install

`install` now behaves like the default CLI entrypoint for project adoption. In a detectable Cursor repo, it should install:

- `.ai-harness/`
- `.harness/`
- `.cursor/commands/`
- `.cursor/rules/`
- `.git/info/exclude` harness block

## Update

`update` refreshes `.ai-harness/` and the selected runtime entrypoint with overwrite semantics. It preserves `.harness/`.

Without `--visibility`, update does not change `.git/info/exclude`. With `--visibility private`, it refreshes the harness block.

## Uninstall

`uninstall` removes only the detected runtime entrypoint by default. `--all` performs full project cleanup:

- remove runtime entrypoints
- remove `.ai-harness/`
- remove `.harness/`
- remove `.git/info/exclude` harness block

## Status

`status` prints lightweight local state:

- target
- Git repo yes/no
- detected runtimes
- `.ai-harness/` exists yes/no
- `.harness/` exists yes/no
- `.git/info/exclude` harness block exists yes/no

## Doctor

`doctor` performs local checks without network:

- Node available
- target is a Git repo
- `.ai-harness/` exists
- runtime entrypoint exists
- runtime entrypoint references `.ai-harness/`
- `.harness/` exists
- `.git/info/exclude` harness block status

## Advanced Flags

Primary CLI flags:

- `--provider`
- `--runtime` (deprecated alias)
- `--scope`
- `--visibility`
- `--target`
- `--dry-run`
- `--yes`
- `--verbose`
- `--all`

## Examples

```bash
npx ai-engineering-harness install
npx ai-engineering-harness update
npx ai-engineering-harness uninstall
npx ai-engineering-harness uninstall --all
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```
