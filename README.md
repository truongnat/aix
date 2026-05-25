# Agentic Goal CLI

CLI agentic SDLC harness. Run `goal "your idea"` to start the pipeline:
plan → rules → tasks → execute (coder + reviewer loop).

## Install

```bash
pip install -e ".[dev]"
```

## Usage

```bash
goal "Build a REST API for a todo app"
goal continue
goal status
```

See [PLAN.md](PLAN.md) for full architecture.
