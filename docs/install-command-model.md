# Install Command Model

## Purpose

Define the primary Node.js lifecycle CLI model for `v1.0.x`: simple verbs with smart defaults for `npx ai-engineering-harness`.

Canonical scope: `npx ai-engineering-harness` lifecycle commands, defaults, and flags.

Use this document as the primary CLI command/flag source of truth. For historical installer design notes, see the archived install docs under `docs/internal/archive/install/`. For per-runtime payload paths and follow-up actions after runtime-native install, see [runtime-native-install.md](runtime-native-install.md).

**Current surface (v1.0.x):** primary lifecycle commands run in-process on Node.js.

## Commands

```bash
npx ai-engineering-harness install
npx ai-engineering-harness uninstall
npx ai-engineering-harness update
npx ai-engineering-harness status
npx ai-engineering-harness doctor
npx ai-engineering-harness help
```

### Backward compatibility

| Surface | Notes |
|---|---|
| `--runtime <id>` | Deprecated alias for `--provider <id>` in the Node CLI |
| `--legacy-root` | Deprecated alias for the legacy flat-root install path |

## Recommended Commands

```bash
npx ai-engineering-harness install
npx ai-engineering-harness update
npx ai-engineering-harness uninstall
npx ai-engineering-harness uninstall --all
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

## Defaults

### Install

- target: current directory
- provider: auto-detect from repo hints
- scope: `project`
- visibility: `private`
- ignore strategy: `info-exclude`
- init harness: enabled when `.harness/` does not exist
- install cache: enabled for project runtime-native install

If a provider cannot be detected:

- interactive CLI: prompt for provider
- non-interactive CLI: fail clearly and require `--provider`

### Update

- target: current directory
- provider: auto-detect from installed runtime entrypoints
- scope: `project`
- refresh `.ai-harness/`
- refresh runtime entrypoint
- preserve `.harness/`
- leave `.git/info/exclude` unchanged unless `--visibility private` is passed

### Uninstall

- target: current directory
- provider: auto-detect from installed runtime entrypoints
- scope: `project`
- remove runtime entrypoint
- remove harness block from `.git/info/exclude` when present
- keep `.ai-harness/`
- keep `.harness/`

`--all` is shorthand for full project cleanup: runtime entrypoints + cache + state + exclude cleanup.

## Flags

| Flag | Applies to | Meaning |
|---|---|---|
| `--target <path>` | all | Product repo or cwd (default `.`) |
| `--provider <list>` | install, update, uninstall | Comma-separated providers |
| `--runtime <list>` | install, update, uninstall | Deprecated alias for `--provider` |
| `--scope <name>` | install, uninstall, update | `global` \| `project` |
| `--visibility <name>` | install, update | `private` \| `shared` |
| `--all` | uninstall | Full project cleanup (runtime entrypoints + cache + state + exclude block) |
| `--dry-run` | all | Plan only |
| `--yes` | all | Skip prompts |
| `--verbose` | install, update, uninstall, status, doctor | Show raw backend output |

The primary Node CLI does **not** expose shell-era lifecycle flags such as `--ref`, `--init-harness`, `--install-cache`, `--remove-cache`, or `--remove-state`. In the Node CLI, `.harness/` init and capability-cache install are inferred from the selected mode and current repo state.

### Install mode behavior

The primary Node CLI infers ignore behavior from install mode:

- project + private -> `.git/info/exclude`
- project + shared -> no ignore/edit
- global -> no project ignore/edit

The CLI does not expose `--ignore-strategy`; `.gitignore` edits are handled internally by the Node CLI when private install mode requires them.

## Project Visibility

| `--visibility` | Exclude / ignore | `git status` |
|---|---|---|
| `shared` | none | Shows new generated files |
| `private` | `.git/info/exclude` preferred | Hides new untracked generated paths |

## Non-Interactive Examples

```bash
# Simple install with provider detection
npx ai-engineering-harness install

# Private Cursor — explicit non-interactive form
npx ai-engineering-harness install --provider cursor --scope project --visibility private --yes

# Shared team install
npx ai-engineering-harness install --provider cursor --scope project --visibility shared --yes

npx ai-engineering-harness update --provider cursor --yes
npx ai-engineering-harness uninstall --provider cursor --yes
npx ai-engineering-harness uninstall --all --yes
```

## Related Docs

- [git-hygiene-policy.md](git-hygiene-policy.md)
- [runtime-native-install.md](runtime-native-install.md)
- [simple-cli-ux.md](simple-cli-ux.md)
- [uninstall-update-design.md](uninstall-update-design.md)
