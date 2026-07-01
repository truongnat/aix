# aix

> AI engineering methodology + 160+ skills, delivered as a Claude Code plugin.

**The host agent is the runtime**. aix is the playbook and the skill library — not a separate engine you invoke.

## How it works

```
git clone https://github.com/truongnat/aix
# In Claude Code:
/plugin install /path/to/aix
```

On start, a `SessionStart` hook injects [`using-aix`](./content/skills/using-aix/SKILL.md) into context. It explains the 8-step engineering spine and how to reach any of the 160+ skills via the host's `Skill` tool.

No engine, no runtime — just skills the agent pulls in when needed.

## The engineering spine

| # | Phase | Skill |
|---|-------|-------|
| 1 | Align & Shape | `discussing-pro` |
| 2 | Plan | `planning-pro` |
| 3 | Isolate | `git-worktree-pro` |
| 4 | Test-first | `ttd-pro` |
| 5 | Execute | `executing-pro` |
| 6 | Review | `code-review-pro` |
| 7 | Verify | `verify-pro` |
| 8 | Remember | `remember-pro` |

## Providers

Install skills to other AI coding tools:

```bash
npx @x/cli install --all --provider cursor|codex|gemini
```

## Monorepo

13 packages for authoring, compiling, and headless execution:

| Package | Role |
|---------|------|
| `@x/registry` | SKILL.md schema (Zod), loader, catalog |
| `@x/policy` | Secret/PII redaction, shell denylist |
| `@x/providers` | Compile-time adapters + runtime LLM client |
| `@x/compiler` | Idempotent file emitter |
| `@x/context` | Code analysis, RAG, wiki generation |
| `@x/memory` | Markdown store for durable memory |
| `@x/prompt` | Prompt assembly + linter |
| `@x/engine` | Headless SDLC runner for CI/batch |
| `@x/cli` | Command surface |
| `@x/core` | Types, phase machine, guards |
| `@x/evals` | A/B harness + rubric scoring |
| `@x/hitl` | Human-in-the-loop channel |
| `@x/preview` | Mermaid / image / HTML preview |
| `services/kb-server` | SQLite knowledge base |

## Quick start

```bash
pnpm install
pnpm build
pnpm test
```

## CLI

```bash
aix install --all [--provider <claude|cursor|codex|gemini>]
aix run "<task>"
aix skills list | show <name> | validate
aix memory push|search|list|get
aix verify | ship
aix eval <suite>
aix doctor
```

## Repository

```
.claude-plugin/   Plugin manifest
hooks/            SessionStart → injects using-aix + starts kb-server
content/
  skills/         160+ domain, process, and reference skills
  rules/          Spine guardrail rules
  workflows/      Engineering spine flow
packages/         13 @x/* TypeScript packages
services/         kb-server (SQLite, NestJS)
apps/             Docs site + tooling
```

## Security

- Secrets redacted at the boundary via `@x/policy` before hitting disk
- Shell denylist + budget hard-stop guard the headless engine

## License

MIT
