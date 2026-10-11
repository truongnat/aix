# aix

> AI engineering methodology + 230+ skills, delivered as an Agent Plugins 1.0 plugin for Claude Code, Codex, Cursor, and Gemini.

**The host agent is the runtime**. aix is the playbook and the skill library — not a separate engine you invoke.

## How it works

```bash
git clone https://github.com/truongnat/aix
```

Claude Code:

```text
/plugin install /path/to/aix
```

Codex:

```bash
codex plugin marketplace add truongnat/aix
codex plugin add aix@aix
```

Any skill-aware agent:

```bash
npx skills add truongnat/aix
```

Skills live at `skills/<name>/SKILL.md` (Agent Skills spec) and are auto-discovered by the host. The [`aix-spine`](./workflows/spine.js) workflow runs the full 8-phase engineering spine as native orchestration. No engine, no runtime — just skills the agent pulls in when needed.

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

Session artifacts land in `.aix/sessions/<session-id>/` (`DISCUSSION.md`, `PLAN.md`, `REVIEW.md`, `VERIFY.md`, `REMEMBER.md`).

## Providers

Install skills to other AI coding tools:

```bash
aix install --all --provider cursor|codex|gemini
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
| `@x/memory` | Markdown store for durable memory (grep-friendly) |
| `@x/prompt` | Prompt assembly + linter |
| `@x/engine` | Headless SDLC runner for CI/batch (optional `--auto` path) |
| `@x/cli` | Command surface |
| `@x/core` | Types, phase machine, guards |
| `@x/evals` | A/B harness + rubric scoring |
| `@x/hitl` | Human-in-the-loop channel |
| `@x/preview` | Mermaid / image / HTML preview |

## Quick start

```bash
pnpm install
pnpm build
pnpm test
```

## CLI

```bash
aix init                          # .aix/ dirs + AGENTS.md section in current project
aix install --all [--provider X]  # emit provider artifacts
aix run "<task>"                  # guardrail mode; --auto for headless
aix skills list | show <name> | validate
aix skills migrate --from <dirs> --write
aix memory push|search|list
aix plugin build [--out dir]      # regenerate vendor manifests from plugin.json
aix verify | ship
aix eval <suite>
aix doctor                        # env + skills-release staleness check
```

## Repository

```
plugin.json         Agent Plugins 1.0 manifest (canonical)
AGENTS.md           canonical agent instructions
skills/             230+ skills — Agent Skills spec (<name>/SKILL.md)
skills.sh.json      skills.sh registry groupings
skills-release.json per-skill sha256 (staleness detection)
workflows/          engineering-spine doc + spine.js workflow
.claude-plugin/     Claude Code manifest + marketplace.json
.cursor-plugin/     Cursor manifest
gemini-extension.json Gemini extension manifest
packages/           13 @x/* TypeScript packages
apps/               Docs site
```

## Security

- Secrets redacted at the boundary via `@x/policy` before hitting disk
- Shell denylist + budget hard-stop guard the headless engine

## License

MIT
