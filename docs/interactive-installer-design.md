# Interactive Installer Design

## Purpose

Design the next-generation installer: **runtime-native**, **scope-aware**, and **non-polluting** to the product repository root.

Current [install.sh](../install.sh) remains a **fallback** (download archive + `install.js`). This document describes the target behavior before implementation.

## Installer Flow

```txt
curl -fsSL .../install.sh | sh
        │
        ▼
  [optional: parse CLI flags → skip prompts if complete]
        │
        ▼
  Runtime selection (interactive or --runtime)
        │
        ▼
  Scope selection (interactive or --scope)
        │
        ▼
  Confirm plan (paths to write, dry-run summary)
        │
        ▼
  Execute runtime-specific install step(s)
        │
        ▼
  If project scope OR --init-harness → scaffold/check .harness/
        │
        ▼
  Print next steps (validate, init goals, runtime-specific)
```

## Runtime Selection

Interactive menu (example):

```txt
AI Engineering Harness Installer

Choose agent runtime:
  1) Claude Code
  2) Codex CLI
  3) Cursor
  4) Gemini CLI
  5) OpenCode
  6) Generic AGENTS.md bootstrap
  7) All supported (sequential, with confirmation)
  8) Manual fallback (current install.js surface copy)

Select [1-8]:
```

Mapping to `--runtime`:

`claude` | `codex` | `cursor` | `gemini` | `opencode` | `generic` | `all` | `manual`

Research: [runtime-install-matrix-research.md](runtime-install-matrix-research.md).

## Scope Selection

```txt
Install scope:
  1) Global — available across many repos (runtime config only)
  2) Project — this repository only

Select [1-2]:
```

Rules:

| Scope | Writes | Does NOT |
|---|---|---|
| `global` | Runtime-global plugin/config paths | Create `.harness/` in cwd by default |
| `project` | Runtime-project paths + optional `.harness/` | Assume global state applies to all repos |

## Multi-runtime Selection

`--runtime all` runs a **defined sequence** (design TBD), with a single confirmation listing all paths. On conflict, user confirms overwrite per runtime.

Not parallel blind copy — each runtime has its own installer module (Steps 3B–3G).

## Global vs Project Rules

- **Global:** install capability once per machine (or per user account) for that runtime.
- **Project:** install capability for one repo; may add `.harness/` for harness profile/goals.
- **Never:** one global `.harness/` shared across all repos.
- **Never:** copy full `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/` into product root as default.

## Project .harness Creation Rules

Create or update `.harness/` when:

- scope = `project`, and
- `--init-harness` is set **or** interactive confirm says yes, and
- profile files missing or user confirms scaffold

Scaffold includes empty templates with **required headings** per [frozen-target-profile-contract.md](frozen-target-profile-contract.md). Do not auto-fill business content.

Goals are **not** created by default — user runs harness-build flow or `ai-harness init --goal <id>` (future).

## Commit Policy

Installer prints guidance, does not modify `.gitignore` automatically unless explicit flag added later.

See [project-state-policy.md](project-state-policy.md).

## Dry Run UX

`--dry-run` prints:

- selected runtime(s) and scope
- files/dirs that **would** be created or updated
- registry/marketplace commands that **would** run (if any)
- no writes

Fallback `manual` mode delegates dry-run to current `install.js`.

## Non-interactive Flags

For CI and scripting:

| Flag | Values |
|---|---|
| `--runtime` | `claude`, `codex`, `cursor`, `gemini`, `opencode`, `generic`, `all`, `manual` |
| `--scope` | `global`, `project` |
| `--target` | path (default `.`) |
| `--init-harness` | scaffold `.harness/` profile files if missing |
| `--dry-run` | no writes |
| `--force` | overwrite existing install targets |
| `--ref` | GitHub archive ref for fallback/manual bootstrap |
| `--yes` | skip interactive confirm |
| `--help` | usage |

Existing `install.sh` flags remain for **manual** path until subcommands implemented.

## Safety Rules

- No `sudo`
- No telemetry
- No secret/env reads
- No writes outside declared runtime paths + target `.harness/`
- Pin `--ref` for reproducible bootstrap
- Review-before-run documented in [plugin-install-security.md](plugin-install-security.md)

## Error Handling

- Missing `node`, `curl`/`wget`, `tar` → fail fast with clear message (current `install.sh`)
- Unknown runtime → exit non-zero
- Partial failure in `all` → report which runtime failed; exit non-zero
- Official doc mismatch → block implementation until research updated (no guessed paths)

## Relationship To Current install.sh

| Component | Role going forward |
|---|---|
| `install.sh` | Orchestrator: prompts, flags, download bootstrap, dispatch |
| `install.js` | **manual** mode only: legacy full-surface copy |
| Per-runtime modules (future) | Claude, Cursor, Codex, Gemini, OpenCode, generic |

Implementation order: see [v0.9.0-plan.md](v0.9.0-plan.md).
