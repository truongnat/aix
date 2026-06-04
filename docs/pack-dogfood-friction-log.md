# Pack Dogfood Friction Log

Structured log for `v0.8.0` real capability pack dogfood. Add one entry per friction observed.

Do not paste secrets, tokens, customer data, or private business details. Summarize patterns and redact sensitive names.

## Entries

| Date | Scenario | Friction | Severity | Evidence | Proposed Fix | Classification |
|---|---|---|---|---|---|---|
| 2026-06-03 | NPX | `npx ai-engineering-harness` 404 before first npm publish | medium | npm registry | Publish package; document `npx github:…` interim — **addressed** in README v0.10.1 | v0.10.x fix |
| 2026-06-03 | NPX | Shell backend requires `sh` on Windows | low | CLI backend | Document Git Bash/WSL; native JS backend planned | v0.10.x doc |
| 2026-06-02 | A | Install summary prints absolute target path | low | Scenario A install output | Prefer relative path in summary or document redaction for reports | v0.8.x fix |
| 2026-06-02 | A | validate.js runs from source pack only, not installed into target | low | Scenario A validation flow | Add prominent callout in install next-steps and target-repo-validation | v0.8.x fix |
| 2026-06-02 | A | No blocking friction beyond minor doc/output clarity | none | Profile and goal validation passed | No action required | no action |
| 2026-06-02 | B | flutter-google-login example SKILLS/HARNESS shape differs from validator `.harness/` contract | medium | Scenario B artifact drafting | Add bridge doc or tighten example to validator headings | v0.8.x fix |
| 2026-06-02 | B | Example goals under examples/ path vs `.harness/goals/` in target repos | low | Scenario B report | Clarify setup docs and target layout guidance | v0.8.x fix |
| 2026-06-02 | B | Install summary absolute target path (repeat) | low | Scenario B install | Same as Scenario A | v0.8.x fix |
| 2026-06-02 | B | No blocking friction for install or validation | none | Profile and goal validation passed | No action required | no action |
| 2026-06-02 | C | One-line install works without manual clone | none | Scenario C dry-run and write install | No action required | no action |
| 2026-06-02 | C | install.js next steps still say node install.js not curl one-liner | low | Scenario C install output | Mention one-line install and validate-from-pack options | v0.9.x patch |
| 2026-06-02 | C | install-sh-usage.md not in default installed surface | low | Scenario C surface check | Optional exportPaths or link from adoption-guide | later optional |
| 2026-06-02 | C | Install summary absolute target path (repeat) | low | Scenario C install | Same as A/B | v0.9.x patch |
| 2026-06-02 | C | No blocking friction for one-line install or validation | none | Profile and goal validation passed | No action required | no action |
| 2026-06-02 | D1 | `AGENTS.md` CREATE in harness init then SKIP in generic runtime step (first write) | low | Scenario D1 write output | **addressed** — init no longer creates AGENTS.md; runtime owns bootstrap | v0.9.x fix |
| 2026-06-02 | D1 | Install summary absolute target path (repeat) | low | Scenario D1 install plan | Same as A/B/C | v0.9.x patch |
| 2026-06-02 | D1 | No blocking friction for generic project runtime install or profile validation | none | Dry-run, write, skip re-run, validate.js passed | No action required | no action |
| 2026-06-02 | D2 | `--init-harness` minimal AGENTS.md prevents codex runtime from writing `AGENTS.project.md` | medium | Scenario D2 diff vs bootstrap | **addressed** — init no longer creates AGENTS.md; runtime owns bootstrap | v0.9.x fix |
| 2026-06-02 | D2 | `codex exec` needs `--skip-git-repo-check` on non-git dogfood repo | low | Scenario D2 manual attempt | Document in dogfood plan / runtime-native-install | v0.9.x patch |
| 2026-06-02 | D2 | Manual Codex check BLOCKED (API usage limit) | low | codex exec output | Re-run when quota available; do not claim stable | later optional |
| 2026-06-02 | D2 | Dual-phase AGENTS.md CREATE/SKIP (repeat D1) | low | Scenario D2 write output | Install output clarity | v0.9.x patch |
| 2026-06-02 | D2 | No blocking friction for codex project install or profile validation | none | Dry-run, write, skip, validate.js passed | No action required | no action |
| 2026-06-02 | D3 | `--profile-only` requires AGENTS.md but Cursor project install does not create it | medium | Scenario D3 validate.js output | **addressed** — `validate.js --runtime cursor` | v0.9.x fix |
| 2026-06-02 | D3 | Manual Cursor IDE rule load not verified | low | D3 dogfood session | Re-run in Cursor when available | later optional |
| 2026-06-02 | D3 | No blocking friction for cursor install, .mdc payload, or skip behavior | none | Dry-run, write, skip, diff mdc | No action required | no action |
| 2026-06-02 | D4 | Legacy `--profile-only` fails without AGENTS.md on OpenCode-only repo | low | Scenario D4 comparison | Expected; use `--runtime opencode` | no action |
| 2026-06-02 | D4 | Manual OpenCode check not run (CLI not installed) | low | which opencode | Install CLI and re-run session bootstrap | later optional |
| 2026-06-02 | D4 | No blocking friction for opencode install or runtime-aware validation | none | Dry-run, write, skip, validate | No action required | no action |
| 2026-06-02 | D5 | Project-local Gemini extension CLI load unverified | low | Audit + empty extensions list | Manual check; prefer global or gemini extensions install | later optional |
| 2026-06-02 | D5 | `gemini extensions list` empty after global install | low | Scenario D5 manual | Re-check extension registration | later optional |
| 2026-06-02 | D5 | No blocking friction for gemini project/global file install or runtime-aware validation | none | Dry-run, write, skip, validate | No action required | no action |
| 2026-06-02 | D6 | Global Claude dry-run would UPDATE existing ~/.claude/settings.json | medium | Global dry-run output | Dry-run first; use --force only when intended | v0.9.x patch |
| 2026-06-02 | D6 | Marketplace plugin not installed by installer (manual /plugin install) | low | NEXT line in install output | Document in Claude dogfood/readme | no action |
| 2026-06-02 | D6 | Manual Claude Code + plugin install not run | low | D6 session | Follow-up optional | later optional |
| 2026-06-02 | D6 | No blocking friction for Claude project install or runtime-aware validation | none | Dry-run, write, skip, validate | No action required | no action |

### Severity

- **low**: annoyance; workaround exists
- **medium**: slows adoption; docs or small doc fix likely
- **high**: blocks scenario completion without manual intervention

### Classification

- **v0.8.x fix**: address in dogfood patch docs or small clarifications before `v0.8.0` ships
- **v0.9 contract candidate**: may require contract freeze or validator change in `v0.9.0`
- **v1 blocker**: must resolve before `v1.0.0`
- **later optional work**: automation, adapters, marketplace—explicitly deferred

## Real Install Feedback (post–v0.9.1, product repo)

Feedback from installing into a **real** product repository with Cursor (not disposable dogfood-only repo):

| Date | Source | Friction | Severity | Proposed fix | Classification |
|---|---|---|---|---|---|
| 2026-06-02 | Real Cursor install | `.harness/` created but not locally ignored — unclear local vs team state | medium | **addressed** — `--visibility private` + `.git/info/exclude` (Step 1) | v0.9.2 fix |
| 2026-06-02 | Real Cursor install | `.cursor/rules/ai-engineering-harness.mdc` dirties Git working tree | medium | **addressed** — private + info-exclude | v0.9.2 fix |
| 2026-06-02 | Real install UX | `.gitignore` wrong default — tracked file, edit creates repo change | medium | **addressed** — info-exclude default; gitignore rejected in Step 1 | v0.9.2 fix |
| 2026-06-02 | Real install | Antigravity provider not in installer | medium | Research + planned runtime — [antigravity-provider-research.md](antigravity-provider-research.md) | **v0.9.2 blocker** |
| 2026-06-02 | Real install | No uninstall / update commands | medium | `install.sh uninstall` / `update` — [uninstall-update-design.md](uninstall-update-design.md) | **v0.9.2 blocker** |
| 2026-06-02 | Real install | Installer too complex — want one wizard, multi-provider, scope detection | medium | [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md) | **v0.9.2 blocker** |
| 2026-06-03 | Real install UX | `install.sh uninstall` naming felt wrong | medium | **addressed** — `aih.sh` lifecycle dispatcher + `install.sh` compatibility wrapper | v0.9.2 fix |

| 2026-06-02 | E1 | Private Cursor + info-exclude — git status clean | none | Scenario E1 dogfood | no action |
| 2026-06-02 | Real Cursor install | Runtime bootstrap + `.harness/` skeleton only — no local `commands/`, `skills/`, `workflows/` | **high** | Thin `.mdc` points at TODO `.harness/` | **addressed** — `.ai-harness/` private capability cache (v0.9.2 Step 2) | v0.9.2 fix |
| 2026-06-03 | F1 | Simple lifecycle works end-to-end with `aih.sh` | none | [scenario-f1-simple-cli-lifecycle.md](pack-dogfood-reports/scenario-f1-simple-cli-lifecycle.md) | No action required | no action |
| 2026-06-03 | F1 | Default uninstall removes `.git/info/exclude` block while keeping `.ai-harness/` and `.harness/`, so private repo becomes noisy again | medium | `git status --short` after `aih.sh uninstall` shows `?? .ai-harness/` and `?? .harness/` | Decide whether uninstall should preserve local exclude when cache/state are kept, or document this more explicitly | v0.9.2 patch |

**Addressed in v0.9.2:** long command UX, `install.sh uninstall` naming confusion, simple lifecycle dispatcher, capability cache, private git hygiene, update/uninstall lifecycle.

**Remaining after v0.9.2:** binary `aih`, Antigravity, global lifecycle hardening, and manual runtime session verification.

**Conclusion:** `v0.9.1` file/install dogfood is not enough for wide promotion; `v0.9.2` Step 1 (git hygiene, E1 PASS) and Step 2 (capability cache) address real-install gaps.

## Runtime Native Dogfood Summary (C, D1–D6)

Cross-scenario themes after runtime-native dogfood:

| Theme | Severity | Notes |
|---|---|---|
| No root pollution in D1–D6 | none | Validated — not a release blocker |
| Absolute target path in install summary | low | Repeat from A/B/C |
| Manual runtime checks not run or blocked | low–medium | Stable-claim blocker, not experimental-release blocker |
| Runtime-aware validation gap (D3) | addressed | `--runtime` flag |
| Gemini extension visibility inconclusive | low | D5 `extensions list` empty |
| Claude plugin install not automated | low | By design; `/plugin install` manual |
| Global config UPDATE risk (Claude) | medium | Dry-run first; D6 global write skipped |
| `--runtime all` not dogfooded | low | Do not promote as stable |

Full matrix: [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

## Fix Pass Notes

Addressed in v0.9.x D2 patch (AGENTS.md ownership):

| Scenario | Friction | Status |
|---|---|---|
| D1, D2 | Init minimal `AGENTS.md` blocked runtime `AGENTS.project.md` | **addressed** — `.harness/` init no longer creates `AGENTS.md` |
| D3 | Profile validator required `AGENTS.md` for Cursor-only repos | **addressed** — [runtime-aware-validation.md](runtime-aware-validation.md) |

Addressed in v0.8.0 Step 4 (dogfood fix pass):

| Scenario | Friction | Status |
|---|---|---|
| A, B | Install summary absolute target path | **addressed** — `install.js` uses `--target` argument or safe relative display in summary and next steps |
| A, B | `validate.js` runs from source pack with `--target` | **addressed** — `target-repo-validation.md`, install walkthrough, install next steps |
| B | Example shape vs `.harness/` validator contracts | **partially addressed** — [harness-example-to-target-layout.md](harness-example-to-target-layout.md); example files not rewritten |
| B | Example goals under `examples/...` vs `.harness/goals/` | **addressed** — flutter-google-login README + layout guide |

**Deferred:** optional minimal install tier (see follow-up backlog, v0.9 / later).
