# Dogfood Notes

## Purpose

Record a real local dogfood pass of the released `ai-engineering-harness` on a small target repository.

## Environment

- OS: macOS (`Darwin`)
- Node version: `v24.14.0`
- target repo type: local toy repository
- date: `2026-06-02`

## Commands Run

- `node install.js --target ../harness-dogfood-target --dry-run`
- `node install.js --target ../harness-dogfood-target`
- `node validate.js --target ../harness-dogfood-target --profile-only`
- `node validate.js --target ../harness-dogfood-target --goal health-check`
- intentional profile failure:
  `node validate.js --target ../harness-dogfood-target --profile-only`
- intentional goal failure:
  `node validate.js --target ../harness-dogfood-target --goal health-check`

## Results

- installer dry-run succeeded
- real install succeeded
- target profile validation passed
- target goal validation passed
- intentional profile break was caught
- intentional goal break was caught
- restored target profile and goal both passed again

## What Worked Well

- dry-run output was explicit and predictable
- real install copied the expected markdown-only surface
- the profile validator passed immediately once the required artifacts existed
- the goal validator passed immediately once the required artifacts existed
- failure messages named the exact file and missing heading
- restoring the broken headings returned the target repo to a clean state quickly

## What Was Confusing

- installer output is accurate but long and visually flat for first-time review
- after install, the next recommended action is not obvious from the installer output itself
- the target repo requirement for creating `.harness/` profile files is clear in docs, but not surfaced in the install command output

## Validator Findings

- profile validation is actionable in practice
- goal validation is actionable in practice
- intentional failures confirmed that missing-heading errors are precise enough for a human to fix quickly
- the validator behaves exactly like a structural contract checker and does not over-claim correctness

## Installer Findings

- the installer works cleanly on a local toy repository
- no skipped files appeared in the dogfood run because the target repo was nearly empty
- copied surface is understandable once the user already knows to read adoption and build docs

## Documentation Findings

- adoption and target validation docs are sufficient to complete the dogfood flow
- the harness remains usable without adding runtime code or automation
- a short “what to do immediately after install” cue in installer output could reduce first-run confusion, but this is optional

## Safety Review

- no secrets were used
- no private business data was recorded
- no application code was modified

## Recommended Improvements

### v0.3.x patch candidate

- add a short post-install hint in documentation that points directly to `docs/adoption-guide.md` and `docs/target-repo-validation.md`
- add one compact install-output example to help first-time users understand expected copy volume

### v0.4.0 candidate

- improve validation ergonomics without changing the structural-only boundary
- add richer dogfood-oriented examples for very small repositories
- refine memory conventions for tiny repos that do not need a heavy planning surface

### later optional work

- optional context warnings for non-required artifacts
- optional grouped or summarized installer reporting
- optional deeper validation ideas beyond strict harness structure

## Release Impact

This dogfood run increases confidence in `v0.3.0`.

The released harness works on a real local target repository, and the validator feedback is clear enough to support practical adoption without adding runtime complexity.
