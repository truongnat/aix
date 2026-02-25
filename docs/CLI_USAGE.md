# CLI Usage

Binary command name is `antigrav` (invoked in this repo via `cargo run -- ...`).

## Workflow Mode

Workflow definitions under `.agent/workflows` must use Markdown (`.md`) format.
Project rules under `.agent/rules` are Markdown files with a fenced `json` block.
Custom skills under `.agent/skills` are Markdown files with a fenced `json` metadata block plus prompt body.

Run a workflow from file path:

```bash
cargo run -- --workflow valid_flow.md
```

Run a workflow resolved from `.agent/workflows` ID:

```bash
cargo run -- --workflow-id feature
```

Inspect workflow instances:

```bash
cargo run -- workflow list
cargo run -- workflow status
cargo run -- workflow status <instance_id>
```

Resume or abort:

```bash
cargo run -- workflow resume <instance_id>
cargo run -- workflow abort <instance_id>
```

## Goal Mode

Plan and execute from a natural-language goal:

```bash
cargo run -- --goal "implement X with tests"
```

Optional domain selection:

```bash
cargo run -- --goal "implement X" --domain agent
```

## Trace Mode

Export full instance payload:

```bash
cargo run -- workflow trace <instance_id> --json
```

Render timeline:

```bash
cargo run -- workflow trace <instance_id> --timeline
```

Render both:

```bash
cargo run -- workflow trace <instance_id> --json --timeline
```

## Runtime Policy Flags

Common policy controls:
- `--disable-network`
- `--read-only`
- `--strict-mode`
- `--external-mutation-penalty <u32>`
- `--step-timeout-ms <u64>`
- `--max-trust-tier Trusted|Constrained|Untrusted`

Resource controls:
- `--max-cost`
- `--max-latency`
- `--max-steps`
- `--max-cpu-ms`
- `--max-wall-time-ms`
- `--max-fs-reads`
- `--max-fs-writes`
- `--max-network-calls`
- `--max-memory-mb`

Routing controls:
- `--allow-domain a,b,c`
- `--prefer-domain a,b,c`
- `--cross-domain-penalty <u32>`
- `--domain-overhead demo:1,utils:2`

## Deprecated Options

After v2 consolidation:
- `--replay` is deprecated and rejected
- `--resume` snapshot mode is deprecated and rejected
- `--snapshot-out` is ignored
- `AGENT_ENGINE=v1` is ignored with deprecation warning
