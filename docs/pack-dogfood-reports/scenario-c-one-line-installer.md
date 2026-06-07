# Pack Dogfood Report — Scenario C One-Line Installer

## Scenario

**C — One-line installer** (Plugin Install UX dogfood). Complements Scenario A/B (`v0.8.0`) by testing remote `curl | sh` install without manual clone of the source pack.

## Target Repo Type

Tiny external Node placeholder repo created for dogfood only (`harness-dogfood-one-line`). Not committed to `ai-engineering-harness`.

## Runtime Used

Shell (`curl | sh`) for install; structural validation from harness source pack with `node bin/validate.js --target` (Cursor-class workflow optional; not required for this scenario).

## Consumption Mode

One-line remote install via `install.sh` downloading GitHub archive (`ref: main`), then `install.js` copy into target.

## Commands Run

```bash
# From harness source pack root (consumer may run from any cwd with valid --target)
curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target ../harness-dogfood-one-line --dry-run

curl -fsSL https://raw.githubusercontent.com/truongnat/ai-engineering-harness/main/install.sh | sh -s -- --target ../harness-dogfood-one-line

# Profile and goal artifacts created in target (minimal structural fixtures)
# Validation from source pack:
node bin/validate.js --target ../harness-dogfood-one-line --profile-only
node bin/validate.js --target ../harness-dogfood-one-line --goal one-line-health-check
```

## Artifacts Created

| Path | Purpose |
|---|---|
| `AGENTS.md` | Installed operating contract |
| `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/` | Installed operating surface |
| `docs/harness-build-usage.md`, `docs/target-repo-validation.md` | Adoption and validation guides |
| `.harness/HARNESS.md` … `MEMORY.md` | Dogfood profile (created post-install) |
| `.harness/goals/one-line-health-check/*` | Dogfood goal (created post-install) |

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node bin/validate.js --target ../harness-dogfood-one-line --profile-only` | pass | Structural profile contract |
| `node bin/validate.js --target ../harness-dogfood-one-line --goal one-line-health-check` | pass | Structural goal contract |

## What Worked

- Remote `curl | sh` dry-run and write install both succeeded without cloning the source pack locally first
- Default `ref: main` archive downloaded and `install.js` ran from extracted temp pack
- **83** paths would-copy / copied, **0** failed
- Required installed surface present: `AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, key adoption docs
- Target profile and goal structural validation passed after creating `.harness/` artifacts
- No `sudo`, no manual clone required for install step

## What Was Confusing

- `install.js` next steps still reference `node bin/aih.js install --target <path>` (maintainer wording) rather than reusing the one-line `curl` command or noting validation runs from a separate pack checkout
- Absolute target path appears in install summary when `--target` is a relative path (known low-severity pattern from Scenarios A/B)
- `docs/install-sh-usage.md` is **not** in default installed surface (expected per `exportPaths`; consumers discover one-line install from README/source pack only)

## Missing Docs

- Optional: short “validate after one-line install” callout in target-visible docs (installed `target-repo-validation.md` covers source-pack validation but one-line path could be one sentence clearer)
- `install-sh-usage.md` not copied to target (acceptable if README/web docs are canonical)

## Pack Surface Issues

- `install-sh-usage.md` not in `exportPaths` — not a blocker; document in adoption guide if teams want in-target copy
- Install summary/next-steps optimized for cloned source pack

## Runtime Issues

- None blocking for shell one-line install
- Validation still requires access to `validate.js` (source pack clone, second one-line run from temp extract, or future global CLI)

## Safety Notes

- External target repo contains no secrets or customer data
- Report uses relative target path only
- Temp archive extracted and removed by `install.sh` trap
- Target repo not committed to source pack repository

## Follow-up Candidates

| Item | Classification |
|---|---|
| Install next-steps mention one-line install + validate options | v0.9.x patch |
| Optional add `docs/install-sh-usage.md` to `exportPaths` | later optional |
| Global `ai-harness validate` CLI | v0.9.x / v0.10 |
| Absolute path in install summary | v0.9.x patch (repeat) |

## Release Impact

**Plugin Install UX goal met for install path:** consumers can install without manual clone.

**No v1 blocker** from Scenario C. Recommend v0.9.x patch for next-steps wording; proceed toward global CLI or v0.9.x readiness after optional fixes.
