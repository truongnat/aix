# Repository Context

## Project

`ai-engineering-harness` — markdown-first engineering discipline pack for AI coding agents (Claude, Cursor, Codex, Gemini).

## Key Paths

- `lib/` — TypeScript CLI, install orchestrator, domain skill generation, validation
- `hooks/core/` — portable hook scripts (`codex-hook-router.js`, `domain-bootstrap.js`)
- `commands/` — canonical harness command contracts
- `.ai-harness/` — project-local capability cache (installed)
- `.cursor/` — Cursor native commands and rules (installed)
- `.harness/` — project state, domain skills, sessions

## Quality Gates

- `npm run build` — TypeScript compile
- `npm test` — regression suite
- `node bin/validate.js` — repository contract validation

## Selected Domains

backend, devops, debugging (see `.harness/config.json`)

## Provider

Cursor (project install with `.cursor/commands/` and `.cursor/rules/`)
