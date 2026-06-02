# Pack Dogfood Report — Scenario B

## Scenario

Scenario B: Frontend Or Mobile Repo — Feature Goal ([pack-dogfood-scenarios.md](../pack-dogfood-scenarios.md))

## Target Repo Type

Semi-real Flutter-style mobile product skeleton (sibling dogfood repo, distinct from Scenario A tiny Node repo).

## Runtime Used

Codex (scoped session discipline: artifact-first planning from source pack terminal, target repo for `.harness/` only).

## Consumption Mode

Install/copy via `install.js` from source pack (same mode as Scenario A; not vendored).

## Commands Run

```bash
# From source pack root
node install.js --target ../harness-dogfood-mobile --dry-run
node install.js --target ../harness-dogfood-mobile
node validate.js --target ../harness-dogfood-mobile --profile-only
node validate.js --target ../harness-dogfood-mobile --goal google-login
```

Local bootstrap: `README.md`, `pubspec.yaml`, `lib/main.dart` placeholder only.

## Artifacts Created

| Path | Purpose |
|---|---|
| `.harness/HARNESS.md` | Mobile app profile; google-login + guest mode |
| `.harness/TEAM.md` | Producer-reviewer for auth feature |
| `.harness/SKILLS.md` | Core skills + mobile and backend packs |
| `.harness/WORKFLOW.md` | Feature workflow |
| `.harness/GATES.md` | Auth/guest quality gates |
| `.harness/MEMORY.md` | No-secrets memory rules |
| `.harness/goals/google-login/GOAL.md` | Feature goal: Google login, preserve guest |
| `.harness/goals/google-login/PLAN.md` | Feature plan (implementation deferred) |
| `.harness/goals/google-login/TASKS.md` | Task list through validation |
| `.harness/goals/google-login/VERIFY.md` | Structural + planned manual checks |
| `.harness/goals/google-login/REMEMBER.md` | Scenario B lesson summary |

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node validate.js --target ../harness-dogfood-mobile --profile-only` | pass | Profile contract |
| `node validate.js --target ../harness-dogfood-mobile --goal google-login` | pass | Goal contract |

## What Worked

- Second distinct target repo adopted the same install flow as Scenario A (83 copied, 0 failed)
- Mobile + backend skill packs fit naturally in `.harness/SKILLS.md` under validator heading contract
- `google-login` goal headings aligned with validator on first pass
- [flutter-google-login example](../../examples/harness-build/flutter-google-login/) helped feature scope and guest-mode acceptance criteria without copying sensitive product data
- `--target` validation from source pack worked again for a different repo layout (pubspec + lib/)

## What Was Confusing

- Example `HARNESS.md` / `SKILLS.md` in flutter-google-login use richer section shapes than target validation requires; adopters must normalize to `.harness/` contracts
- Example goals live under `examples/.../goals/` not `.harness/goals/`—easy to misread as the install target shape
- Install summary still prints absolute target path (same as Scenario A)

## Missing Docs

- Short bridge doc: “from harness-build example → `.harness/` validator contracts”
- Mobile dogfood path could reference `docs/runtimes/codex.md` read-first list explicitly in one checklist

## Pack Surface Issues

- Full install surface (83 paths) again feels heavy for a skeleton mobile repo
- `harness-build-usage.md` is helpful but long for a first mobile adoption pass

## Runtime Issues

- Codex/session discipline benefited from explicit “work in target repo, validate from source pack” rule; no adapter required
- No blocker when following runtime consumption model

## Safety Notes

- Fictional shopper app context only; no OAuth secrets or customer data
- Report uses relative repo names only
- Flutter implementation intentionally out of scope for Scenario B

## Follow-up Candidates

| Item | Classification |
|---|---|
| Document mapping from flutter-google-login example to `.harness/` validator headings | v0.8.x fix |
| Clarify example tree vs installed `.harness/` layout in harness-build README | v0.8.x fix |
| Relative path in install summary | v0.8.x fix (same as Scenario A) |

## Release Impact

Supports v0.8.0 dogfood completion. **No v1 blockers** from Scenario B.
