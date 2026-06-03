# Install Command Model

## Purpose

Define the `install.sh` **verb** model for `v0.9.2`: `install`, `uninstall`, and `update`, with backward compatibility for `v0.9.1` flags.

Design only in this milestone — implementation follows [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md).

## Commands

```bash
install.sh install    # default verb — runtime-native or manual fallback
install.sh uninstall  # remove harness-owned files for selected runtime/scope
install.sh update     # refresh payloads from pack ref (pin or main)
install.sh help       # usage
```

### Backward compatibility

| Legacy (v0.9.1) | Maps to |
|---|---|
| `install.sh --runtime cursor ...` | `install.sh install --runtime cursor ...` |
| `install.sh` (no args, interactive) | `install.sh install` wizard |
| `curl \| sh` (no args) | `install.sh install` with fallback warning if non-interactive |
| `--legacy-root` | `install --runtime manual` |

First positional argument, if present and not a flag, is the verb:

```bash
sh install.sh install --runtime cursor --scope project --yes
sh install.sh uninstall --runtime cursor --scope project --yes
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --yes
```

## Flags (install / uninstall / update)

| Flag | Applies to | Meaning |
|---|---|---|
| `--target <path>` | all | Product repo or cwd (default `.`) |
| `--runtime <list>` | all | Comma-separated: `cursor`, `claude`, `codex`, `gemini`, `opencode`, `antigravity`, `generic`, `all`, `manual` |
| `--scope <name>` | install, uninstall, update | `global` \| `project` \| `auto` |
| `--visibility <name>` | install | `private` \| `shared` — git hygiene ([git-hygiene-policy.md](git-hygiene-policy.md)) |
| `--init-harness` | install | Scaffold `.harness/` (project scope only) |
| `--ignore-generated` | install | Alias: private + gitignore block |
| `--no-ignore` | install | Never edit `.gitignore` |
| `--dry-run` | all | Plan only |
| `--force` | all | Overwrite existing harness-owned files |
| `--yes` | all | Skip prompts |
| `--ref <git-ref>` | install, update | Pack version (tag/branch) for tarball |
| `--help` | all | Usage |

### Scope `auto`

Detection order (design):

1. If `--scope` set explicitly → use it.
2. Interactive wizard → user picks global / project shared / project private.
3. Non-interactive `--scope auto`:
   - If only global paths would be written and no `--init-harness` → suggest `global` (or fail if ambiguous).
   - If `--init-harness` → force `project`.
   - Default safe choice: `project` with warning when `auto` cannot decide.

## Provider Selection

- **Multi-runtime:** `--runtime cursor,claude` runs install sequence per runtime (same scope/visibility unless overridden later).
- **Interactive:** checkbox-style multi-select (see [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md)).
- **`all`:** sequential install — still **experimental**; not recommended without explicit `--yes`.
- **`manual`:** legacy root copy via `install.js` — separate code path; visibility/shared applies to `.harness/` only if `--init-harness`.

## Project Visibility

Maps to [git-hygiene-policy.md](git-hygiene-policy.md):

| `--visibility` | `.gitignore` | User intent |
|---|---|---|
| `shared` | no auto-edit | Commit harness + runtime files |
| `private` | delimited block | Local/private; reduce Git noise |
| (unset) interactive | ask | — |
| (unset) CI `--yes` | error or require flag | Avoid silent wrong policy |

Harness init sub-choice (interactive):

1. Yes — private (ignore `.harness/`)
2. Yes — team-shared (commit `.harness/`)
3. No — skip init

## Non-Interactive Examples

```bash
# Install Cursor privately in current repo
sh install.sh install --runtime cursor --scope project --visibility private --init-harness --yes

# Multi-provider shared team install
sh install.sh install --runtime cursor,generic --scope project --visibility shared --init-harness --yes

# Uninstall Cursor project files only
sh install.sh uninstall --runtime cursor --scope project --yes

# Update from tag
sh install.sh update --runtime cursor --scope project --ref v0.9.2 --yes

# Legacy v0.9.1 style (still valid)
sh install.sh --runtime cursor --scope project --init-harness --yes
```

## Remote One-Line

```bash
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- install --runtime cursor --scope project --visibility private --init-harness --yes
```

Pin:

```bash
curl -fsSL .../install.sh | sh -s -- --ref v0.9.2 install --runtime cursor --scope project --visibility private --init-harness --yes
```

## What Does Not Change in v0.9.2 Design Step

- No new `install-runtime.js` writes in design-only milestone.
- `validate.js` target validation flags unchanged until implementation.
- `install.js` export surface unchanged.

## Related Docs

- [uninstall-update-design.md](uninstall-update-design.md)
- [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md)
- [install-sh-usage.md](install-sh-usage.md) — update when implemented
