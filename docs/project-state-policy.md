# Project State Policy

## Purpose

Define how **global plugin/capability install** relates to **per-repository `.harness/` state** for `ai-engineering-harness`.

## Global Plugin vs Project State

| Layer | What it is | Where it lives | Shared across repos? |
|---|---|---|---|
| Global capability | Runtime plugin, extension, rules, or bootstrap | `~/.claude/`, `~/.config/opencode/`, `~/.gemini/extensions/`, etc. | Yes (same machine / user) |
| Project state | Harness profile + goals for one product | `<repo>/.harness/` | No (one repo only) |

**Global install never substitutes for project state.**

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
  ai-harness init --project
or use project-scope install with --init-harness
```

(Future CLI names; concept is required today.)

## What Gets Committed

| Artifact | Typical commit? |
|---|---|
| `.harness/` profile + goals | **Team choice** — often yes for shared operating model |
| `.harness/*.local` or secrets | **Never** |
| Runtime project config (`.claude/settings.json`, `.cursor/rules/`, `opencode.json`) | Often yes when project-scoped |
| Global runtime config | Usually **not** in product repo (lives in home dir) |
| Full pack mirror (`commands/`, `skills/` at root) | **Discouraged** — not default |

## What Should Be Ignored

Teams may add to `.gitignore` (their choice):

- personal experiment files under `.harness/`
- local-only overrides
- machine-specific paths in MEMORY.md content (policy: [memory-safety.md](memory-safety.md))

Installer should not auto-edit `.gitignore` without explicit future flag.

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

## Rules (normative)

1. Global install **never** creates shared project state by itself.
2. Project install **may** create `.harness/` when requested.
3. Each repo gets **its own** `.harness/`.
4. Runtime plugins should **not** duplicate the full pack in every repo unless that runtime requires project-local files (then install **only** what that runtime needs).
5. Commit vs ignore `.harness/` is a **team workflow** decision; document in profile README or adoption guide.

## Related Docs

- [runtime-install-matrix-research.md](runtime-install-matrix-research.md)
- [interactive-installer-design.md](interactive-installer-design.md)
- [plugin-install-ux.md](plugin-install-ux.md)
