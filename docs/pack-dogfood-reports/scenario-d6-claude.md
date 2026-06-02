# Pack Dogfood Report — Scenario D6 Claude Runtime

## Scenario

**D6 — Claude runtime** (project + global dry-run dogfood). Tests `--runtime claude` with project `--init-harness` and global scope. Claude is the last runtime in the main dogfood matrix; marketplace plugin install is **not** automated by the installer (settings merge + NEXT hint only).

## Target Repo Type

Disposable external placeholder repo (`../harness-dogfood-claude`): `README.md`, `package.json` only. Not committed to `ai-engineering-harness`.

## Runtime Used

`claude` via local `install.sh` — **project** scope with `--init-harness`; **global** scope dry-run only (write not run — see safety).

## Consumption Mode

Runtime-native install writes `.claude/CLAUDE.md` and merges `.claude/settings.json` (marketplace fragment). Project `.harness/` via `--init-harness`. Does **not** install full `.claude-plugin/` bundle or copy pack root surface. Does **not** create `AGENTS.md`.

## Commands Run

```bash
# Project mode
sh install.sh --runtime claude --scope project --target ../harness-dogfood-claude --init-harness --dry-run --yes
sh install.sh --runtime claude --scope project --target ../harness-dogfood-claude --init-harness --yes
node validate.js --target ../harness-dogfood-claude --runtime claude --profile-only
node validate.js --target ../harness-dogfood-claude --profile-only

# Global mode (dry-run only)
sh install.sh --runtime claude --scope global --target ../harness-dogfood-claude --dry-run --yes

# Idempotency (project)
sh install.sh --runtime claude --scope project --target ../harness-dogfood-claude --init-harness --yes
```

## Artifacts Created (project)

| Path | Purpose |
|---|---|
| `.claude/CLAUDE.md` | Project instructions (matches `runtime/claude/CLAUDE.project.md`) |
| `.claude/settings.json` | Merged `extraKnownMarketplaces` for harness GitHub repo |
| `.harness/*` | Profile skeleton + `goals/.gitkeep` |

**Not created:** `AGENTS.md`, pack root dirs (`commands/`, etc.), full plugin marketplace bundle under target.

## Claude Settings Check

| Check | Result |
|---|---|
| Valid JSON | pass |
| `extraKnownMarketplaces.ai-engineering-harness` | present |
| Marketplace source | `github` / `truongnat/ai-engineering-harness` |
| Matches `runtime/claude/settings.project.fragment.json` | pass (CREATE on fresh project) |
| Existing settings merge | N/A on fresh project; global dry-run showed **WOULD UPDATE** if global write ran |

Installer prints NEXT: `/plugin install ai-engineering-harness@ai-engineering-harness` — **manual step**; not executed in this dogfood.

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node validate.js --target ../harness-dogfood-claude --runtime claude --profile-only` | **pass** | `.claude/CLAUDE.md`, `.claude/settings.json`, `.harness/` |
| `node validate.js --target ../harness-dogfood-claude --profile-only` | **FAIL** (expected) | `Missing required path: AGENTS.md` |

## Root Pollution Check

**Clean** — no `AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, `docs/`.

## Global Dry-Run / Global Write Result

| Step | Result |
|---|---|
| Global dry-run | WOULD CREATE `~/.claude/CLAUDE.md`; WOULD **UPDATE** `~/.claude/settings.json` |
| Pre-check | `~/.claude/settings.json` already exists on dogfood host |
| Global write | **not run** — would modify real global settings without `--force`; adopters should dry-run first |

## Skip Behavior Check (project)

Second project write: **SKIP** `.claude/CLAUDE.md`, `.claude/settings.json`, and all `.harness/` files.

## Manual Claude Check

| Item | Result |
|---|---|
| Claude Code CLI | present (`claude` 2.1.145) |
| IDE session / `.claude/CLAUDE.md` load | **BLOCKED / not run** |
| `/plugin install ai-engineering-harness@ai-engineering-harness` | **BLOCKED / not run** |

Do **not** claim stable Claude support until marketplace plugin install and instruction load are verified in Claude Code.

## What Worked

- Project dry-run/write exited 0
- `CLAUDE.md` matches pack project payload
- `settings.json` valid with marketplace fragment
- Runtime-aware validation **pass**
- Legacy validation fails without `AGENTS.md` as expected
- No root pollution; skip on re-install
- Global dry-run captured CREATE/UPDATE plan without writing

## What Was Confusing

- Installer does not install marketplace plugin — only settings hint + NEXT message
- Global dry-run **UPDATE** on existing `settings.json` easy to miss as a real-machine risk
- `validate.js` does not check marketplace plugin installed state (structural paths only)

## Missing Docs

- Explicit “Claude dogfood = file install + manual `/plugin install`” checklist
- Global install safety: dry-run required when `~/.claude/settings.json` exists

## Pack Surface Issues

- `.claude-plugin/plugin.json` at pack root not copied by runtime installer (by design per audit)

## Runtime Issues

- Real plugin consumption still requires manual `/plugin install` after file install
- Global write deferred on dogfood host to avoid mutating user settings

## Safety Notes

- Global write skipped because existing `~/.claude/settings.json` would be updated
- No secrets in target repo; sanitized paths in report
- Target repo not committed to source pack

## Follow-up Candidates

| Item | Classification |
|---|---|
| Manual Claude Code + `/plugin install` in dogfood target | D6 follow-up optional |
| Document global Claude install when settings already exist | v0.9.x patch |
| Runtime dogfood summary + v0.9.x readiness doc after D6 | next step |

## Verdict

**experimental PASS** — Claude **project** file/install + runtime-aware validation pass. **Global write not run** (safe choice). **Stable claim remains No** — marketplace plugin not installed; manual Claude Code check **BLOCKED / not run**.
