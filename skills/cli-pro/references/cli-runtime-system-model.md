# CLI runtime system model

Treat a CLI as a **stdin → process → stdout/stderr → exit code** contract plus **signals** and **environment**.

## Channels

| Channel | Contract |
|---------|-----------|
| **stdin** | Optional input stream — may be pipe, file redirect, or TTY; never assume interactive unless **isatty**. |
| **stdout** | Primary **data** for success path; must stay clean for `$(cmd)` and `|`. |
| **stderr** | Human messages, progress, **diagnostics**; also default for **error text** when not using JSON errors. |
| **exit code** | Integer **0** = success; non-zero = failure; subcommand tools may document **codes** (2 = usage). |

## Control flow (typical)

```text
argv + env + (optional) config file
    → parse (strict or permissive)
    → route subcommand
    → execute (I/O, network, subprocesses)
    → format output (human | --json)
    → set exit code
```

**Errors** should short-circuit to stderr + non-zero exit without polluting stdout.

## TTY vs non-TTY

- **TTY** — Interactive: colors, prompts, spinners OK with opt-out.
- **Non-TTY** — CI, cron, pipes: **no prompts** unless `--yes`; plain output; stable columns if tabular.

## Signals (Unix-likes)

| Signal | Expected behavior |
|--------|-------------------|
| **SIGPIPE** | Writer stops when reader closes pipe — **not** necessarily an application bug — **`edge-cases.md`**. |
| **SIGINT** | User cancel — exit non-zero; cleanup temp files. |
| **SIGTERM** | Graceful shutdown for long-running/daemon-like CLIs. |

Windows: limited signal story — document Ctrl+C handling for runtime.

## Concurrency / subprocess

If CLI **spawns** tools, forward or map **their** exit codes **deliberately** — don’t swallow failures as success.
