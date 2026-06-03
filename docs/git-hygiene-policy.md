# Git Hygiene Policy

## Purpose

Define how `ai-engineering-harness` installs should interact with Git in product repositories: when generated files are intended to be committed, when they should stay private/local, and how the installer may update `.gitignore`.

This policy is **first-class** for `v0.9.2` — not an afterthought.

## Problem

After real Cursor project install (`v0.9.1`):

- `.harness/` was created but **not** auto-ignored — Git shows new untracked files without a clear team vs private policy.
- Runtime files (e.g. `.cursor/rules/ai-engineering-harness.mdc`) appear as **dirty** working tree changes — correct Git behavior, but surprising if the user expected a “private/local” install.
- Users may want **team-shared** harness config (commit) or **private** harness (ignore) — the installer must ask, not assume.

Global install must **not** modify project `.gitignore`.

## Generated Files

Files the installer may create (project scope):

| Path | Runtime | Notes |
|---|---|---|
| `.harness/` | init | Profile + goals scaffold |
| `.cursor/rules/ai-engineering-harness.mdc` | cursor, windsurf | Project rule file |
| `AGENTS.md` | generic, codex, manual | Bootstrap |
| `.claude/CLAUDE.md` | claude | Project bootstrap |
| `.claude/settings.json` | claude | Merge or create |
| `.gemini/extensions/ai-engineering-harness/` | gemini | Project-local extension (best-effort) |
| `.opencode/plugins/ai-engineering-harness.js` | opencode | Plugin file |
| `opencode.json` | opencode | May be **shared project config** — see below |

Global scope writes under home directories only — see [project-state-policy.md](project-state-policy.md).

## Project Shared vs Project Private

### Team-shared (visibility: `shared`)

- User intends generated harness/runtime files to be **committed** and reviewed with the team.
- Installer **does not** add paths to `.gitignore`.
- Installer prints which files are intended for version control.
- Typical for: `.harness/TEAM.md`, `.cursor/rules/ai-engineering-harness.mdc`, team `AGENTS.md`.

### Project private (visibility: `private`)

- User does **not** want Git noise from harness install in day-to-day work (or wants local-only trial).
- Installer adds a **delimited** block to `.gitignore` (only with explicit consent — see below).
- `.harness/` and runtime bootstrap paths for selected providers go in the block.
- User can still commit later by removing lines from `.gitignore`.

## Global Install

- Writes to `~/.cursor/`, `~/.claude/`, `~/.codex/`, `~/.gemini/`, `~/.config/opencode/`, etc.
- **Must not** create `.harness/` at global scope (already rejected).
- **Must not** edit project `.gitignore`.
- Each product repo still needs project `.harness/` init when the team wants per-repo state.

## .gitignore Strategy

### Delimited block (private mode)

When user chooses **project private** (or `--visibility private` / `--ignore-generated`), installer may append:

```gitignore
# ai-engineering-harness start
.harness/
.cursor/rules/ai-engineering-harness.mdc
.claude/CLAUDE.md
.claude/settings.json
.gemini/extensions/ai-engineering-harness/
.opencode/plugins/ai-engineering-harness.js
# ai-engineering-harness end
```

Rules:

- Only include paths for **runtimes actually installed** in this run (subset of block).
- If block already exists, **merge** new paths into existing block — do not duplicate markers.
- **Never** auto-ignore unrelated project files.
- **Never** auto-ignore user-owned files that pre-existed without confirmation (see Existing File Handling).

### `opencode.json` exception

`opencode.json` may contain non-harness project configuration. Policy:

- **Default private mode:** do **not** ignore whole `opencode.json`; ignore only `.opencode/plugins/ai-engineering-harness.js` unless user explicitly opts in to ignore `opencode.json` (interactive sub-prompt).
- **Shared mode:** do not ignore; user commits merged `opencode.json` if desired.

### Opt-out flags

| Flag | Behavior |
|---|---|
| `--visibility private` | Apply gitignore block for installed paths (after consent in interactive) |
| `--visibility shared` | No gitignore changes |
| `--ignore-generated` | Alias for private gitignore behavior |
| `--no-ignore` | Never edit `.gitignore` even in private mode |

Interactive default question:

> Do you want generated harness/runtime files committed to this repo?
> 1) Yes — team-shared (commit runtime + `.harness/`)
> 2) No — private/local (add to `.gitignore`)
> 3) Ask me per path (future; v0.9.2 may use runtime subset only)

## What Installer May Edit

- `.gitignore` — append or update **only** the delimited `# ai-engineering-harness start` … `end` block, when user chose private or passed `--visibility private` / `--ignore-generated`.
- Files listed in [runtime-native-install-audit.md](runtime-native-install-audit.md) for selected runtime + scope.
- `.harness/` skeleton when `--init-harness` (project scope).

## What Installer Must Never Edit

- Unrelated `.gitignore` lines outside the harness block.
- `.env`, secrets, credentials, customer data.
- User source code, lockfiles, CI config (unless future explicit feature).
- Existing user-owned config without `--force` and clear dry-run disclosure.

## Dirty Working Tree Handling

Before write install (non-dry-run):

1. If Git repo detected and working tree has changes under paths we will write:
   - Print warning listing paths.
   - In interactive mode: offer abort, continue, or switch to private + gitignore.
2. Do not claim install is “git clean” after project writes — only that private mode **intends** to reduce future noise via `.gitignore`.

## Existing File Handling

| Situation | Policy |
|---|---|
| Path exists, no `--force` | Skip with message (current behavior) |
| Path exists, user-owned content differs | Do not overwrite; suggest `--force` or manual merge |
| `.gitignore` exists, no harness block | Append block at EOF |
| `.gitignore` exists, harness block present | Merge paths into block |
| Not a Git repo | Skip gitignore update with note; still allow install |

## Recommended Defaults

| Context | Default visibility | `.gitignore` |
|---|---|---|
| Interactive, Git repo, first install | **Ask** (no silent default) | Only if user picks private |
| Non-interactive `--visibility private` | private | Yes (if Git repo) |
| Non-interactive `--visibility shared` | shared | No |
| Global scope | N/A | Never touch project `.gitignore` |
| CI / `--yes` without visibility | **Fail** or require `--visibility` — do not guess |

## Examples

**Private Cursor + harness init:**

```bash
sh install.sh install --runtime cursor --scope project --visibility private --init-harness --yes
```

Expected: `.cursor/rules/ai-engineering-harness.mdc`, `.harness/`, gitignore block with those paths.

**Shared team install:**

```bash
sh install.sh install --runtime cursor --scope project --visibility shared --init-harness --yes
```

Expected: files created; `.gitignore` unchanged; message explains files are for commit.

**Global Cursor — no project git changes:**

```bash
sh install.sh install --runtime cursor --scope global --yes
```

Expected: writes under `~/.cursor/` only; project `.gitignore` untouched.

## Related Docs

- [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md)
- [project-state-policy.md](project-state-policy.md)
- [uninstall-update-design.md](uninstall-update-design.md)
