# Capability Cache (`.ai-harness/`)

## Purpose

Runtime-native installs place **provider entrypoints** (Cursor rule, Claude `CLAUDE.md`, `AGENTS.md`, Gemini extension) and **project state** under `.harness/`. They do **not** copy the full capability pack into the product repo root.

Without `.ai-harness/`, every provider only gets an entrypoint that says “go read something” — with no local `commands/`, `skills/`, or `workflows/`. The primary surface is `npx ai-engineering-harness install`.

**v0.10.2+** also installs `.ai-harness/runtime-commands/` and `.ai-harness/activation.md` for the **local command catalog** (`harness-plan`, …). Native slash commands are not claimed for all providers — see [runtime-command-surface.md](runtime-command-surface.md).

```txt
.ai-harness/
```

## Why `.ai-harness/` Exists

| Problem | Fix |
|---|---|
| Root copy pollutes product repos | Cache under `.ai-harness/` only |
| Runtime-only install has no shared pack `commands/`, `skills/`, … locally in `.ai-harness/` | Copy selected pack surface into cache while allowing native provider commands separately |
| `.harness/` is project-specific state | Keep capabilities separate from goals/profile |

## Difference Between `.ai-harness/` and `.harness/`

| Path | Role |
|---|---|
| `.ai-harness/` | **Capability source** — shared pack: `AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, selected `docs/` |
| `.harness/` | **Project state** — this repo's profile, gates, memory, active goals |
| Runtime bootstrap (e.g. `.cursor/commands/harness-plan.md`, `.cursor/rules/ai-engineering-harness.mdc`) | **Provider entrypoint** — tells the agent where to read cache + state |

Agents should read `.ai-harness/AGENTS.md` first, use `.ai-harness/commands/` and `.ai-harness/skills/` for capabilities, then read `.harness/` artifacts for this project.

## Installed Layout

After a **project** install (cache on by default for every runtime):

```txt
your-project/
├── .ai-harness/
│   ├── AGENTS.md
│   ├── commands/
│   ├── skills/
│   ├── workflows/
│   ├── patterns/
│   ├── templates/
│   ├── docs/          # selected usage docs only
│   ├── PACK.md
│   └── README.md
├── .harness/
│   ├── HARNESS.md
│   ├── TEAM.md
│   └── …
└── .cursor/
    ├── commands/
    │   └── harness-*.md
    └── rules/
        └── ai-engineering-harness*.mdc
```

Root must **not** contain `commands/`, `skills/`, `workflows/`, or `templates/` from the pack.

## Per-provider layout (project + `--init-harness`)

| Runtime | Entrypoint | Also installed |
|---|---|---|
| `cursor` | `.cursor/commands/`, `.cursor/rules/ai-engineering-harness.mdc` | `.ai-harness/`, `.harness/` |
| `claude` | `.claude/CLAUDE.md`, `.claude/settings.json` | `.ai-harness/`, `.harness/` |
| `codex`, `generic` | `AGENTS.md` (bootstrap → `.ai-harness/`) | `.ai-harness/`, `.harness/` |
| `gemini` | `.gemini/extensions/ai-engineering-harness/` | `.ai-harness/`, `.harness/` |

Primary Node CLI install order: (1) `.git/info/exclude` when private, (2) `.ai-harness/` cache, (3) `.harness/` when missing for project install, (4) runtime entrypoint.

## Install Behavior

Implemented in [lib/install-cache.ts](../lib/install-cache.ts), invoked in-process by the primary Node CLI.

| Flag / setting | Behavior |
|---|---|
| Primary Node CLI default | **On** for all `project` + runtime-native (every provider); **off** for `global`, `manual` |
| Shared visibility | Cache still installed; files visible in `git status` unless paths are in team policy |
| `--dry-run` | Prints `WOULD COPY .ai-harness/...` |
| `--force` | Overwrites existing cache files |

Cache surface (not exhaustive): `AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, selected `docs/*`, `PACK.md`, `README.md`, optional `LICENSE`. Excludes `test/`, `examples/`, `node_modules`, `.git`.

## Git Ignore / info-exclude Behavior

Private installs append a delimited block to **`.git/info/exclude`** (not `.gitignore`). When cache is installed, the block includes:

```gitignore
# ai-engineering-harness start
.ai-harness/
.harness/
.cursor/commands/
.cursor/rules/
# ai-engineering-harness end
```

See [private-install-git-hygiene.md](private-install-git-hygiene.md) and [git-hygiene-policy.md](git-hygiene-policy.md).

## Runtime Bootstrap Behavior

Bootstraps point agents at:

1. `.ai-harness/` — capability source
2. `.harness/` — project state

If `.ai-harness/` is missing, reinstall with a project install. Cache is on by default in the primary Node CLI.

Updated payloads: [runtime/cursor/rules/ai-engineering-harness.mdc](../runtime/cursor/rules/ai-engineering-harness.mdc), [runtime/bootstrap/AGENTS.project.md](../runtime/bootstrap/AGENTS.project.md), Claude/Gemini project stubs.

## Update Behavior

`npx ai-engineering-harness update` refreshes `.ai-harness/` with overwrite semantics and preserves `.harness/`. Runtime entrypoints are refreshed in the same update step.

## Uninstall Implications

`npx ai-engineering-harness uninstall` removes runtime entrypoints by default and cleans the harness block from `.git/info/exclude`.

- `.ai-harness/` is kept by default; use `--all` in the primary Node CLI for full cleanup
- `.harness/` is kept by default; use `--all` in the primary Node CLI for full cleanup
- Legacy OpenCode installs: see [uninstall-usage.md](uninstall-usage.md) for cleanup guidance (OpenCode is not an active install target)
- `AGENTS.md` is only removed when clearly harness-owned

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| Agent says "read .harness TODO only" | No `.ai-harness/` | Reinstall with a project install |
| `git status` shows `.ai-harness/` | Shared install or no exclude | Use `--visibility private` + info-exclude |
| Stale commands/skills | Old cache, skip on re-run | Re-run with `--force` |
| Root has `commands/` | Used `--legacy-root` / manual | Use runtime-native + cache instead |

## Related Docs

- [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md) — Step 2
- [project-state-policy.md](project-state-policy.md)
- [plugin-install-ux.md](plugin-install-ux.md)
