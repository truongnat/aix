# Breaking Change Policy

## Purpose

Define what counts as a breaking change for `ai-engineering-harness` contracts on the path to and after `v1.0.0`.

## What Counts As Breaking

A change is **breaking** if an adopter following the frozen contracts could fail validation or lose a guaranteed workflow without a documented migration.

Breaking examples:

- removing a required `PACK.md` heading
- renaming a required `.harness/` profile artifact file
- removing or renaming required headings in profile or goal artifacts checked by `validate.js`
- changing `validate.js` so previously valid target repos fail structural validation without artifact updates
- removing paths from default `install.js` `exportPaths` without migration guidance
- changing the source-pack vs target-repo boundary so product work is expected in the source repository
- requiring `validate.js` inside target repos when it was not previously required
- removing a default installed surface required file or directory from `install.js` `exportPaths` without migration
- making `PACK.md` required in target repositories by default
- changing from source-pack validation (`node validate.js --target`) to requiring target-local `validate.js` without migration
- removing required `.harness/TEAM.md` (or any frozen profile file) from the profile contract
- renaming `.harness/goals/<goal-id>/VERIFY.md` or other required goal files
- removing a required heading from `.harness/goals/<goal-id>/REMEMBER.md` (or other goal files) in `validate.js`
- making optional profile sections required in the validator without migration

## What Does Not Count As Breaking

These are generally **non-breaking** if contracts above stay satisfied:

- adding optional documentation files
- adding examples under `examples/`
- clarifying wording without changing required structure
- adding optional manifest or profile sections not enforced by `validate.js`
- adding a new runtime guide without changing existing consumption contracts
- adding dogfood reports or planning artifacts in the source pack
- improving install summary display (`targetDisplay`) without changing copy destinations

## Pre-v1 Rules

Before `v1.0.0`:

- prefer additive changes
- align [stable-contract-index.md](stable-contract-index.md) and `validate.js` in the same release when freezing behavior
- document any intentional contract change in CHANGELOG and release notes
- use [v0.9.0 plan](v0.9.0-plan.md) steps before declaring a contract frozen

## Post-v1 Rules

After `v1.0.0`:

- follow semantic versioning intent: breaking contract changes require a major version
- provide migration notes for installed surface, validator, or artifact heading changes
- deprecate before remove when adopters depend on frozen structure

## Deprecation Expectations

- announce deprecations in CHANGELOG and release notes
- keep deprecated structure working for at least one minor release when feasible
- point to replacement paths in docs (for example example-to-target layout mapping)

## Examples

| Change | Breaking? |
|---|---|
| Add `docs/new-guide.md` and require it in source `validate.js` only | No for target repos |
| Remove `## Non-Goals` from required `PACK.md` headings | Yes |
| Add optional section to `HARNESS.md` template not checked by validator | No |
| Split `SKILLS.md` into two required files | Yes |
| Dogfood fix: document validate from source pack | No |
| Shrink `exportPaths` and drop `docs/adoption-guide.md` | Yes without migration |
| Add `PACK.md` to default `exportPaths` without opt-out | Yes for teams relying on no local manifest |
| Require `validate.js` in target repo for profile validation | Yes |
| Remove `.harness/TEAM.md` from required profile files | Yes |
| Rename goal `VERIFY.md` to `VERIFICATION.md` in validator | Yes |
| Drop `## Sensitive Data Check` from required REMEMBER headings | Yes |
| Add new required `## Stakeholders` to HARNESS without migration | Yes |

See also [minimal-install-tier-decision.md](minimal-install-tier-decision.md) for a deferred extension that would be breaking if introduced without a major version and migration plan.
