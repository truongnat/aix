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
| `core/guard-scope.js` | Block edits outside GOAL/PLAN file scope |
| `core/guard-test-first.js` | Block source edits without a failing-assertion pattern in the corresponding test file (hard deny; does not run tests) |
| `core/run-with-active-session.js` | Resolve `session:` from `.harness/STATE.md` and invoke a core hook with `--session` |
| `core/guard-file-edits.js` | Provider hook entrypoint for scope + test-first checks |
| `core/codex-hook-router.js` | Codex runtime router (dangerous commands, scope, test-first) |
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

## Test-first limitation

`guard-test-first.js` greps test files for failing-assertion **patterns** (for example `expect(x).toBe(false)`). It does not execute tests. When wired at tool time, edits to source files whose tests contain only positive assertions may be **hard denied** until the test file includes a failing pattern or the guard is not invoked for that edit path.

## Related docs

- [docs/hooks-and-skills-layer.md](../docs/hooks-and-skills-layer.md)
- [docs/skill-lifecycle.md](../docs/skill-lifecycle.md)
