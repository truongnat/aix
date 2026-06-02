# Capability Pack Manifest

## Pack Name

ai-engineering-harness

## Pack Version

v0.8.0

## Pack Type

plugin-like markdown capability pack

## Purpose

Help AI coding agents consume engineering discipline inside target repositories through commands, skills, workflows, patterns, templates, harness profiles, and structural validation—without treating the source pack repository as the product work tree.

## Included Surface

- `AGENTS.md`
- `commands/`
- `skills/`
- `workflows/`
- `patterns/`
- `templates/`
- selected adoption and validation docs under `docs/` (see installed-surface contract)
- `install.js`
- `validate.js`
- `LICENSE`
- `README.md`
- `PACK.md`

Target repositories receive the installed surface subset via `install.js` or manual copy, plus `.harness/` artifacts created in the target repo.

## Consumption Modes

- install or copy into target repository (recommended)
- vendored harness directory inside target repository
- global agent capability folder (runtime-dependent)
- release archive (manual versioned snapshot)
- future plugin or package registry (not implemented)

## Runtime Compatibility

Documented consumption guidance for:

- Claude Code
- Cursor
- Codex
- Gemini CLI
- OpenCode

Compatibility is docs-only. No runtime adapters are included in this pack.

## Validation Commands

Source pack verification:

```bash
node validate.js
npm test
node validate.js --target test/fixtures/valid-target-profile --profile-only
node validate.js --target test/fixtures/valid-target-goal --goal google-login
```

After install into a target repository:

```bash
node validate.js --target <path> --profile-only
node validate.js --target <path> --goal <goal-id>
```

## Safety Boundaries

- markdown is the source of truth
- do not store secrets, tokens, or private business data in harness artifacts
- validation is structural only and does not prove application correctness
- do not add runtime adapters or server behavior under the name of packaging
- keep product work and `.harness/` state in the target repository

## Non-Goals

- npm package publishing
- marketplace automation
- runtime adapters or compiled plugins
- server, database, or background systems
- semantic validation or deep repository scanning
- archive generation automation in v0.7.0 planning scope
