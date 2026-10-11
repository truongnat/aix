# aix — Agent Instructions

aix is an AI engineering platform: a skills library + opinionated engineering spine, delivered as plugins for Claude Code, Codex, Cursor, and Gemini.

## Repository layout

```
plugin.json          Agent Plugins 1.0 manifest (canonical)
AGENTS.md            this file — canonical agent instructions
skills/<name>/       skills in Agent Skills spec format (SKILL.md + references/scripts)
workflows/           engineering-spine doc + spine.js (Claude workflows)
rules/core/          spine operating contract → provider instruction files
hooks/               SessionStart hook → injects using-aix
evals/               plugin eval cases (claude plugin eval)
.claude-plugin/      Claude Code manifest + marketplace.json
.cursor-plugin/      Cursor manifest
gemini-extension.json Gemini extension manifest
packages/            @x/* TypeScript workspace (CLI, engine, registry, ...)
apps/docs            VitePress docs site
```

## Working in this repo

- Install/build/test: `pnpm install`, `pnpm build`, `pnpm test` (Node ≥22, pnpm 9)
- Validate skills: `node packages/cli/dist/index.js skills validate`
- One skill = `skills/<name>/SKILL.md`; `name` frontmatter MUST equal dir name
- Frontmatter: spec fields (`name`, `description`, `metadata:`, `license`, `compatibility`, `allowed-tools`). Custom fields go under `metadata:` — never `x-*` top-level keys
- Keep SKILL.md body < ~5000 tokens; push depth into `references/`

## The engineering spine

Session artifacts (DISCUSSION.md, PLAN.md, REVIEW.md, VERIFY.md, REMEMBER.md) live in `.aix/sessions/<session-id>/` — never `.planning/` or other harness dirs. Flow: discuss → plan → isolate → test-first → execute → review → verify → remember. See `workflows/engineering-spine.md`.

## Commits

Conventional commits (`feat(scope):`, `fix(scope):`, `test(scope):`). Do not commit `.aix/` session artifacts or `node_modules/`.
