# Pack Dogfood Follow-up Backlog

Triage dogfood findings from [pack-dogfood-friction-log.md](pack-dogfood-friction-log.md) and completed [pack-dogfood reports](pack-dogfood-report-template.md).

## v0.9.x Patch Candidates

- One-line install: improve `install.js` next steps to mention `curl | sh` install path and validate-from-source-pack ([scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md))
- Repeat: install summary relative target display when invoked via `install.sh` with relative `--target`
- D1: clarify harness-init vs generic runtime `AGENTS.md` CREATE/SKIP in install output ([scenario-d1-generic-project.md](pack-dogfood-reports/scenario-d1-generic-project.md))
- D2: `--init-harness` + codex/generic should apply `AGENTS.project.md` or skip init AGENTS when runtime will write ([scenario-d2-codex-project.md](pack-dogfood-reports/scenario-d2-codex-project.md))
- D2: document `codex exec --skip-git-repo-check` for non-git throwaway targets

## v0.8.x Patch Candidates

Doc clarifications, scenario fixes, and small guidance updates that do not change core contracts.

- Optional: Scenario A quick-path doc linking plan, install walkthrough, and scenarios

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
