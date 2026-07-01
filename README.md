# aix — AI Engineering Platform

> An AI engineering platform / plugin: an opinionated SDLC methodology plus a
> 158‑skill library, activated at session start. **The host agent is the runtime** —
> aix is the playbook and the library, not a separate engine you invoke.

**Status:** v1 (active development). ESM, Node 22, strict TypeScript.

## How it works (the plugin model)

On `/plugin install`:

1. A `SessionStart` hook injects one entry-point skill — [`using-aix`](./content/skills/using-aix/SKILL.md) —
   into the agent's context. It explains the methodology spine and how to reach every other skill.
2. All 158 skills under [`content/skills/`](./content/skills) become available to the host's **`Skill`
   tool** (declared via `"skills"` in [`.claude-plugin/plugin.json`](./.claude-plugin/plugin.json)).
3. The agent works the engineering spine, dispatching
   **its own native subagents** (the host's `Task` tool) per plan task. There is no aix runtime engine
   in this path — the host *is* the runtime.

```bash
# In Claude Code:
/plugin marketplace add truongnat/aix
/plugin install aix
```

## Why

Six separate repos (`ai-engineering-harness`, `agentic-sdlc`, `skills`, `docs-wiki`, `system-design-skills`, `dev-memory`) had overlapping skills, installers, and knowledge tooling in incompatible formats. `aix` merges them into one canonical source (`content/`), one registry, one CLI, and one provider compiler. The original repos are preserved under [`imports/`](./imports) (git subtree, history intact; kept locally, not tracked).

## The engineering spine

Each step is a process skill invoked via the `Skill` tool:

| # | Step | Skill |
|---|------|-------|
| 1 | Align & Shape | `discussing-pro` |
| 2 | Plan | `planning-pro` |
| 3 | Isolate | `git-worktree-pro` |
| 4 | Test-first | `ttd-pro` |
| 5 | Execute | `executing-pro` |
| 6 | Review | `code-review-pro` |
| 7 | Verify | `verify-pro` |
| 8 | Remember | `remember-pro` |

## Supporting tooling (the monorepo)

aix also ships a TypeScript monorepo for authoring, compiling, and running the library outside an interactive host. This is **secondary** to the plugin path.

| Package | Role |
|---|---|
| `@x/core` | Shared types, phase machine, guards, budget tracker |
| `@x/registry` | `SKILL.md` schema (Zod), loader, catalog, migrator |
| `@x/policy` | Secret/PII redaction, shell denylist |
| `@x/providers` | Compile-time adapters (Claude/Cursor/Codex/Gemini) + runtime LLM provider |
| `@x/compiler` | Idempotent file emitter (hash + generated-marker) |
| `@x/context` | Code analysis, RAG index/query, wiki generation |
| `@x/memory` | Markdown-first store + KB adapter |
| `@x/prompt` | Prompt assembly + linter |
| `@x/preview` | Tiered preview (Mermaid / image / HTML) |
| `@x/hitl` | Human-in-the-loop decision channel |
| `@x/evals` | A/B harness + rubric scoring |
| `@x/engine` | **Optional headless runner** — autonomous SDLC graph with checkpointing, budget guards, structured logging. For CI/batch runs without an interactive host. |
| `@x/cli` | The `aix` command surface (authoring + compile + headless run) |
| `services/kb-server` | SQLite-backed knowledge base with in-memory cache |

### When to use `@x/engine`

Only when there is **no interactive host** — e.g. a CI job or batch pipeline that
must drive the SDLC loop unattended. **In Claude Code / Cursor / any
interactive agent, install the plugin and let the host drive the spine.**

## Quick start

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
```

## CLI

```bash
aix install --provider <claude|cursor|codex|gemini> [--all]
aix run "<task>"
aix verify | ship
aix memory push|search|list|get
aix skills list | show <name>
aix doctor
```

## Knowledge base

`services/kb-server` is a SQLite-backed service (no external dependencies):

```bash
cd services/kb-server
cp .env.example .env
pnpm dev
```

API keys are generated server-side, stored as bcrypt hashes, and verified per request.

## Security model

- **Redaction at the boundary:** all memory writes pass through `@x/policy.redact` before hitting disk — secrets become `••••`.
- **Shell denylist** and **budget hard-stop** guard the headless engine path.

## Repository layout

```
.claude-plugin/  plugin manifest
content/         canonical source: skills (158), rules, workflows
packages/        @x/* packages (authoring, compile, engine)
services/        kb-server (SQLite)
imports/         original repos (git subtree, untracked)
```

## License

MIT
