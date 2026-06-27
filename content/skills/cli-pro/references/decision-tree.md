# CLI — decision tree

## Output contract

```
Human + diagnostics?
├── stderr for logs/progress/errors; stdout for pipeable/streaming data
└── Machines only?
    └── `--json` (or subcommand) with stable keys — decision-framework-and-tradeoffs.md
```

## Destructive ops

```
TTY available?
├── Interactive confirm OR explicit --force with loud warning
└── Non-TTY (CI, pipe)?
    └── Require --yes / --force or exit with instruction — never hang
```

## Argument shape

```
Few actions, many flags?
├── Single command with flags
└── Many actions / resources?
    └── Subcommands (git/docker style); keep verbs consistent — tips-and-tricks.md
```

## Parsing strictness

```
Typos must fail (CI/scripts)?
├── Strict unknown-flag errors
└── Explore-first DX?
    └── Warn + suggest (risk: silent partial config) — document choice
```

## Config vs flags

```
Many tunables?
├── Config file + env + CLI override — configuration-precedence-and-files.md
└── Few knobs?
    └── Env + flags only
```

## Framework / runtime

```
Python rapid internal tool?
├── argparse / click / typer — patterns-by-runtime.md
└── Single binary distribution?
    └── Go/Rust — cobra/clap; signal handling explicit
```

## Platform

```
Must run on Windows + Unix?
├── Test paths, newline, signals; avoid POSIX-only assumptions in messages
└── Unix-only?
    └── State clearly in README
```

## Further reading

- [cli-runtime-system-model.md](cli-runtime-system-model.md), [failure-modes-detection-mitigation.md](failure-modes-detection-mitigation.md)
