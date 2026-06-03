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

After install, use the local command catalog (`harness:plan`, `harness:verify`, …). Ask the agent explicitly on fallback-only providers — [runtime-command-surface.md](runtime-command-surface.md).

## Shell fallback

The installer also supports `aih.sh` / `install.sh` for CI and environments without Node. Historical problem: too many flags on one line:

## Problem (shell advanced)

The installer worked, but the user-facing command was exposing too many internal switches:

```bash
sh install.sh install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
```

That is useful for debugging, not as the main adoption UX.

## Simple Commands

```bash
sh aih.sh install
sh aih.sh update
sh aih.sh uninstall
sh aih.sh uninstall --all
sh aih.sh status
sh aih.sh doctor
```

Remote one-line usage should also be simple:

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- update
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- uninstall
```

Windows notes:

- In Windows PowerShell, `curl` is usually an alias for `Invoke-WebRequest`, so `curl -fsSL ...` fails there.
- Use `curl.exe` if you want the shell pipeline form from PowerShell, or use `aih.ps1` for a copy-paste-friendly bootstrap.
- Use Git Bash or WSL when you want a native `sh` environment.
- `aih.ps1` is the experimental PowerShell bootstrap wrapper for `install`, `status`, `doctor`, `update`, `uninstall`, and `help`.
- Pass `-Yes` (maps to `--yes`) to skip the `Proceed? [y/N]` confirmation in non-interactive copy-paste flows.
- Private git hygiene (`.git/info/exclude`) requires the target to be a Git repo; run `git init` or install inside a cloned repository.
- PowerShell profile warnings (for example PSReadLine prediction) are unrelated to ai-engineering-harness.

Windows PowerShell examples:

```powershell
curl.exe -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/aih.sh | sh -s -- install --runtime cursor --yes
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
- runtime: auto-detect
- scope: project
- visibility: private
- ignore strategy: info-exclude
- init `.harness/`: yes when missing
- install `.ai-harness/`: yes

### Update

- target: current directory
- runtime: auto-detect from installed runtime files
- scope: project
- refresh `.ai-harness/`
- refresh runtime entrypoint
- preserve `.harness/`

### Uninstall

- target: current directory
- runtime: auto-detect from installed runtime files
- scope: project
- remove runtime entrypoint
- remove `.git/info/exclude` harness block when present
- keep `.ai-harness/`
- keep `.harness/`

After default uninstall, kept `.ai-harness/` and `.harness/` may become visible in `git status` because the local exclude block is removed.

## Runtime Detection

Installed runtime detection order:

- `.cursor/rules/ai-engineering-harness.mdc` → `cursor`
- `.claude/CLAUDE.md` → `claude`
- `.gemini/extensions/ai-engineering-harness/GEMINI.md` → `gemini`
- `AGENTS.md` containing `ai-engineering-harness` → `generic`

Legacy `.opencode/plugins/ai-engineering-harness.js` may still be detected for **uninstall** only (OpenCode removed from install scope v0.11.0).

Install-time provider detection uses project hints such as `.cursor/`, `.claude/`, `.gemini/`, or a harness-owned `AGENTS.md`.

If no provider can be detected:

- interactive shell: prompt for provider
- non-interactive shell: fail and require `--runtime`

Manual fallback is still supported explicitly with `--runtime manual` or `--legacy-root`, but it is no longer the default non-interactive path.

## Entrypoints

- `npx ai-engineering-harness` / `bin/aih.js` — **primary** interactive CLI (v0.11.x)
- `aih.sh` — lifecycle backend and shell fallback
- `install.sh` — compatibility wrapper around `aih.sh`
- `aih.ps1` — experimental Windows bootstrap (downloads `aih.sh`, requires `sh`)
- npm bin aliases: `ai-engineering-harness`, `aih`

## Install

`install` now behaves like the default CLI entrypoint for project adoption. In a detectable Cursor repo, it should install:

- `.ai-harness/`
- `.harness/`
- `.cursor/rules/ai-engineering-harness.mdc`
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

Advanced flags remain supported:

- `--runtime`
- `--scope`
- `--visibility`
- `--ignore-strategy`
- `--init-harness`
- `--install-cache`
- `--no-install-cache`
- `--remove-cache`
- `--remove-state`
- `--target`
- `--ref`
- `--dry-run`
- `--yes`
- `--force`

## Backward Compatibility

Existing explicit commands still work:

```bash
sh aih.sh install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
```

The simplified CLI is an additive UX improvement, not a breaking change.

## Examples

```bash
sh aih.sh install
sh aih.sh update
sh aih.sh uninstall
sh aih.sh uninstall --all
sh aih.sh status
sh aih.sh doctor
```
