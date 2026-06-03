# Git Hygiene Policy

## Purpose

Define how `ai-engineering-harness` installs interact with Git in product repositories: private/local vs team-shared generated files, and **where** ignore rules live.

**v0.9.2 principle:** `.gitignore` is usually **tracked** — editing it creates a repo change. Private/local installs should prefer **`.git/info/exclude`**, which is local to the checkout and **not committed**.

**Implementation (Step 1):** [install.sh](../install.sh) writes `.git/info/exclude` when `--visibility private` (default strategy `info-exclude`). See [private-install-git-hygiene.md](private-install-git-hygiene.md).

## Problem

After real Cursor project install (`v0.9.1`):

- `.harness/` and runtime files show up in `git status` — expected for **shared** mode, surprising for **private** mode.
- Auto-editing `.gitignore` as the default private strategy is **wrong**: `.gitignore` itself becomes a tracked change and encodes a team policy the installer should not impose silently.
- Users need: personal harness in a shared repo **without** dirtying the working tree or committing installer policy.

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

### Team-shared (`--visibility shared`)

- Generated harness/runtime files are **intended to appear** in `git status` so the user can review and commit.
- Installer **does not** add ignore rules to `.git/info/exclude` or `.gitignore`.
- Installer explains which paths are meant for version control.

### Project private (`--visibility private`)

- User wants harness/runtime files **on disk** but **not** in day-to-day `git status` noise for this checkout.
- Installer prefers **`.git/info/exclude`** (see below).
- **Does not** modify `.gitignore` unless user explicitly chooses that strategy.

Interactive question (recommended wording):

> Should generated harness/runtime files be **private to this checkout** or **shared with the repo** (commit)?

## Global Install

- Writes to `~/.cursor/`, `~/.claude/`, `~/.codex/`, `~/.gemini/`, `~/.config/opencode/`, etc.
- **Must not** create `.harness/` at global scope (already rejected).
- **Must not** edit project `.gitignore` or `.git/info/exclude`.
- Each product repo still needs project `.harness/` init when the team wants per-repo state.

## Git Exclude Strategy

Priority order for **private** project installs:

```txt
1. Git repo + .git/info/exclude available
   → append delimited block to .git/info/exclude
   → no tracked file changes from ignore policy

2. Not a Git repo, or exclude unavailable, or user chose --ignore-strategy none
   → print manual ignore instructions; still install files

3. User explicitly chooses .gitignore (interactive or --ignore-strategy gitignore)
   → ask/confirm; then append delimited block to .gitignore only with consent
```

| Mode | Ignore target | Tracked repo change from ignore policy? |
|---|---|---|
| `private` + `info-exclude` (default for private) | `.git/info/exclude` | **No** |
| `private` + `gitignore` (explicit only) | `.gitignore` | **Yes** (`.gitignore` diff) |
| `shared` | none | N/A — files visible in status |
| `global` | none (project) | N/A |

## `.git/info/exclude`

Per-repo, local ignore file (same syntax as `.gitignore`). **Not committed.**

### Delimited block (private mode, preferred)

When user chooses **private/local** and strategy is `info-exclude` (default for private):

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

- Only paths for **runtimes actually installed** in this run.
- Merge into existing block if markers already present.
- **Never** silently edit `.git/info/exclude` without `--visibility private` or interactive private choice.
- Create `.git/info/` if missing (Git creates on first exclude write).

After install + exclude block, `git status` should **not** list those generated paths (unless already tracked — see Existing File Handling).

## `.gitignore`

Use **only** when:

- User explicitly selects “use `.gitignore`” in interactive flow, or
- `--ignore-strategy gitignore` with `--visibility private`, or
- `.git/info/exclude` unavailable **and** user confirms `.gitignore` edit in interactive mode.

**Never** edit `.gitignore` by default for private mode.

Team-wide “nobody commits `.harness/`” is a **project policy** decision — not the installer’s default.

Same delimited marker format as exclude file.

### `opencode.json` exception

- **Private + info-exclude:** ignore `.opencode/plugins/ai-engineering-harness.js` only; not whole `opencode.json` unless user opts in.
- **Shared:** do not ignore.

## What Installer May Edit

| File | When |
|---|---|
| `.git/info/exclude` | Private/local + `info-exclude` strategy + Git repo + user consent (flag or interactive) |
| `.gitignore` | Private + explicit `gitignore` strategy only |
| Runtime/harness paths | Per [runtime-native-install-audit.md](runtime-native-install-audit.md) |

## What Installer Must Never Edit

- `.gitignore` by default (private or shared)
- `.git/info/exclude` without private mode / confirmation
- Unrelated lines outside harness delimited block
- `.env`, secrets, user source, lockfiles
- Global install: project exclude files

## Dirty Working Tree Handling

Before write install:

1. If Git repo and paths to write are already tracked → warn; exclude may not hide them until untracked.
2. If user wanted private but files will show anyway → suggest exclude or abort.
3. After private install + info-exclude → expect clean status for **new untracked** generated paths.

## Existing File Handling

| Situation | Policy |
|---|---|
| Path already **tracked** | Exclude/gitignore does not untrack; warn user |
| Path exists, no `--force` | Skip install write |
| `.git/info/exclude` missing | Create or append block |
| Not a Git repo | Skip exclude; print manual instructions |
| User-owned `.gitignore` harness block | Only touch with explicit `gitignore` strategy |

## Recommended Defaults

| Context | Visibility | Ignore strategy |
|---|---|---|
| Interactive project | **Ask** | `auto` → `info-exclude` if private |
| `--visibility private --yes` | private | `info-exclude` (require explicit flags; warn if strategy omitted in CI) |
| `--visibility shared` | shared | `none` |
| `--ignore-strategy none` | either | No exclude/gitignore edits |
| Global | N/A | ignored |

Non-interactive without `--visibility`: **fail or warn** — do not guess.

## Examples

**Private Cursor + harness (preferred — no tracked ignore change):**

```bash
sh install.sh install --runtime cursor --scope project --visibility private --ignore-strategy info-exclude --init-harness --yes
```

Expected:

1. Block appended to `.git/info/exclude`
2. `.cursor/rules/ai-engineering-harness.mdc` + `.harness/` created
3. `git status` does not list those paths (untracked + excluded)

**Shared team install:**

```bash
sh install.sh install --runtime cursor --scope project --visibility shared --init-harness --yes
```

Expected: files created; exclude and `.gitignore` unchanged; paths visible in `git status`.

**Explicit `.gitignore` (team policy, user opted in):**

```bash
sh install.sh install --runtime cursor --scope project --visibility private --ignore-strategy gitignore --init-harness --yes
```

Expected: delimited block in `.gitignore` — user knows `.gitignore` will show as modified.

## Related Docs

- [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md)
- [install-command-model.md](install-command-model.md)
- [project-state-policy.md](project-state-policy.md)
- [uninstall-update-design.md](uninstall-update-design.md)
