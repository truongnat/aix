# Install Command Model

## Purpose

Define the `install.sh` **verb** model for `v0.9.2`: `install`, `uninstall`, and `update`, with backward compatibility for `v0.9.1` flags.

**Partially implemented (v0.9.2 Step 1):** `install` verb alias, `--visibility`, `--ignore-strategy`, private `.git/info/exclude`. `uninstall` / `update` remain design-only. See [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md).

## Commands

```bash
install.sh install
install.sh uninstall
install.sh update
install.sh help
```

### Backward compatibility

| Legacy (v0.9.1) | Maps to |
|---|---|
| `install.sh --runtime cursor ...` | `install.sh install --runtime cursor ...` |
| `install.sh` (no args, interactive) | `install.sh install` wizard |
| `curl \| sh` (no args) | `install.sh install` with fallback warning if non-interactive |
| `--legacy-root` | `install --runtime manual` |

## Flags (install / uninstall / update)

| Flag | Applies to | Meaning |
|---|---|---|
| `--target <path>` | all | Product repo or cwd (default `.`) |
| `--runtime <list>` | all | Comma-separated providers |
| `--scope <name>` | install, uninstall, update | `global` \| `project` \| `auto` |
| `--visibility <name>` | install | `private` \| `shared` |
| `--ignore-strategy <name>` | install | `info-exclude` \| `gitignore` \| `none` \| `auto` |
| `--init-harness` | install | Scaffold `.harness/` (project scope) |
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

### Recommended defaults

| Context | Defaults |
|---|---|
| Interactive project | Ask visibility; private → `info-exclude` via `auto` |
| `--visibility private --yes` | Require `--ignore-strategy info-exclude` (or `auto`) — warn if omitted |
| `--visibility shared` | `--ignore-strategy none` |
| Global | visibility N/A; no project exclude |

**Do not** default to editing `.gitignore`.

## Project Visibility

| `--visibility` | Exclude / ignore | `git status` |
|---|---|---|
| `shared` | none | Shows new generated files |
| `private` | `.git/info/exclude` preferred | Hides new untracked generated paths |

## Non-Interactive Examples

```bash
# Private Cursor — no tracked ignore file change (v0.9.2 Step 1 target)
sh install.sh install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes

# Shared team install
sh install.sh install --runtime cursor --scope project --visibility shared --init-harness --yes

# Explicit .gitignore (user opted in — creates .gitignore diff)
sh install.sh install --runtime cursor --scope project --visibility private --ignore-strategy gitignore --init-harness --yes

sh install.sh uninstall --runtime cursor --scope project --yes
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --yes
```

## Remote One-Line

```bash
curl -fsSL .../install.sh | sh -s -- install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
```

## Related Docs

- [git-hygiene-policy.md](git-hygiene-policy.md)
- [uninstall-update-design.md](uninstall-update-design.md)
- [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md)
