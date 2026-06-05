# Install Command Model

## Purpose

Define the `aih.sh` CLI model for `v0.9.2`: simple verbs with smart defaults, plus backward compatibility for the explicit `v0.9.1` flag surface through `install.sh`.

Canonical scope: `aih.sh` lifecycle commands, defaults, and flags.

Use this document as the command/flag source of truth. For remote `install.sh` wrapper behavior, review-before-run flows, and manual fallback entrypoints, see [install-sh-usage.md](install-sh-usage.md). For per-runtime payload paths and follow-up actions after runtime-native install, see [runtime-native-install.md](runtime-native-install.md).

**Implemented (v0.9.2 Step 5):** simple `install` / `update` / `uninstall` defaults, runtime auto-detection, lightweight `status` / `doctor`, private `.git/info/exclude` hygiene, project uninstall, and project update. Global update remains planned-only.

## Commands

```bash
aih.sh install
aih.sh uninstall
aih.sh update
aih.sh status
aih.sh doctor
aih.sh help
```

### Backward compatibility

| Legacy (v0.9.1) | Maps to |
|---|---|
| `install.sh --runtime cursor ...` | `aih.sh install --runtime cursor ...` via wrapper |
| `install.sh` (no args, interactive) | `aih.sh install` wizard via wrapper |
| `curl \| sh` on `install.sh` (no args) | fetch `aih.sh` and run `install` flow |
| `--legacy-root` | `install --runtime manual` |

## Recommended Commands

```bash
sh aih.sh install
sh aih.sh update
sh aih.sh uninstall
sh aih.sh uninstall --all
sh aih.sh status
sh aih.sh doctor
```

## Defaults

### Install

- target: current directory
- runtime: auto-detect from provider hints in the repo
- scope: `project`
- visibility: `private`
- ignore strategy: `info-exclude`
- init harness: enabled when `.harness/` does not exist
- install cache: enabled for project runtime-native install

If runtime cannot be detected:

- interactive shell: prompt for provider
- non-interactive shell: fail clearly and require `--runtime`

### Update

- target: current directory
- runtime: auto-detect from installed runtime entrypoints
- scope: `project`
- refresh `.ai-harness/`
- refresh runtime entrypoint
- preserve `.harness/`
- leave `.git/info/exclude` unchanged unless `--visibility private` is passed

### Uninstall

- target: current directory
- runtime: auto-detect from installed runtime entrypoints
- scope: `project`
- remove runtime entrypoint
- remove harness block from `.git/info/exclude` when present
- keep `.ai-harness/`
- keep `.harness/`

`--all` is shorthand for full project cleanup: runtime `all` + remove cache + remove state.

## Flags

| Flag | Applies to | Meaning |
|---|---|---|
| `--target <path>` | all | Product repo or cwd (default `.`) |
| `--runtime <list>` | all | Comma-separated providers |
| `--scope <name>` | install, uninstall, update | `global` \| `project` |
| `--visibility <name>` | install, update | `private` \| `shared` |
| `--ignore-strategy <name>` | install, update | `info-exclude` \| `gitignore` \| `none` \| `auto` |
| `--init-harness` | install | Scaffold `.harness/` (project scope) |
| `--install-cache` | install | Force capability cache install |
| `--no-install-cache` | install, update | Disable cache install for `install`; rejected for `update` |
| `--remove-cache` | uninstall | Remove `.ai-harness/` |
| `--remove-state` | uninstall | Remove `.harness/` |
| `--all` | uninstall | Runtime `all` + `--remove-cache` + `--remove-state` |
| `--dry-run` | all | Plan only |
| `--force` | all | Overwrite harness-owned files |
| `--yes` | all | Skip prompts |
| `--ref <git-ref>` | install, update | Pack tarball ref |

Removed / deprecated aliases:

- `--ignore-generated` → use `--visibility private --ignore-strategy info-exclude`
- `--no-ignore` → `--ignore-strategy none`

### `--ignore-strategy`

| Value | Behavior |
|---|---|
| `info-exclude` | Append delimited block to `.git/info/exclude` (private + Git repo) |
| `gitignore` | Append delimited block to `.gitignore` — **explicit only** |
| `none` | No exclude/gitignore edits |
| `auto` | Interactive: private → `info-exclude`; shared → `none` |

Global install: ignore strategy **ignored** for project files.

**Do not** default to editing `.gitignore`.

## Project Visibility

| `--visibility` | Exclude / ignore | `git status` |
|---|---|---|
| `shared` | none | Shows new generated files |
| `private` | `.git/info/exclude` preferred | Hides new untracked generated paths |

## Non-Interactive Examples

```bash
# Simple install with provider detection
sh aih.sh install

# Private Cursor — explicit advanced form
sh aih.sh install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes

# Shared team install
sh aih.sh install --runtime cursor --scope project --visibility shared --init-harness --yes

# Explicit .gitignore (user opted in — creates .gitignore diff)
sh aih.sh install --runtime cursor --scope project --visibility private --ignore-strategy gitignore --init-harness --yes

sh aih.sh update
sh aih.sh uninstall
sh aih.sh uninstall --all
```

## Remote One-Line

```bash
curl -fsSL .../aih.sh | sh -s -- install
```

`install.sh` remains available as a compatibility wrapper. See [install-sh-usage.md](install-sh-usage.md) for remote wrapper behavior and safety guidance.

## Related Docs

- [git-hygiene-policy.md](git-hygiene-policy.md)
- [install-sh-usage.md](install-sh-usage.md)
- [runtime-native-install.md](runtime-native-install.md)
- [simple-cli-ux.md](simple-cli-ux.md)
- [uninstall-update-design.md](uninstall-update-design.md)
