# ai-engineering-harness

`ai-engineering-harness` is a markdown-first operating system for engineering agents. It is designed to give Claude Code, Codex, Cursor, Gemini, OpenCode, and similar tools a lightweight but disciplined way to explore codebases, plan changes, execute work, verify outcomes, and preserve useful decisions.

## What This Repo Is

This repository is not a framework, runtime, agent server, or orchestration platform. It is a portable engineering methodology expressed as markdown artifacts, reusable skills, command guides, workflow documents, and templates. The goal is to help agents behave more like reliable engineering partners and less like improvisational text generators.

## Why Markdown-First

Markdown travels well across tools, repositories, and teams. It is readable by humans, easy for agents to ingest, friendly to version control, and simple to adapt without introducing infrastructure risk. A markdown-first system also makes process visible: plans, reviews, verification notes, and remembered decisions become inspectable artifacts instead of hidden runtime state.

## Why No Heavy Runtime In V1

Version 1 deliberately avoids a complex runtime. There is no `src/core`, no database, no Docker, no web UI, no server process, and no orchestration framework. The operating model is the product. Minimal Node scripts exist only to help install and validate the repository structure. This keeps the system easy to audit, easy to fork, and easy to use inside an existing engineering workspace.

## Core Model

- Skills give agents capability.
- Memory gives agents context.
- Workflows give agents process.
- Harness gives agents execution discipline.

## Core Loop

1. Read the current artifacts before acting.
2. Map the codebase and current state.
3. Discuss the goal and constraints.
4. Write a plan before coding.
5. Execute the plan in small, surgical changes.
6. Verify behavior before claiming completion.
7. Ship intentionally.
8. Remember decisions that matter for future work.

The command equivalents for this loop live in `commands/` and the reusable process definitions live in `workflows/`.

## Commands

- `harness-map`: understand the codebase, artifacts, and current state
- `harness-start`: bootstrap context for a new session
- `harness-discuss`: clarify goals, constraints, and tradeoffs
- `harness-plan`: turn goals into a concrete implementation plan
- `harness-run`: execute the plan with disciplined change control
- `harness-verify`: gather evidence before completion claims
- `harness-ship`: finalize, summarize, and hand off the work
- `harness-remember`: capture durable decisions and lessons

## Skills

- `using-harness`: apply the harness discipline in each session
- `mapping-codebase`: inspect structure, artifacts, and dependency boundaries
- `discussing-goals`: refine requests into clear objectives and constraints
- `writing-plans`: produce implementation plans before code changes
- `executing-plans`: follow plans step by step without scope drift
- `test-driven-development`: use failing checks before implementation when behavior changes
- `code-review`: review for risk, regressions, and missing coverage
- `verification`: prove outcomes with fresh evidence
- `remembering`: record decisions, tradeoffs, and future guidance
- `writing-skills`: create or improve repository skills consistently

## Artifact Layout

- `commands/`: operator-facing command guides for the harness loop
- `skills/`: reusable agent behaviors with clear contracts
- `workflows/`: end-to-end process playbooks for common engineering tasks
- `patterns/`: delegation and collaboration patterns for multi-agent work
- `templates/`: durable artifact templates for planning, verification, review, and memory
- `docs/`: core concepts, architecture, quality gates, and roadmap
- `examples/demo-project/`: a placeholder area for a sample adoption target

## Repository Use

1. Read [AGENTS.md](AGENTS.md) and the current project artifacts first.
2. Start with `commands/harness-start.md`.
3. Move through the command loop as needed.
4. Use templates to persist outputs in the host repository.
5. Update memory artifacts after meaningful work ships.

## Adoption

To adopt the harness in another repository, start with:

- [Adoption Guide](docs/adoption-guide.md)
- [Usage Examples](docs/usage-examples.md)
- [Host Repo Checklist](docs/host-repo-checklist.md)
- [Session Start Checklist](docs/session-start-checklist.md)
- [Runtime Compatibility](docs/runtime-compatibility.md)
- [Runtime Guides](docs/runtimes/README.md)

The adoption layer stays lightweight: copy markdown assets, create `.harness/`, and use the command loop without adding a runtime service.

Example:

```bash
node install.js --target ../my-project --dry-run
node install.js --target ../my-project
```

## Examples

- [Demo Project](examples/demo-project/)
- [Workflow Scenarios](examples/workflows/)

## Roadmap

### V1

- Deliver the markdown-first operating system
- Standardize command contracts and skill structure
- Provide templates for common engineering artifacts
- Add lightweight validation for repository integrity

### Later

- Expand examples and adoption guides
- Add optional editor-specific adapters
- Add richer validation and linting for artifact quality
- Add domain-specific skill packs without changing the core model

See [`docs/roadmap.md`](docs/roadmap.md) for the longer view.
