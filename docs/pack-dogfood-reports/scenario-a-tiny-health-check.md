# Pack Dogfood Report — Scenario A

## Scenario

Scenario A: Tiny Local Repo — Health Check ([pack-dogfood-scenarios.md](../pack-dogfood-scenarios.md))

## Target Repo Type

Tiny local Node HTTP app (sibling dogfood repo, not committed to source pack).

## Runtime Used

Cursor (repo-local workflow; agent executed install and artifact creation from terminal).

## Consumption Mode

Install/copy via `install.js` from source pack into target repo.

## Commands Run

```bash
# From source pack root
node bin/aih.js install --target ../harness-dogfood-tiny --dry-run
node bin/aih.js install --target ../harness-dogfood-tiny
node bin/validate.js --target ../harness-dogfood-tiny --profile-only
node bin/validate.js --target ../harness-dogfood-tiny --goal health-check
```

Target repo bootstrap (local only): minimal `README.md`, `package.json`, `src/index.js` with `GET /` only.

## Artifacts Created

| Path | Purpose |
|---|---|
| `.harness/HARNESS.md` | Tiny-repo harness profile for health-check goal |
| `.harness/TEAM.md` | Producer-reviewer shape |
| `.harness/SKILLS.md` | Core skills + backend pack |
| `.harness/WORKFLOW.md` | Feature workflow / command loop |
| `.harness/GATES.md` | Structural + manual HTTP gates |
| `.harness/MEMORY.md` | Small-repo memory rules |
| `.harness/goals/health-check/GOAL.md` | Add `/health` without changing `/` |
| `.harness/goals/health-check/PLAN.md` | Implementation plan (deferred in dogfood) |
| `.harness/goals/health-check/TASKS.md` | Task list through validation |
| `.harness/goals/health-check/VERIFY.md` | Validation commands and result |
| `.harness/goals/health-check/REMEMBER.md` | Dogfood lesson summary |

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node bin/validate.js --target ../harness-dogfood-tiny --profile-only` | pass | Checked profile contract |
| `node bin/validate.js --target ../harness-dogfood-tiny --goal health-check` | pass | Checked goal contract |

## What Worked

- `install.js` dry-run and write modes completed with 83 would-copy/copied files, 0 skipped, 0 failed
- Post-install next steps listed profile files and validation command clearly
- Profile and goal headings matched validator contracts on first validation pass after artifact creation
- Tiny-repo example shape aligned well with required `.harness/` structure
- `--target` validation from source pack avoided needing `validate.js` inside the target repo

## What Was Confusing

- Install summary prints an absolute target path; easy to paste into docs but noisy for shared reports
- New adopters may try running `node bin/validate.js` inside the target repo before learning it lives only in the source pack

## Missing Docs

- No single “Scenario A quick path” one-pager (plan + scenarios + walkthrough must be combined mentally)
- VERIFY template in examples still references `../my-project` rather than a dogfood-style relative name

## Pack Surface Issues

- Installed surface is large (83 paths) for a tiny repo; acceptable but worth noting for optional minimal install tiers later
- `validate.js` is not part of `install.js` exportPaths (by design); documentation dependency is critical

## Runtime Issues

- None blocking for Cursor/repo-local flow when cwd is the source pack for install/validate and target repo for artifacts

## Safety Notes

- Target repo created for dogfood only; no secrets or customer data
- Dogfood report uses relative repo name only; no private absolute paths stored here
- Implementation of `/health` intentionally deferred; Scenario A focused on pack consumption and structural validation

## Follow-up Candidates

| Item | Classification |
|---|---|
| Prefer relative target path in install summary output | v0.8.x fix |
| One-line callout: run `validate.js` from source pack with `--target` | v0.8.x fix |
| Optional minimal install profile for tiny repos | later optional work |

## Release Impact

none for `v0.8.0` ship gate; supports confidence for dogfood milestone. No v1 blockers from Scenario A.
