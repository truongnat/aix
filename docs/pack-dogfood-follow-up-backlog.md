# Pack Dogfood Follow-up Backlog

Triage dogfood findings from [pack-dogfood-friction-log.md](pack-dogfood-friction-log.md) and completed [pack-dogfood reports](pack-dogfood-report-template.md).

## v0.8.x Patch Candidates

Doc clarifications, scenario fixes, and small guidance updates that do not change core contracts.

- Optional: Scenario A quick-path doc linking plan, install walkthrough, and scenarios

## Addressed In v0.8.0 Fix Pass

- Document that `node validate.js --target` runs from the source pack (Scenarios A, B)
- Install summary prefers `--target` argument / safe relative display (Scenarios A, B)
- [harness-example-to-target-layout.md](harness-example-to-target-layout.md) for example → `.harness/` mapping (Scenario B)
- flutter-google-login README layout vs target layout (Scenario B)

## v0.9 Contract Freeze Candidates

Items that should become explicit stable contracts in `v0.9.0` (PACK.md, installed surface, harness profile, goal artifacts, validation behavior).

- Clarify whether a future “minimal install” surface is a contract variant or optional profile (83 paths felt heavy for tiny repo)

## v1.0 Blockers

Issues that must be resolved before a stable `v1.0.0` capability pack release.

- **No v1 blockers found in Scenario A** (install, profile, goal validation succeeded)
- **No v1 blockers found in Scenario B** (second repo, google-login goal, validation succeeded)

## Later Optional Work

Automation, adapters, marketplace, semantic validation, archive generation, checksums—only if still justified after dogfood.

- Optional minimal install tier for tiny repositories
- In-target copy of `validate.js` (only if contract changes; currently deferred)

## Rejected / Not Worth It

Ideas considered and intentionally declined.

- Adding `validate.js` to default install surface for Scenario A alone (current `--target` from source pack is sufficient)
