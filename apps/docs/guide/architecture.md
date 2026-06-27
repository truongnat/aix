# Architecture

## "Author Once, Compile to Every Provider"

aix dùng một **canonical source** duy nhất (SKILL.md trung lập) và compile ra artefact riêng cho từng provider — y như TypeScript compiler xuất nhiều target.

```
CANONICAL SOURCE
  content/skills/**/SKILL.md
  content/agents/**/*.md
  content/rules/**

       │ đọc + validate (Zod)
       ▼

CORE PACKAGES (@x/*)
  @x/core       — phase state machine, guards, system prompt
  @x/registry   — skill loader/validator/catalog
  @x/context    — code analysis + RAG index
  @x/memory     — markdown-first + Graph KB interface
  @x/engine     — LangGraph.js autonomous loop + budget
  @x/policy     — redaction (20+ patterns)
  @x/prompt     — prompt assembly + linter
  @x/evals      — A/B eval harness

       │
       ▼

COMPILER (@x/compiler)
  → Claude Code  (.claude/skills, .claude/agents, CLAUDE.md)
  → Cursor       (.cursor/rules/, SKILL.md recursive)
  → Codex        (AGENTS.md)
  → Gemini CLI   (GEMINI.md, gemini-extension.json)

       │
       ▼

CLI (@x/cli — bin: aix)
  install · skills · context · run · verify · eval · memory · kb
```

## Package map

| Package | Vai trò |
|---------|---------|
| `@x/core` | SessionState, phase machine, guards, system prompt |
| `@x/registry` | Load SKILL.md, validate frontmatter (Zod), catalog JSON |
| `@x/context` | Phân tích code (regex + AST), RAG in-memory |
| `@x/memory` | Ghi/đọc markdown + interface tới KB server |
| `@x/engine` | LangGraph.js StateGraph (plan→rules→tasks→pick→ticketPlan→coder→reviewer) |
| `@x/policy` | `policy.redact()` — strip secrets trước khi ghi memory |
| `@x/hitl` | `ClackHitlChannel.ask()` — human-in-the-loop interrupt |
| `@x/prompt` | Assemble system prompt, linter |
| `@x/preview` | HTTP preview server cho compiled artefacts |
| `@x/evals` | Rubric scoring, A/B harness |
| `@x/compiler` | Canonical → provider artefacts |
| `@x/providers` | Adapter Claude/Cursor/Codex/Gemini + MCP browser |
| `@x/cli` | CLI entry point (`aix`) |

## Service: kb-server

`services/kb-server` là NestJS app chạy độc lập trên port 4000:

- **Neo4j** — graph store cho Memory nodes (constraint unique id)
- **Meilisearch** — full-text search index `memory`
- **Redis** — cache tầng 1 (TTL 300s, best-effort)
- **AuthService** — bcrypt-hash API keys, RBAC

Mọi write vào KB phải qua `policy.redact()` trước — không bao giờ ghi secret thô.

## Hai chế độ chạy

```
aix run "<task>"        → Guardrail mode
aix run "<task>" --auto → Autonomous mode (LangGraph.js engine)
```

Cả hai dùng chung `@x/registry`, `@x/context`, `@x/memory`.
