# Consume As Pack

Frozen contracts: [frozen-runtime-consumption-contract.md](frozen-runtime-consumption-contract.md) · [frozen-source-target-boundary-contract.md](frozen-source-target-boundary-contract.md)

## What This Repo Is

This repository is the canonical source pack for `ai-engineering-harness`.

It provides the markdown operating surface that agents can consume inside another repository.

## What Your Target Repo Is

Your target repo is the real product repository where work happens.

That is where agents should read the installed harness surface, create `.harness/` artifacts, and run target validation.

## The Shortest Current Flow

**Consumers (recommended, experimental):** [install-sh-usage.md](install-sh-usage.md)

```bash
sh install.sh --runtime generic --scope project --init-harness --yes
node validate.js --target ../my-project --runtime generic --profile-only   # from source pack
```

**Maintainers (source pack):**

```bash
node install.js --target ../my-project --dry-run
node install.js --target ../my-project
node validate.js --target ../my-project --profile-only
node validate.js --target ../my-project --goal health-check
```

## What The Agent Should Read

Inside the target repository, start with:

- `AGENTS.md`
- `docs/adoption-guide.md`
- `docs/target-repo-validation.md`
- `docs/install-to-profile-walkthrough.md`
- `docs/target-repo-validation.md`

## What Gets Created In Target Repo

The target repo gets:

- the installed harness operating surface
- `.harness/` profile artifacts
- `.harness/goals/<goal-id>/` artifacts when goal work is active

## What Stays In Source Repo

The source repo keeps:

- canonical source history
- release notes
- maintenance docs
- broader examples and authoring materials that do not need to be installed by default
