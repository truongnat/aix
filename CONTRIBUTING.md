# Contributing

## Project Philosophy

`ai-engineering-harness` is a markdown-first operating model for engineering agents. The repository should stay lightweight, explicit, and easy to adopt without adding runtime complexity.

## Definition of Done

A contribution is **done** when:

1. `npm run lint`, `npm run format:check`, `node bin/validate.js`, and `npm test` pass locally
2. Changes to `lib/` meet the coverage gate: `npm run test:coverage`
3. PRs that change **rules, workflows, commands, or hooks** include either:
   - an eval run (`aih eval run <task> --yes`), or
   - a targeted test proving behavior did not regress
4. User-facing CLI/docs updates include help text and `docs/` reference when applicable
5. Version-facing edits use `package.json` as the single source of truth (`node scripts/sync-site-version.js` when site badges change)

## Welcome Contributions

Useful contributions include:

- clarifying docs
- improving commands, skills, workflows, and examples
- tightening validation when required files or contracts change
- improving adoption guidance without adding a runtime layer
- eval tasks, rubrics, and telemetry insights

## Out Of Scope

Please do not add heavy runtime features without explicit roadmap approval, including:

- servers
- databases
- Docker-based platform layers
- orchestration frameworks
- large dependency trees

## Commands And Skills

When adding or editing command documents:

- preserve the required command headings
- keep the guidance operational and practical

When adding or editing skills:

- preserve the required skill headings
- keep skills compact and reusable
- avoid turning packs or skills into encyclopedias

## Validation

If required files change, update `bin/validate.js` accordingly.

Before submitting changes, run:

```bash
npm run lint
npm run format:check
node bin/validate.js
npm test
npm run test:coverage
```

## Releases

Use [Changesets](https://github.com/changesets/changesets): `npx changeset` when your PR should trigger a version bump.

Branch protection guidance: [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md).
