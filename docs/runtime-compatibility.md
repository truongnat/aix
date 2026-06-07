# Runtime Compatibility

`ai-engineering-harness` is runtime-light by design. It does not require a server, orchestrator, or agent framework to be useful.

## Common Model

Across tools, the operating model stays the same:

- read `AGENTS.md`
- use `.harness/` artifacts as the active working state
- follow the command loop
- treat markdown as the source of truth

The runtime-specific documents under `docs/runtimes/` are usage guides, not adapters, installers, or runtime integrations.

## Runtime Guides

- [Runtime Guides Index](runtimes/README.md)
- [Session Start Checklist](session-start-checklist.md)
- [Claude Code](runtimes/claude-code.md)
- [Codex](runtimes/codex.md)
- [Cursor](runtimes/cursor.md)
- [Gemini CLI](runtimes/gemini-cli.md)
- [OpenCode](runtimes/opencode.md) — **removed from active scope (v0.11.0)**; historical guide only

## Claude Code

Use the harness as repository guidance:

- keep `AGENTS.md` at the repository root
- ask Claude Code to read `.harness/` artifacts first
- use `commands/` and `skills/` as process references during work

Claude Code works well with this repository because it can read markdown artifacts directly and follow explicit operating rules.

## Codex

Use the harness as a shared contract inside the repository:

- keep `.harness/` updated as work progresses
- use commands and templates to make state explicit
- rely on validation and repository review rather than hidden session memory

Codex benefits from the harness because it reduces guesswork and keeps scope and verification visible.

## Cursor

Use the harness as editor-adjacent process documentation:

- keep `AGENTS.md` and `.harness/` in the repository
- reference plans, tasks, and verification notes directly from markdown
- use the harness to separate planning from implementation

Cursor does not need a special runtime adapter to benefit from the markdown operating model.

## Gemini CLI

Use the same repository contract:

- load the active `.harness/` artifacts first
- treat workflows and commands as the procedural guide
- preserve durable lessons in sanitized memory artifacts

Gemini CLI can follow the harness as long as the repository keeps the markdown artifacts current.

## OpenCode (historical)

OpenCode is **not** in the active provider scope as of v0.11.0. See [runtimes/opencode.md](runtimes/opencode.md) for legacy notes and cleanup history.

## Compatibility Boundaries

This harness is designed to stay high-level and portable.

It does not assume:

- a specific orchestration runtime
- background daemons
- databases
- a web UI
- a server process

If a tool can read markdown and work inside a repository, it can usually adopt this harness model.
