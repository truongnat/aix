# aix — AI Engineering Platform

> A **Claude Code plugin**: an opinionated engineering methodology (brainstorm → plan → TDD →
> subagent-driven dev → review → ship) plus a 160+ skill library (domain + process), activated at
> session start. **The host agent is the runtime** — aix is the playbook and the library, not a
> separate engine you invoke.

**Status:** v1 (active development). ESM, Node 22, strict TypeScript.

## How it works (the plugin model)

aix follows the [superpowers](https://github.com/obra/superpowers) model. On `/plugin install`:

1. A `SessionStart` hook injects one entry-point skill — [`using-aix`](./content/skills/using-aix/SKILL.md) —
   into the agent's context. It explains the methodology spine and how to reach every other skill.
2. All 164 skills under [`content/skills/`](./content/skills) become available to the host's **`Skill`
   tool** (declared via `"skills"` in [`.claude-plugin/plugin.json`](./.claude-plugin/plugin.json)).
3. The agent works the [engineering spine](./content/workflows/engineering-spine.md), dispatching
   **its own native subagents** (the host's `Task` tool) per plan task. There is no aix runtime engine
   in this path — the host *is* the runtime.

```bash
# In Claude Code:
/plugin marketplace add truongnat/aix
/plugin install aix
# New session → using-aix is injected → 164 skills reachable via the Skill tool.
```

## Why

Six separate repos (`ai-engineering-harness`, `agentic-sdlc`, `skills`, `docs-wiki`, `system-design-skills`, `dev-memory`) had overlapping skills, installers, and knowledge tooling in four incompatible formats. `aix` merges them into one canonical source (`content/`), one registry, one CLI, and one provider compiler. The original repos are preserved under [`imports/`](./imports) (imported via `git subtree`, history intact; kept locally, not tracked).

## The engineering spine

The default methodology the plugin gives an agent. Each step is a real process skill, invoked via the `Skill` tool:

| # | Step | Skill |
|---|------|-------|
| 1 | Align & Shape | `discussing-pro` |
| 2 | Plan | `planning-pro` |
| 3 | Execute | `executing-pro` |
| 4 | Isolate | `using-git-worktrees` |
| 5 | Test-first | `test-driven-development` |
| 6 | Review | `requesting-code-review` / `code-review` |
| 7 | Verify | `verification-before-completion` |
| 8 | Remember | `remembering` |

See [`content/workflows/engineering-spine.md`](./content/workflows/engineering-spine.md) for the full flow.

## Supporting tooling (the monorepo)

aix also ships a TypeScript monorepo for authoring, compiling, and (optionally) running the library outside an interactive host. This is **secondary** to the plugin path above.

| Package | Role |
|---|---|
| `@x/core` | Shared types, phase machine, guards, budget tracker |
| `@x/registry` | `SKILL.md` schema (Zod), loader, catalog, migrator |
| `@x/policy` | Boundary redaction (20+ secret/PII patterns), shell denylist |
| `@x/providers` | Pure adapters (Claude/Cursor/Codex/Gemini) + runtime LLM provider |
| `@x/compiler` | Idempotent, dry-run-capable file emitter (hash + generated-marker) |
| `@x/context` | Regex-based code analysis, RAG index/query, wiki generation |
| `@x/memory` | Markdown-first store + KB adapter, redaction-wrapped |
| `@x/prompt` | Eval-driven prompt assembly + linter |
| `@x/preview` | Tiered preview (Mermaid / image / HTML server) |
| `@x/hitl` | Human-in-the-loop decision channel (always ≥2 options) |
| `@x/evals` | A/B harness + rubric scoring |
| `@x/engine` | **Optional headless/CI runner** — autonomous SDLC graph (LangGraph.js) for *non-interactive* runs (CI, batch). Not used by the plugin path; the host agent is the runtime there. |
| `@x/cli` | The `aix` command surface (authoring + compile + headless run) |
| `services/kb-server` | NestJS + Neo4j graph knowledge base (auth: master + bcrypt API keys) |

### When to use `@x/engine`

Only when there is **no interactive host** to be the runtime — e.g. a CI job or batch pipeline that
must drive the SDLC loop unattended. In that path the engine writes generated code to
`.aix/sessions/<session>/generated/` for review (never directly into `src/`), tracks USD budget with a
hard-stop, and fails loud in mock mode. **In Claude Code / Cursor / any interactive agent, you do not
need the engine** — install the plugin and let the host drive the spine.

## Quick start (monorepo / authoring)

```bash
pnpm install
pnpm build          # turbo build — ESM + d.ts for all packages
pnpm lint           # tsc --noEmit across the workspace
pnpm test           # node --test engine smoke tests
aix doctor          # check Node / Neo4j / config (config is optional)
```

## CLI

```bash
aix skills validate | list [--kind] [--role] | show <name> | migrate [--write]
aix install --provider <claude|cursor|codex|gemini> [--dry-run] [--force] [--all]
                            # secondary path: compile content/ into a provider's
                            #   native format. For Claude Code, prefer the plugin.
aix context build [path] | query "<q>"
aix run "<task>"            # guardrail mode (human-reviewed phase loop)
aix run "<task>" --auto     # headless engine (writes generated code to
                            #   .aix/sessions/<session>/generated/ for review, not into src/)
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
- **Shell denylist** and **budget hard-stop (USD)** guard the headless engine path.
- **Provider error bodies** are redacted before surfacing.

## Repository layout

```
.claude-plugin/  plugin.json + marketplace.json (the plugin manifest)
hooks/           SessionStart hook that injects using-aix
content/         canonical source: skills (164), agents, rules, workflows
packages/        13 @x/* packages (authoring, compile, headless engine)
services/        kb-server (NestJS + Neo4j)
imports/         the 6 original repos (git subtree, history preserved; untracked)
apps/docs        consolidated documentation
```

## Contributing

`content/skills/` is the community-editable layer — add or improve a skill without touching the
TypeScript packages. See [`content/skills/CONTRIBUTING.md`](./content/skills/CONTRIBUTING.md) for the
layout, the `SKILL.md` frontmatter schema, and the checks your PR must pass. For *how to design* a
good skill, invoke the `writing-skills` skill. Reviews are routed via [`.github/CODEOWNERS`](./.github/CODEOWNERS).

## License

MIT
