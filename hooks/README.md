# Hooks

Portable lifecycle hooks for the ai-engineering-harness operating layer.

## Principles

```txt
Hooks enforce and record.
Skills package reusable capability.
Workflows compose skills.
Dispose means archive/deactivate, not delete.
```

Hooks do **not** think for the agent. They guard phases, record evidence, and compact durable memory.

## Core scripts

| Script | Purpose |
|--------|---------|
| `core/guard-phase.js` | Block run/verify/ship when phase preconditions fail |
| `core/record-tool-output.js` | Store test/build/lint/git evidence |
| `core/record-subagent-result.js` | Store delegated worker results and optional worker memory |
| `core/record-skill-run.js` | Store skill execution records |
| `core/archive-session-skill.js` | Archive/dispose session skills |
| `core/compact-session-memory.js` | Suggest or apply durable memory updates |

All core scripts use Node built-ins only and support `--help`.

## Example

```bash
node hooks/core/guard-phase.js --command harness-run --session .harness/sessions/2026-06-04-example --json
node hooks/core/record-tool-output.js --session .harness/sessions/2026-06-04-example --command "npm test" --exit-code 0 --summary "All tests passed"
```

## Provider adapters

| Provider | Hook support |
|----------|----------------|
| Claude Code | native hook adapter — see `providers/claude/` |
| Cursor | rules/prompt fallback |
| Codex | AGENTS/prompt fallback |
| Gemini | extension/prompt fallback |

Do not claim identical native hook behavior across providers.

## Related docs

- [docs/hooks-and-skills-layer.md](../docs/hooks-and-skills-layer.md)
- [docs/skill-lifecycle.md](../docs/skill-lifecycle.md)
