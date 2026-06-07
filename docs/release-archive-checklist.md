# Release Archive Checklist

Use this checklist together with [manual-packaging-guide.md](manual-packaging-guide.md).

Complete [pack-verification-checklist.md](pack-verification-checklist.md) before assembling a release archive so `PACK.md`, surface mapping, and validation commands stay aligned.

## Required Files

- `PACK.md`
- `AGENTS.md`
- `bin/aih.js`
- `bin/validate.js`
- `LICENSE`
- `README.md`

## Required Directories

- `commands/`
- `skills/`
- `workflows/`
- `patterns/`
- `templates/`

## Required Docs

- `docs/adoption-guide.md`
- `docs/harness-build-usage.md`
- `docs/install-to-profile-walkthrough.md`
- `docs/target-repo-validation.md`
- `docs/validation-troubleshooting.md`
- `docs/small-repo-memory.md`

## Excluded Content

- private or local artifacts
- generated state
- maintenance-only repository files unless explicitly useful
- runtime, server, or database files
- CI-only files unless explicitly needed

## Validation Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`

## Manual Release Notes

- archive generation is not implemented yet
- the archive is a distribution model, not a runtime platform
- the target repository remains where product work happens

## Safety Review

- confirm the archive surface matches the installed-surface contract
- confirm no secrets or private business data are included
- confirm no runtime behavior is implied by the archive contents
