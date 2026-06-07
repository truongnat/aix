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

## Shell fallback

`aih.sh` / `install.sh` still exist for remote bootstrap, shell-only ref pinning, and legacy/manual fallback flows. They are not the primary day-to-day lifecycle UX. For the shell wrapper contract, see [install-sh-usage.md](install-sh-usage.md).

## Problem (shell advanced)

The installer worked, but the user-facing command was exposing too many internal switches:

```bash
sh install.sh install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
```

That is useful for debugging, not as the main adoption UX.

## Primary commands

```bash
npx ai-engineering-harness install
npx ai-engineering-harness update
npx ai-engineering-harness uninstall
npx ai-engineering-harness uninstall --all
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

Remote one-line usage is a bootstrap fallback, not the primary lifecycle loop:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --runtime cursor --scope project --yes
```

Windows notes:

- Primary lifecycle commands run natively on Node.js; PowerShell can use `npx ai-engineering-harness ...` directly.
- In Windows PowerShell, `curl` is usually an alias for `Invoke-WebRequest`, so shell pipeline examples need `curl.exe`.
- Use Git Bash or WSL only when you intentionally want the shell/bootstrap fallback.
- `aih.ps1` remains an experimental bootstrap helper for the shell path.
- Private git hygiene (`.git/info/exclude`) requires the target to be a Git repo; run `git init` or install inside a cloned repository.
- PowerShell profile warnings (for example PSReadLine prediction) are unrelated to ai-engineering-harness.

Windows PowerShell examples:

```powershell
npx ai-engineering-harness install --provider cursor --yes
irm https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.ps1 | iex
```

Recommended explicit PowerShell execution:

```powershell
$script = "$env:TEMP\aih.ps1"
Invoke-WebRequest https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.ps1 -OutFile $script
powershell -ExecutionPolicy Bypass -File $script install -Runtime cursor -Yes
powershell -ExecutionPolicy Bypass -File $script status
powershell -ExecutionPolicy Bypass -File $script doctor
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
- `aih.sh` — legacy shell fallback
- `install.sh` — remote/bootstrap compatibility wrapper
- `aih.ps1` — experimental Windows bootstrap helper for the shell path
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

Shell/bootstrap-only flags such as `--ref`, `--init-harness`, `--install-cache`, `--remove-cache`, and `--remove-state` belong to [install-sh-usage.md](install-sh-usage.md), not the primary `npx` surface.

## Backward Compatibility

Existing explicit commands still work:

```bash
sh aih.sh install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
```

The simplified CLI is an additive UX improvement, not a breaking change.

## Examples

```bash
npx ai-engineering-harness install
npx ai-engineering-harness update
npx ai-engineering-harness uninstall
npx ai-engineering-harness uninstall --all
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```
