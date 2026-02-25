# agentic-sdlc

Deterministic local execution runtime for agentic software workflows.

This repository runs a single consolidated v2 engine with:
- deterministic workflow execution and trace IDs
- resumable runs with persisted state
- idempotent step short-circuit support
- runtime policy enforcement for permissions and trust tier
- structured step telemetry and trace timeline export

## Current Release

- Runtime target: `v1.0.0`
- Package version: `1.0.0`

## Quick Start

```bash
cargo run -- --workflow valid_flow.md
```

Inspect active/previous runs:

```bash
cargo run -- workflow list
cargo run -- workflow status
```

Resume a run:

```bash
cargo run -- workflow resume <instance_id>
```

Export trace:

```bash
cargo run -- workflow trace <instance_id> --json
cargo run -- workflow trace <instance_id> --timeline
```

## Documentation

- Architecture and runtime semantics: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- CLI usage guide: [`docs/CLI_USAGE.md`](docs/CLI_USAGE.md)
- Dev OS execution blueprint: [`docs/DEV_OS_BLUEPRINT.md`](docs/DEV_OS_BLUEPRINT.md)
- Release notes: [`CHANGELOG.md`](CHANGELOG.md)
