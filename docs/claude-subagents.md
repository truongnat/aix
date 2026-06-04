# Claude Subagents

## Purpose

Document Claude Code delegated workers installed as project subagents.

## Native Surface

Claude is the only provider where harness workers install to:

```txt
.claude/agents/harness-reviewer.md
.claude/agents/harness-verifier.md
.claude/agents/harness-gatekeeper.md
.claude/agents/harness-fixer.md
```

Canonical worker contracts remain in `workers/*.md`. The Claude adapter renders native agent files at install time via `lib/worker-claude-adapter.js`.

## Frontmatter

Claude agent files use YAML frontmatter with:

- `name: harness-<worker-id>`
- `description`
- `tools` — read-only workers get `Read, Grep, Glob, Bash`; fixer gets write tools
- `model: inherit`

## Result Envelope

Every worker report must include the shared harness `### Agent Result` block defined in `workers/<id>.md`.

Record delegated runs with `templates/WORKER_RUN.md` when execution leaves the main agent loop.

## Dispatch Rules

- only the main agent dispatches workers
- workers do not dispatch other workers
- `fixer` is write-enabled and bounded remediation only
- `reviewer`, `verifier`, and `gatekeeper` are read-only

## Related Docs

- [delegated-workers.md](delegated-workers.md)
- [provider-rule-configuration.md](provider-rule-configuration.md)
- [runtimes/claude-code.md](runtimes/claude-code.md)
