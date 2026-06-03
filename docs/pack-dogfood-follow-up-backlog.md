# Pack Dogfood Follow-up Backlog

Triage dogfood findings from [pack-dogfood-friction-log.md](pack-dogfood-friction-log.md) and completed [pack-dogfood reports](pack-dogfood-report-template.md).

## Addressed In v0.9.2 Step 1 (private git exclude)

- Git hygiene via `.git/info/exclude` for `--visibility private` — [private-install-git-hygiene.md](private-install-git-hygiene.md)
- `--visibility` / `--ignore-strategy` flags in [install.sh](../install.sh)

## v0.9.2 Blockers (remaining)

| Item | Doc |
|---|---|
| `uninstall` / `update` commands | [uninstall-update-design.md](uninstall-update-design.md) |
| Provider multi-select + wizard | [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md) |
| Antigravity provider impl | [antigravity-provider-research.md](antigravity-provider-research.md) |
| `--ignore-strategy gitignore` (explicit team policy) | future step |

Implementation order: ~~info-exclude~~ → full verb model → multi-select → uninstall → update → Antigravity.

## v0.9.x Patch Candidates

- One-line install: improve `install.js` next steps to mention `curl | sh` install path and validate-from-source-pack ([scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md))
- Repeat: install summary relative target display when invoked via `install.sh` with relative `--target`
- D2: document `codex exec --skip-git-repo-check` for non-git throwaway targets
- D6: document global Claude dry-run when `~/.claude/settings.json` exists ([scenario-d6-claude.md](pack-dogfood-reports/scenario-d6-claude.md))
- Install plan wording: runtime-specific paths (omit AGENTS.md when not applicable)

## Manual Runtime Follow-up (stable-claim blockers, not v0.9.x release blockers)

- Codex: re-run `codex exec` when API quota available (D2)
- Cursor: IDE rules + Agent smoke (D3)
- OpenCode: plugin bootstrap in session (D4)
- Gemini: `gemini extensions list` / session load; project-local path (D5)
- Claude: `/plugin install` + CLAUDE.md in Claude Code (D6)
- Generic: optional AGENTS.md agent read (D1)

See [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

## v0.8.x Patch Candidates

Doc clarifications, scenario fixes, and small guidance updates that do not change core contracts.

- Optional: Scenario A quick-path doc linking plan, install walkthrough, and scenarios

## Addressed In v0.9.x Patch (runtime-aware validation)

- D3: `validate.js --runtime` for target profile/goal validation ([runtime-aware-validation.md](runtime-aware-validation.md))

## Addressed In v0.9.x Patch (D2 AGENTS.md ownership)

- D1/D2: `--init-harness` no longer creates `AGENTS.md`; `generic`/`codex` runtime writes `AGENTS.project.md` ([install.sh](../install.sh) patch; see Post-D2 Patch Note in D1/D2 reports)

## Addressed In v0.8.0 Fix Pass

- Document that `node validate.js --target` runs from the source pack (Scenarios A, B)
- Install summary prefers `--target` argument / safe relative display (Scenarios A, B)
- [harness-example-to-target-layout.md](harness-example-to-target-layout.md) for example → `.harness/` mapping (Scenario B)
- flutter-google-login README layout vs target layout (Scenario B)

## v0.9 Contract Freeze Candidates

Items addressed in v0.9.0 planning:

- minimal install tier → deferred post-v1 ([minimal-install-tier-decision.md](minimal-install-tier-decision.md)); **not a v1 blocker**
- core contracts indexed in [stable-contract-index.md](stable-contract-index.md)

## v1.0 Blockers

Issues that must be resolved before a stable `v1.0.0` capability pack release.

- **No v1 blockers found in Scenario A** (install, profile, goal validation succeeded)
- **No v1 blockers found in Scenario B** (second repo, google-login goal, validation succeeded)
- **No v1 blockers found in Scenario C** (one-line `curl | sh` install, profile and goal validation succeeded)
- **No v1 blockers found in Scenario D1** (generic project runtime-native install, no root pollution, profile validation succeeded)
- **No v1 blockers found in Scenario D2** (codex project install, no root pollution, profile validation succeeded; manual Codex BLOCKED by API limit, bootstrap merge gap is v0.9.x patch not v1 blocker)
- **No v1 blockers found in Scenario D3** (cursor install and `.mdc` payload pass; `--profile-only` AGENTS.md gap is v0.9 contract candidate, not install failure)
- **No v1 blockers found in Scenario D4** (opencode install, runtime-aware validation pass; manual OpenCode not run)
- **No v1 blockers found in Scenario D5** (gemini project/global install, runtime-aware validation pass; manual extension load not confirmed)
- **No v1 blockers found in Scenario D6** (Claude project install, runtime-aware validation pass; global write skipped; manual plugin install not run)

## Post-D6 Triage (summary complete)

- **No root pollution blocker** for runtime-native modes (D1–D6)
- **Runtime-aware validation** — addressed ([runtime-aware-validation.md](runtime-aware-validation.md))
- **AGENTS.md init/runtime conflict** — addressed (D2 patch)
- **Gemini global write safety** — documented in D5; dry-run before global writes
- **Claude global UPDATE risk** — documented in D6; global write skipped on dogfood host
- Manual runtime checks outstanding → **stable-claim blockers only**, not experimental v0.9.x ship blockers

Artifacts: [runtime-dogfood-summary.md](runtime-dogfood-summary.md), [v0.9.x-readiness.md](v0.9.x-readiness.md), [v0.9.x-release-scope.md](v0.9.x-release-scope.md)

## Post-v1 Optional Work (Gemini)

- Manual Gemini CLI extension load check after global or `gemini extensions install`
- Verify whether project-local `.gemini/extensions/` loads in Gemini CLI (best-effort today)

## Post-v1 Optional Work

- minimal install tier for tiny repositories ([minimal-install-tier-decision.md](minimal-install-tier-decision.md) — deferred; not a v1 blocker)
- In-target copy of `validate.js` (only if contract changes; currently deferred)

## v1.x Candidates

- minimal install tier with explicit `full` vs `minimal` install modes after v1.0.0 stabilizes

## Later Optional Work

Automation, adapters, marketplace, semantic validation, archive generation, checksums—only if still justified after dogfood.

## Rejected / Not Worth It

Ideas considered and intentionally declined.

- Adding `validate.js` to default install surface for Scenario A alone (current `--target` from source pack is sufficient)
