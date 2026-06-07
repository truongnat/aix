# Pack Dogfood Report

Copy this template for each executed scenario. Store completed reports under `docs/dogfood-reports/` or a private tracker if the target repo is sensitive.

## Scenario

<!-- A, B, or C — name and link to pack-dogfood-scenarios.md section -->

## Target Repo Type

<!-- tiny local / frontend-mobile / backend-tooling -->

## Runtime Used

<!-- Claude Code, Cursor, Codex, Gemini CLI, OpenCode -->

## Consumption Mode

<!-- install/copy, vendored directory, release archive extract, other -->

## Commands Run

```bash
# install
# validate (source pack if any)
# validate --target
# other commands
```

## Artifacts Created

| Path | Purpose |
|---|---|
| | |

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node bin/validate.js --target ... --profile-only` | pass / fail | |
| `node bin/validate.js --target ... --goal ...` | pass / fail | |

## What Worked

-

## What Was Confusing

-

## Missing Docs

-

## Pack Surface Issues

<!-- bin/aih.js install surface, PACK.md, command discoverability, broken links -->

-

## Runtime Issues

<!-- wrong repo root, workspace, CLI cwd, read-first gaps -->

-

## Safety Notes

<!-- secrets, over-copy, source pack mistaken for product repo -->

-

## Follow-up Candidates

| Item | Classification |
|---|---|
| | v0.8.x fix / v0.9 contract / v1 blocker / later |

## Release Impact

<!-- none / patch docs / contract change candidate / blocks v1.0 -->
