# Architecture

## Primary runtime: the host coding agent

The plugin exposes canonical skills from `content/skills/`. A SessionStart hook injects
`using-aix`; the host selects domain/process skills and executes the eight-step engineering
spine with its own tools. The optional TypeScript runner is a separate headless generation path.

`content/skills/` is the authoring source. Root `skills/*.md` files are legacy mirrors, not
additional skills. `aix skills list` generates a local catalog; `aix skills validate` includes
invalid YAML/frontmatter and duplicate-name diagnostics instead of silently ignoring them.

## Package map

| Package | Responsibility |
|---|---|
| `@x/core` | Session types, evidence guards, phase machine and budget tracking |
| `@x/registry` | Canonical skill loader, Zod validation and catalog |
| `@x/policy` | Secret/PII redaction and shell-command denylist |
| `@x/providers` | Claude/Cursor/Codex/Gemini configuration adapters and runtime model clients |
| `@x/compiler` | Hash-based idempotent file emission and conflict protection |
| `@x/context` | Regex source analysis and default in-memory vector search |
| `@x/memory` | Markdown storage, authenticated KB adapter and redaction wrapper |
| `@x/prompt` | Prompt assembly and linting |
| `@x/engine` | LangGraph generation, file checkpoints and sandboxed artifacts |
| `@x/evals` | Heuristic text rubric and A/B harness; not executable verification |
| `@x/hitl` | Explicit terminal/Clack decisions; invalid or closed input aborts |
| `@x/preview` | Loopback preview server and rendering helpers |
| `@x/cli` | Command composition and explicit persisted-session verification |

## Author once, emit provider configuration

The registry loads canonical skill metadata/body. Provider adapters produce Claude plugin
skills, Cursor `.cursor/rules/aix-skill-*.mdc`, Codex `.codex/skills/` and `.codex/rules/`,
and Gemini `.agents/skills/`, `.agents/AGENTS.md` and extension configuration. The compiler
skips identical content and refuses to overwrite unmarked user files without `--force`.

## Knowledge service

`services/kb-server` is a NestJS HTTP service using Node's built-in SQLite, FTS5 and a
process-local cache. It does not require Neo4j, Meilisearch or Redis. Memory endpoints are
under `/api/v1/memory`; health reports `{ status, sqlite, cache }`.

Memory requests require `x-api-key` or `x-master-password`. Shutdown requires the master
password specifically. Standalone binding defaults to `127.0.0.1`; Compose binds inside its
container and publishes only on the host's loopback interface. Direct KB writes and local
memory/session metadata are redacted before persistence. Generated source with detected
secrets is rejected, not silently rewritten.

## Generation is not verification

```bash
aix run "<task>"          # human approval at generation boundaries
aix run "<task>" --auto   # no human approval; same sandbox output boundary
aix verify <session-id> --command "<your verification command>"
```

The runner processes pending generation tasks until exhausted, interrupted or budget-stopped.
The reviewer text score cannot certify correctness. Output remains under
`.aix/sessions/<id>/generated/`; the explicit verification command runs there and records its
exit code, redacted output and generated-file hashes. There is no shipping/deployment command.
