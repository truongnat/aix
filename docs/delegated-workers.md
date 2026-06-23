# Delegated Workers

## Purpose

Document the harness-level delegated worker contract: portable one-shot workers, shared result envelopes, and provider adapter support levels.

## What Workers Are

Workers are one-shot delegated task runners owned by the harness contract in `workers/`.

- the main agent dispatches workers; workers do not dispatch other workers
- each worker completes once and returns a structured report
- every run should be recorded in a `WORKER_RUN.md` lifecycle artifact
- providers execute workers through adapters while preserving the same contract

## Canonical Workers (v1)

| Worker | Role | Write access | Typical command |
|--------|------|--------------|-----------------|
| `explorer` | explore | none | `harness-map` |
| `reviewer` | review | none | `harness-verify` |
| `verifier` | verify | none | `harness-verify` |
| `gatekeeper` | gate | none | `harness-ship` |
| `fixer` | fix | write | `harness-run` (bounded remediation only) |

Source of truth:

- `workers/registry.ts`
- `workers/<id>.md`
- `templates/WORKER_RUN.md`

## Result Envelope

Every worker returns the shared `### Agent Result` block:

```md
### Agent Result

worker: reviewer
status: completed | issues-found | blocked | failed
ready_to_continue: yes | no | with-fixes
next_command: harness-run | harness-verify | harness-ship | harness-discuss
severity: none | minor | important | critical
```

Worker-specific sections follow the envelope. See each `workers/<id>.md` definition.

## Lifecycle Artifact

Record delegated runs with `templates/WORKER_RUN.md`:

- metadata (`worker`, `provider`, `execution_mode`, timestamps)
- task
- result envelope
- full result
- main agent decision
- next allowed command

Command flows should consume lifecycle artifacts and envelopes instead of provider-specific transcripts.

## Support Levels

| Level | Meaning |
|-------|---------|
| `native` | Provider has a first-class execution surface mapped to the worker contract |
| `adapter` | Provider runs the worker through controlled delegation while preserving inputs, envelope, and lifecycle artifact |
| `fallback` | Main agent simulates the worker run while still recording the same contract honestly |
| `unsupported` | Worker should not be offered on that provider yet |

## Provider Status (v1)

### Claude

Claude is the first **native** adapter target.

Project runtime install renders canonical workers to:

```txt
.claude/agents/harness-explorer.md
.claude/agents/harness-reviewer.md
.claude/agents/harness-verifier.md
.claude/agents/harness-gatekeeper.md
.claude/agents/harness-fixer.md
```

The harness still owns worker ids, lifecycle artifacts, and the result envelope.

### Cursor

Cursor is an **adapter** target in v1.

Cursor does not claim Claude-style native named subagent parity. Use controlled delegation (Task/subagent or prompt-driven execution) while preserving:

- canonical worker ids
- required inputs
- shared envelope
- `WORKER_RUN.md` lifecycle artifact

### Codex

Codex is an **adapter** target in v1.

Use repo-local instruction surfaces and prompt-driven delegation while preserving the same worker contract. Do not overclaim native worker support.

### Other Providers

Other runtimes may use **fallback** execution when the main agent follows the worker spec and records the run honestly.

## Command Integration

- `harness-map` may dispatch `explorer` to produce a condensed repository map
- `harness-verify` may dispatch `reviewer` and `verifier`
- `harness-ship` may dispatch `gatekeeper`
- `harness-run` may dispatch `fixer` only for bounded remediation explicitly authorized by the main agent

## Non-Goals (v1)

- no nested worker dispatch
- no background orchestration framework
- no requirement that every provider expose native named subagents

## Related Docs

- Design: `docs/internal/superpowers/specs/2026-06-04-delegated-workers-design.md`
- Claude runtime: `docs/runtimes/claude-code.md`
- Cursor runtime: `docs/runtimes/cursor.md`
- Codex runtime: `docs/runtimes/codex.md`
