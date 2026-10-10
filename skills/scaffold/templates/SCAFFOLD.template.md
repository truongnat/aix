# Scaffold — <Project name>

> Record of the greenfield bootstrap. Not a changelog of every file — capture
> the decisions and the exact way to run what was created. Mark assumptions and
> gaps; do not claim something works that was not run.

## Overview

- **Project:** _(one line — what it is)_
- **Stack:** _(language / framework / runtime)_
- **Architecture:** _(monorepo apps+packages / single package)_
- **Status:** scaffolded / partial · **Branch:** _(per the project branch settings.mode)_

## Stack decisions (→ ADRs)

| Choice | Selected | Why | ADR |
|---|---|---|---|
| Language / framework | _(…)_ | _(driver)_ | ADR-001 |
| Monorepo tool | _(…/N-A)_ | _(…)_ | ADR-002 |
| Package manager | _(…)_ | _(…)_ | |
| Test framework | _(…)_ | _(…)_ | |
| CI | _(…)_ | _(…)_ | |
| License | _(…)_ | _(…)_ | |

## What was created

| Path | Purpose |
|---|---|
| _(dir/file)_ | _(…)_ |

_(Group by area: structure, manifests, tooling/CI, entry point, agent configuration wiring.)_

## Assumptions & gaps

| Item | Assumption / gap | Impact |
|---|---|---|
| _(e.g. version)_ | _(assumed / Unknown)_ | _(…)_ |

## Next commands (run only if approved)

```bash
# install
<package-manager> install
# build / run
<run command>
# test / lint
<test command> ; <lint command>
```

## Handoff

- Run `sk-init` to generate the project reference from this skeleton.
- Then `sk-brainstorming` / `sk-planning` for the first feature.
- Open blockers / questions: _(or none)_
