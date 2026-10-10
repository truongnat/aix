# Changelog

All notable changes to **aix** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.2.0] — 2026-10-11

### Changed (breaking)
- **Redesigned to Agent Plugins 1.0 + Agent Skills spec.** Root `plugin.json` is now the
  canonical manifest; vendor manifests live in `.claude-plugin/`, `.cursor-plugin/`,
  `gemini-extension.json` (regenerable via `aix plugin build`).
- **Skills moved to `skills/<name>/SKILL.md`** (spec layout, root level). The old
  `content/skills/` layout and the flat `skills/*.md` export are gone.
- **Frontmatter `x-*` → `metadata:` map.** `metadata.kind|version|tags|roles|compatible`;
  `name` must equal directory name (enforced by the registry). Descriptions capped at 1024 chars.
- **AGENTS.md is the canonical instruction file** (CLAUDE.md = `@AGENTS.md` import;
  GEMINI.md thin pointer).
- **Engineering spine is now a native Claude `workflows/` script** (`workflows/spine.js`)
  — `SessionStart` hook injection removed.

### Added
- `aix init` — scaffold `.aix/` + AGENTS.md section in a project.
- `aix plugin build` — emit vendor manifests from canonical `plugin.json`.
- `skills.sh.json` — skills.sh registry groupings; `npx skills add truongnat/aix` works.
- `skills-release.json` — per-skill sha256; `aix doctor` flags stale installs.
- **77 new skills** merged from `simple-skills`, `clean-code-skills`, `tester-skills`
  (clean-code-* set, manual-QA toolkit, ba/design/expo/office/misc domains).

### Removed
- `services/kb-server`, `kb` CLI commands, `KbStore` — memory is `MarkdownStore` only.
- `hooks/` (SessionStart injection), `.agents/`, `.cursor/`, `.claude/settings.json`,
  `.codex-plugin/`, `apps/todo-sync`, stale `SKILL.md` root file.
- Internal duplicates: `system-design-pro` (merged into `system-design`),
  `test-driven-development-pro` (merged into `ttd-pro`).

### Fixed
- 4 dir↔frontmatter `name` mismatches (spec violation), 22 over-length descriptions.

### Fixed (carried from unreleased)
### Fixed
- **Engine now writes generated code to disk.** `coderNode` persists model output to
  a sandbox `.aix/generated/<sessionId>/` (path-traversal-guarded) instead of discarding
  it. The autonomous loop produces real, reviewable artefacts — it never clobbers `src/`.
- **Budget hard-stop is now wired.** `coderNode` feeds real provider `usd`/`tokens` back
  into the session via `BudgetTracker.addUsage()`. `checkHardStop` now sees actual spend;
  the loop stops when `usdSpent >= usdLimit` (previously `usdSpent` was frozen at 0).
- **Mock mode is now fail-loud.** `aix run --auto` without an API key prints a prominent
  ⚠ MOCK MODE banner before and after the run, and reports budget + written files, so
  placeholder output can never be mistaken for real code.
- **LangGraph node-name collision** — renamed `plan`/`rules`/`tasks` nodes to
  `planStep`/`rulesStep`/`tasksStep` (they collided with state-channel keys, throwing at runtime).
- **CLI UX**: `aix doctor` treats missing optional config as a note (exit 0);
  `aix skills validate` separates WARN vs ERROR and prints a total count;
  `aix context build .` ignores `imports/`; `aix run --dry-run` added.

### Changed
- All 13 `@x/*` packages set to `private: true` until publish metadata
  (`files`, `license`, `repository`, scope) is in place.
- README: corrected `@x/context` description (regex-based, not tree-sitter) and
  documented the engine's sandbox output behaviour.

---

## [0.1.0] — 2026-06-27

### Added

#### Monorepo & Toolchain (Phase 0)
- pnpm workspaces + Turborepo monorepo with 14 packages + `services/kb-server`
- `tsconfig.base.json` with NodeNext module resolution
- Turborepo cache for `build`, `lint`, `clean` tasks

#### Skills Registry (Phase 1)
- 163 SKILL.md in `content/skills/` — domain, process, and reference skills
- `@x/registry` — Zod-validated loader, progressive disclosure 3-tier (L1/L2/L3)
- `catalog.json` (142k) with all skill metadata

#### Providers & Compiler (Phase 2)
- `@x/compiler` — canonical → provider artefacts
- `@x/providers` — adapters for Claude Code, Cursor, Codex, Gemini CLI
- Browser MCP adapter (chrome-devtools + claude-in-chrome)
- `aix install` command with auto-detect and `--provider` override

#### KB Server — Full Port (Phase 3)
- `services/kb-server` — NestJS + Neo4j + **Meilisearch** + **Redis**
- `CacheModule` (ioredis, best-effort, TTL 300s)
- `SearchModule` (Meilisearch index `memory`, best-effort)
- `KbService` — cache-first reads, Meili full-text with Neo4j fallback
- `/health` endpoint reports `{neo4j, redis, meili}` degraded state individually
- `docker-compose.yml` — all 3 services with healthchecks and `depends_on`
- `.env.example` documenting all required env vars
- `ensureSchema()` called at boot — creates Neo4j Memory id-unique constraint
- `enableShutdownHooks()` for graceful teardown

#### Context & Code Analysis (Phase 4)
- `@x/context` — `ContextEngine` with regex-based AST analysis
- `analyzeProject()` — scans TypeScript, JavaScript, Python, Go, Rust, Java, Ruby
- `SimpleEmbedder` — TF-normalized vector embedder
- `SimpleVectorStore` — in-memory cosine similarity query
- `toWiki()` + `toMermaid()` — generate Markdown wiki and Mermaid flow diagrams

#### Autonomous Engine — LangGraph.js (Phase 5)
- `@x/engine` — full `StateGraph` port using `@langchain/langgraph` v1.4.7
- 8-node graph: `plan → rules → tasks → loopStart → pick → ticketPlan → coder → reviewer`
- Conditional routing: interrupt detection, hard-stop budget check, denylist guard, score gate
- `MemorySaver` in-process checkpointing per session
- `EngineGraph.run()` and `EngineGraph.resume()` public API

#### Cross-cutting (9b)
- `@x/policy` — `policy.redact()` with 20+ regex patterns (API keys, tokens, passwords, PII)
- `@x/hitl` — `ClackHitlChannel` + `ConsoleHitlChannel` for human-in-the-loop interrupts
- `@x/prompt` — prompt assembler + linter (success criteria, token budget, output constraints)
- `@x/preview` — HTTP preview server for compiled artefacts + Mermaid renderer
- `@x/evals` — rubric scorer (5-axis) + A/B eval harness

#### Documentation (Phase 6)
- VitePress docs site at `apps/docs/` — guide + reference + env vars
- `CHANGELOG.md` (this file)

### Security
- `KB_MASTER_PASSWORD` required at boot — server refuses to start without it
- API keys bcrypt-hashed before DB storage; raw key shown only at generation
- All memory writes go through `policy.redact()` — no secrets stored raw
- Cypher queries fully parameterized — no string interpolation
- Docker compose exposes `KB_MASTER_PASSWORD` via env ref only (never hardcoded)

---

*Consolidated from 6 legacy repos: `ai-engineering-harness`, `agentic-sdlc`, `skills`, `docs-wiki`, `system-design-skills`, `dev-memory`.*
