# Project State Policy

## Purpose

Define how **global plugin/capability install** relates to **per-repository `.harness/` state** for `ai-engineering-harness`.

## Global Plugin vs Project State

| Layer | What it is | Where it lives | Shared across repos? |
|---|---|---|---|
| Global capability | Runtime plugin, extension, rules, or bootstrap | `~/.claude/`, `~/.cursor/`, `~/.gemini/extensions/`, `~/.codex/`, etc. | Yes (same machine / user) |
| Project state | Harness profile + goals for one product | `<repo>/.harness/` | No (one repo only) |
| Runtime bootstrap | Agent/tool entry files (e.g. `AGENTS.md`, `.cursor/rules/`) | Repo root or runtime paths | Per runtime; not `.harness/` state |

**Global install never substitutes for project state.**

**`.harness/` init does not create runtime bootstrap files.** For example, `AGENTS.md` is owned by `generic`/`codex` project install or `manual` fallback, not by `--init-harness` alone.

## Why .harness Is Project-local

- Each product has different scope, team pattern, workflow, gates, and goals.
- [frozen-target-profile-contract.md](frozen-target-profile-contract.md) and [frozen-goal-artifact-contract.md](frozen-goal-artifact-contract.md) assume **per-repo** `.harness/`.
- Dogfood Scenarios A/B/C used separate target repos with separate profiles — evidence supports per-repo state.

## Multi-repo Behavior

Correct:

```txt
~/.claude/...          ← global Claude plugin (example)
repo-a/.harness/       ← repo A state
repo-b/.harness/       ← repo B state
repo-c/.harness/       ← repo C state
```

Incorrect:

```txt
~/.harness/            ← shared global harness state (do not use)
repo-a/commands/...    ← full pack copied to every repo root (not default)
```

After **global** install, user message should say:

```txt
Global harness capability installed for <runtime>.
In each product repo, run:
  npx ai-engineering-harness install --target <repo>
```

## What Gets Committed

| Artifact | Typical commit? |
|---|---|
| `.harness/` profile + goals | **Team choice** — shared (commit) or private (gitignore) per install |
| `.harness/*.local` or secrets | **Never** |
| Runtime project config (`.claude/settings.json`, `.cursor/rules/`, `.gemini/extensions/…`) | Shared install: often yes; private install: gitignored per [git-hygiene-policy.md](git-hygiene-policy.md) |
| Global runtime config | Usually **not** in product repo (lives in home dir) |
| Full pack mirror (`commands/`, `skills/` at root) | **Discouraged** — not default |

Installer must **not** assume one policy for all teams. Ask: commit harness/runtime files to this repo, or keep private?

## Team-Shared vs Private Project State

| Mode | `.harness/` | Runtime project files | `.gitignore` |
|---|---|---|---|
| **Team-shared** (`--visibility shared`) | Intended for commit | Intended for commit | Installer does not edit |
| **Project private** (`--visibility private`) | Local to checkout | Local | Installer prefers **`.git/info/exclude`** — not committed |

See [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md).

## What Should Be Ignored

**Private checkout (v0.9.2):** installer appends to `.git/info/exclude` — personal harness in a shared repo without tracked ignore changes.

**Team policy:** teams may commit `.gitignore` rules themselves; installer does **not** edit `.gitignore` by default.

Also ignore manually:

- personal experiment files under `.harness/`
- machine-specific paths in MEMORY.md ([memory-safety.md](memory-safety.md))

**v0.9.1:** no exclude logic. **v0.9.2:** [git-hygiene-policy.md](git-hygiene-policy.md). Global install never edits project `.git/info/exclude` or `.gitignore`.

## Team-shared vs Personal State

- **Shared:** `.harness/TEAM.md`, `WORKFLOW.md`, `GATES.md` — align team via PR review.
- **Personal:** prefer runtime-local or gitignored files for individual preferences; do not put secrets in `.harness/`.

## Examples

### Project-scoped install into `my-app/`

```txt
my-app/
├── .harness/
│   ├── HARNESS.md
│   ├── TEAM.md
│   └── goals/
├── .claude/settings.json    ← if Claude project scope chose plugin entry
└── src/                     ← product code (unchanged by bulk copy)
```

### Global Claude install only

```txt
~/.claude/settings.json      ← plugin enabled
(no .harness/ created in cwd)
```

User then:

```bash
cd ~/projects/other-app
# run project init → creates other-app/.harness/
```

## Project `.harness` Init (implemented)

`npx ai-engineering-harness install` scaffolds minimal profile files under `<repo>/.harness/` when the project install needs them.

- Generated files are **structural skeletons** only (required headings + TODO placeholders).
- Teams fill content after init.
- **No** global `.harness/` is created.

## Rules (normative)

1. Global install **never** creates shared project state by itself.
2. Project install **may** create `.harness/` when the primary Node CLI detects a missing scaffold.
3. Each repo gets **its own** `.harness/`.
4. Runtime plugins should **not** duplicate the full pack in every repo unless that runtime requires project-local files (then install **only** what that runtime needs).
5. Commit vs ignore `.harness/` is a **team workflow** decision; document in profile README or adoption guide.

## Related Docs

- [runtime-install-matrix-research.md](runtime-install-matrix-research.md)
- [interactive-installer-design.md](interactive-installer-design.md)
- [plugin-install-ux.md](plugin-install-ux.md)
