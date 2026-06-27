# aix — AI Engineering Platform

> A TypeScript monorepo that consolidates six AI-engineering toolkits into one platform: a single skill registry, guardrail + autonomous SDLC loops, a graph knowledge base, boundary redaction, and "author once, compile to every provider" (Claude / Cursor / Codex / Gemini).

**Status:** v1 (active development). ESM, Node 22, strict TypeScript. Tests are intentionally deferred — validation is via Zod at boundaries, `aix doctor`, and dry-run.

## Why

Six separate repos (`ai-engineering-harness`, `agentic-sdlc`, `skills`, `docs-wiki`, `system-design-skills`, `dev-memory`) had overlapping skills, installers, and knowledge tooling in four incompatible formats. `aix` merges them into one canonical source (`content/`), one registry, one CLI, and one provider compiler. The original repos are preserved under [`imports/`](./imports) (imported via `git subtree`, history intact).

## Packages

| Package | Role |
|---|---|
| `@x/core` | Shared types, phase machine, guards, budget tracker |
| `@x/registry` | `SKILL.md` schema (Zod), loader, catalog, migrator |
| `@x/policy` | Boundary redaction (20+ secret/PII patterns), shell denylist |
| `@x/providers` | Pure adapters (Claude/Cursor/Codex/Gemini) + runtime LLM provider |
| `@x/compiler` | Idempotent, dry-run-capable file emitter (hash + generated-marker) |
| `@x/context` | Regex-based code analysis (tree-sitter planned), RAG index/query, wiki generation |
| `@x/memory` | Markdown-first store + KB adapter, redaction-wrapped |
| `@x/prompt` | Eval-driven prompt assembly + linter |
| `@x/preview` | Tiered preview (Mermaid / image / HTML server) |
| `@x/hitl` | Human-in-the-loop decision channel (always ≥2 options) |
| `@x/evals` | A/B harness + rubric scoring |
| `@x/engine` | Autonomous SDLC graph (LangGraph.js) with checkpoints |
| `@x/cli` | The `aix` command surface |
| `services/kb-server` | NestJS + Neo4j graph knowledge base (auth: master + bcrypt API keys) |

## Quick start

```bash
pnpm install
pnpm build          # turbo build — ESM + d.ts for all packages
pnpm lint           # tsc --noEmit across the workspace
aix doctor          # check Node / Neo4j / config
```

## CLI

```bash
aix skills validate | list [--kind] [--role] | show <name> | migrate [--write]
aix install --provider <claude|cursor|codex|gemini> [--dry-run] [--force] [--all]
aix context build [path] | query "<q>"
aix run "<task>"            # guardrail mode (human-reviewed phase loop)
aix run "<task>" --auto     # autonomous mode (LangGraph engine; writes generated
                            #   code to .aix/generated/<session>/ for review, not into src/)
aix run "<task>" --dry-run  # preview phases + token estimate, no execution
aix verify | ship
aix memory push|search|list|get
aix eval <suite>
aix doctor
```

## Knowledge base

`services/kb-server` is a NestJS service backed by Neo4j (Meilisearch + Redis via Docker Compose):

```bash
cd services/kb-server
cp .env.example .env        # set NEO4J_PASSWORD and KB_MASTER_PASSWORD (required — fails closed)
docker compose up
```

API keys are generated server-side (`kb_live_<hex>`), stored as bcrypt hashes, and verified per request. The master password is required; the server refuses unauthenticated admin access.

## Security model

- **Redaction at the boundary:** all memory writes pass through `@x/policy.redact` before hitting disk or the KB — secrets become `••••`. The KB never receives raw secrets.
- **Shell denylist** and **budget hard-stop (USD)** guard the autonomous engine.
- **Provider error bodies** are redacted before surfacing.

## Repository layout

```
packages/      13 @x/* packages
services/       kb-server (NestJS + Neo4j)
content/        canonical source: skills, agents, rules, workflows
imports/        the 6 original repos (git subtree, history preserved)
apps/docs       consolidated documentation
```

## License

MIT
