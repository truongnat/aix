# Release Checklist

## Purpose

Use this checklist to prepare and verify a release while the repository uses
automated npm publication through the changesets release workflow.

## npm package (v0.10.x+)

- run `npm pack --dry-run` and confirm `test/` and `examples/` are **not** in the tarball
- run `npm publish --dry-run` to catch registry or packaging issues before the real publish
- run `node bin/aih.js --help`
- run `npm test` and `node bin/validate.js`
- confirm the release workflow is the intended publish path: see [npm-publish.md](npm-publish.md)
- smoke: `npx --yes ai-engineering-harness@latest install --provider cursor --yes --dry-run`

## Pre-Release Checks

- confirm the intended release scope is documentation-first
- confirm no runtime layer or dependency creep was introduced
- confirm the repository still reflects the markdown-first operating model
- confirm no `harness-dogfood-*` target repos or temp/debug artifacts are tracked (reports may reference `../harness-dogfood-*` paths only)

## Documentation Checks

- review `README.md`
- review `AGENTS.md`
- review `docs/adoption-guide.md`
- review `CHANGELOG.md`
- review any newly added adoption or workflow docs for clarity and consistency
- review `docs/release-archive-checklist.md` before publishing a release archive

## Validation Checks

- run `node bin/validate.js`
- confirm the validation result is a clean pass
- inspect any updated example files for obvious broken links or contradictions

## Safety Checks

- confirm no secrets, tokens, customer data, or private business data exist in artifacts
- confirm no generated runtime state was added to the repository
- confirm no automation or packaging work slipped into the release

## Release Workflow Steps

1. Run `node bin/validate.js`
2. Inspect `git status`
3. Review `README.md`
4. Review `AGENTS.md`
5. Review `docs/adoption-guide.md`
6. Update the `CHANGELOG.md` release date when releasing
7. Merge the changesets release PR once validation is complete
8. Confirm the release workflow published npm with provenance
9. Confirm the tag workflow created the GitHub Release

## Current v1.x Validation Commands

- `node bin/validate.js`
- `npm test`
- `npx ai-engineering-harness --help`
- `npm run build --prefix site`
- `npm pack --dry-run`
- `npm publish --dry-run`
- `git status`

## Post-Release Checks

- confirm the tag points to the intended commit
- confirm the repository still validates after the final release commit
- confirm the release notes and changelog stay aligned

## What Not To Add For Releases

- no runtime adapters
- no heavy runtime systems
- no server, database, Docker, LangGraph, or orchestration framework

## Historical Release Snapshots

The version-by-version command blocks below are retained as historical release
records for earlier tags. They are not the primary v1.x release instructions.

## v0.1.0 Final Manual Commands

- `node bin/validate.js`
- `git status`
- `git tag v0.1.0`
- `git push origin v0.1.0`

## v0.2.0 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `git status`
- `git tag v0.2.0`
- `git push origin v0.2.0`

## v0.3.0 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `git status`
- `git tag v0.3.0`
- `git push origin v0.3.0`

## v0.3.1 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `git status`
- `git tag v0.3.1`
- `git push origin v0.3.1`

## v0.4.0 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `git status`
- `git tag v0.4.0`
- `git push origin v0.4.0`

## v0.5.0 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `git status`
- `git tag v0.5.0`
- `git push origin v0.5.0`

## v0.6.0 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `git status`
- `git tag v0.6.0`
- `git push origin v0.6.0`

## v0.7.0 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `git status`
- `git tag v0.7.0`
- `git push origin v0.7.0`

## v0.8.0 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `git status`
- `git tag v0.8.0`
- `git push origin v0.8.0`

## v0.9.0 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `git status`
- `git tag v0.9.0`
- `git push origin v0.9.0`

## v0.9.1 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `node bin/validate.js --target test/fixtures/valid-target-profile-cursor --runtime cursor --profile-only`
- `git status`
- `git tag v0.9.1`
- `git push origin v0.9.1`

## v0.9.2 Final Manual Commands

- `node bin/validate.js`
- `npm test`
- `node bin/validate.js --target test/fixtures/valid-target-profile --profile-only`
- `node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login`
- `node bin/validate.js --target test/fixtures/valid-target-profile-cursor --runtime cursor --profile-only`
- `git status`
- `git tag v0.9.2`
- `git push origin v0.9.2`

## v1.0.1 Final Validation Commands

- `node bin/validate.js`
- `npm test`
- `npx ai-engineering-harness --help`
- `npm run build --prefix site`
- `npm pack --dry-run`
- `npm publish --dry-run`
- `git status`
