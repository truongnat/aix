# aix

> AI engineering methodology + 160 canonical skills across 9 categories, delivered as a Claude Code and Codex plugin.

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

On start, a `SessionStart` hook injects [`using-aix`](./content/skills/methodology/using-aix/SKILL.md) into context. It explains the 8-step engineering spine and how to reach the canonical skills via the host's `Skill` tool.

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
node packages/cli/dist/index.js install --provider cursor
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
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
```

## CLI

```bash
aix install --all
aix install --provider cursor
aix run "<task>" [--auto]
aix skills validate [--content-root <content-directory>]
aix skills list
aix skills show <name>
aix memory push "<title>" "<body>"
aix memory search "<query>"
aix memory list
aix verify <session-id> --command "<your verification command>"
aix kb status
aix eval <suite>
aix doctor
```

The workspace packages are private; build locally and use `node packages/cli/dist/index.js`
in place of `aix` unless the executable is installed locally.

`run` generates artifacts, not verified or shipped code. Its text score is heuristic.
`verify` executes only your explicitly supplied command inside the session's `generated/`
directory and records its real exit/output plus generated-file hashes. Choose checks that
exercise your acceptance criteria; a successful arbitrary command is not a correctness proof.
The unsupported `ship` command has been removed. No command automatically applies generated
files to project source or deploys them.

`content/skills/` is the authoring source. Root `skills/*.md` files are legacy mirrors,
not additional skills. `aix skills list` regenerates the local catalog from canonical content;
validation includes invalid YAML/frontmatter and duplicate identifiers.

## Repository

```
.agents/plugins/  Codex marketplace entry for this repo
.claude-plugin/   Claude Code plugin manifest
.codex-plugin/    Codex plugin manifest
hooks/            SessionStart → injects using-aix; requests optional KB startup if built
content/
  skills/         Canonical domain, process, and reference skills
  rules/          Spine guardrail rules
  workflows/      Engineering spine flow
packages/         13 @x/* TypeScript packages
services/         kb-server (SQLite, NestJS)
apps/             Docs site + tooling
```

## Security

- Sensitive session/checkpoint prose and memory content are redacted before persistence.
  Accepted resource IDs and operational paths retain their identity; secret-bearing
  identifiers/paths and generated source are rejected instead of silently rewritten.
- Invalid/closed approval input aborts. KB memory routes require a key or master password;
  shutdown requires the master password. The standalone service binds loopback by default.
- Budget guards constrain model execution. Text scoring and a shell denylist are not
  substitutes for executable correctness checks or an OS security sandbox.

## License

MIT
