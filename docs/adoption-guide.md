# Adoption Guide

This guide explains how to adopt `ai-engineering-harness` into another repository without introducing a runtime platform.

This repository is the source pack.

The target repository is where product work happens.

The installed or copied harness surface is what agents use inside that target repository.

## Goals

- keep markdown as the source of truth
- copy only the harness assets you need
- use `.harness/` for active project artifacts
- follow the artifact content restrictions in [SECURITY.md](../SECURITY.md#artifact-content-restrictions)

## Manual Install

Copy these assets from the source pack into the target repository:

- `AGENTS.md`
- `commands/`
- `skills/`
- `workflows/`
- `patterns/`
- `templates/`
- `docs/`

Recommended manual steps:

1. Copy the files into the target repository root.
2. Read `AGENTS.md` and confirm it fits the target repository's operating rules.
3. Create a `.harness/` directory in the target repository.
4. Populate `.harness/` using the files in `templates/`.
5. Start using the command loop with `commands/harness-start.md`.

## Installer Usage

The source pack includes a dependency-free installer.

**Consumers:** prefer runtime-native `install.sh` (`v0.9.1`, experimental) — [install-sh-usage.md](install-sh-usage.md), [plugin-install-ux.md](plugin-install-ux.md). The flows below are **maintainer** `install.js` root copy (same surface as manual fallback).

### Basic Copy

```bash
node install.js --target ../my-project
```

### Dry Run

```bash
node install.js --target ../my-project --dry-run
```

Use this first to see exactly which capability-pack files would be copied and which files would be skipped.

### Force Overwrite

```bash
node install.js --target ../my-project --force
```

The installer will not overwrite existing files unless `--force` is passed.

### Installer Rules

- every file operation is printed as `COPY`, `SKIP`, `WOULD COPY`, or `WOULD SKIP`
- existing files are preserved by default
- `--force` overwrites existing files in the target path
- the installer copies the markdown operating surface only

## Installer Contract

What gets copied:

- `AGENTS.md`
- `commands/`
- `skills/`
- `workflows/`
- `patterns/`
- `templates/`
- selected adoption-facing docs

What never gets generated:

- no runtime files
- no `src/`
- no server code
- no database configuration
- no secrets or private business data (see [SECURITY.md](../SECURITY.md#artifact-content-restrictions))

Overwrite behavior:

- existing files are skipped by default
- existing files are overwritten only when `--force` is passed

Why use dry-run first:

- it shows the exact copy/skip plan before any file changes happen
- it helps detect collisions with an existing repository contract
- it keeps adoption reviewable and predictable

## Installed Surface

Use [docs/installed-surface-contract.md](installed-surface-contract.md) to understand the default installed boundary.

The installed surface is a deliberate subset of the source pack, not a copy of the entire repository.

## Recommended `.harness/` Layout

Use this structure in the target repository:

```text
.harness/
  PROJECT.md              # Project metadata and team structure
  ROADMAP.md              # Milestone and phase planning
  REQUIREMENTS.md         # Acceptance criteria
  STATE.md                # Current repository state
  CONTEXT.md              # Team decisions and context
  MEMORY.md               # Durable lessons and decisions (optional)
  
  sessions/
    <active-session>/     # Named session (e.g., 2024-01-15-auth-feature)
      GOAL.md             # What we're building/fixing
      DISCUSSION.md       # Analysis and approach
      PLAN-001.md         # Detailed plan (numbered for iterations)
      TASKS.md            # Step-by-step execution log
      VERIFY.md           # Evidence of completion
      SHIP.md             # Release notes and summary (optional)
```

Typical usage:

- **Project-level files** store stable context (PROJECT.md, ROADMAP.md, STATE.md)
- **Session directories** track individual goals/tasks/features
- **Each session** follows the harness loop: GOAL → DISCUSSION → PLAN → TASKS → VERIFY → SHIP
- **REMEMBER.md** (project-level) stores durable, sanitized lessons between sessions

## Using The Command Loop

Run the installed harness surface as a working loop inside the target repository, not as static documentation:

1. `Map`
2. `Start`
3. `Discuss`
4. `Plan`
5. `Run`
6. `Verify`
7. `Ship`
8. `Remember`

Recommended adoption pattern:

- start a task by creating or updating `.harness/GOAL.md`
- clarify scope in `.harness/DISCUSSION.md` when needed
- write `.harness/PLAN.md` before implementation
- update `.harness/TASKS.md`, `.harness/VERIFY.md`, and `.harness/SHIP.md` as work progresses
- save only durable lessons in `.harness/REMEMBER.md`

## After Adoption: Start The Harness Workflow

After the base harness files are in place, build a repository-specific harness profile before feature work starts.

- run [`commands/harness-start.md`](../commands/harness-start.md)
- validate the repo shape with [docs/target-repo-validation.md](target-repo-validation.md)
- continue with the command loop once `.harness/` state is explicit

## What Should And Should Not Be Committed

Usually commit:

- `AGENTS.md`
- `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`
- shared `.harness/` artifacts that describe active project context or durable operating state

Usually do not commit:

- transient local-only notes
- `.harness/*.local.md`
- local event logs
- secrets or debugging scraps

If the team wants shared planning history, commit the relevant `.harness/` artifacts. If a note is only useful for one local session, keep it local or delete it.

## Safety Rules For Company Or Private Repositories

Use the harness as process documentation, not as a secret store.

Never write any of the following into harness artifacts:

- credentials
- tokens
- API keys
- `.env` values
- customer data
- private business data

If a memory or plan depends on sensitive context, summarize the pattern without recording the sensitive material itself.

Memory-specific rule:

- secrets must never be stored in memory artifacts such as `.harness/REMEMBER.md`

## Validation

After adoption, run:

```bash
node validate.js
```

If you copied the full repository surface, this confirms the required structure and key document contracts are present.

## After Running `install.js`

After install, follow the printed next-step guidance inside the target repository and then review:

- [docs/install-output-example.md](install-output-example.md)
- [docs/install-to-profile-walkthrough.md](install-to-profile-walkthrough.md)
- [docs/target-repo-validation.md](target-repo-validation.md)
- [docs/target-repo-validation.md](target-repo-validation.md)

Recommended first follow-up validation:

```bash
node validate.js --target ../my-project --profile-only
```

If validation fails, use [docs/validation-troubleshooting.md](validation-troubleshooting.md).

For a very small repository or when learning the artifact shape first, use:

- [examples/tiny-repo-adoption/](../examples/tiny-repo-adoption/)

For tiny repositories, start with [docs/small-repo-memory.md](small-repo-memory.md) instead of creating a complex memory structure.

## Smoke Test

Before using the harness in a real repository, run the local-only [Adoption Smoke Test](adoption-smoke-test.md).
