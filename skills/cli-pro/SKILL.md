---
name: cli-pro
description: |
  Production-grade CLI design and implementation: stdin/stdout/stderr and exit code as a runtime contract, TTY vs non-interactive behavior, SIGPIPE/EPIPE and signal handling, argv/subcommand design, strict vs permissive parsing, config/env/flag precedence, machine-readable output (--json) policies, cross-platform constraints (Windows paths, encoding), shell completions, failure modes (hung CI, completion drift, mixed JSON/logs), decision trade-offs (flat vs subcommands), semver for argv API, packaging hooks — for tools run in terminals, scripts, containers, and CI.

  Use when designing or refactoring CLIs (any language), fixing pipes/completions/exit codes, or reviewing UX and safety of command-line tools.

  Combine with code-packaging-pro, security-pro, testing-pro, javascript-pro, docker-pro as needed.

  Triggers: "CLI", "command line", "argparse", "click", "typer", "clap", "cobra", "commander", "yargs", "subcommand", "exit code", "stderr", "POSIX", "completion", "bash completion", "zsh completion", "machine readable", "JSON output", "TTY", "SIGPIPE", "SIGINT", "getopt", "EPIPE", "broken pipe", "dry-run", "no-color", "FORCE_COLOR", "NO_COLOR", "prompt stuck CI", "semver CLI", "strict parsing", "argv breaking change", "docker exec CLI", "non-interactive".

metadata:
  short-description: CLI — stdio contract, signals, argv design, JSON/TTY, failures, cross-platform
  content-language: en
  domain: cli
  level: professional
---

# CLI (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Canonical ergonomics reference: **[clig.dev](https://clig.dev/)** (community guide; align with POSIX/GNU expectations where applicable). This skill encodes **runtime system contracts** (channels, signals, exit semantics), **argv evolution discipline**, and **operational failure modes** — not only parser API trivia. Confirm **target OS**, **shell for completions**, **runtime**, and whether the tool is **script-first** (`--json`) or **human-first**.

## Boundary

**`cli-pro`** owns **user-visible CLI contracts**: argument surface, **stdio routing**, **exit codes**, **TTY/non-TTY behavior**, **signal expectations**, **config precedence story**, and **semantic versioning** of argv. **`code-packaging-pro`** owns **ship mechanics** (entry points, publish); **`security-pro`** owns **secret handling patterns**; **`testing-pro`** owns **test harnesses** — this skill defines **what** to assert (golden help, stderr/stdout split).

## Related skills (this repo)

| Skill | When to combine with `cli-pro` |
|-------|-------------------------------|
| **`code-packaging-pro`** | Entry points, `bin`, Docker/CI install paths |
| **`security-pro`** | Credentials via env, argv leakage, path safety |
| **`testing-pro`** | Snapshot `--help`, subprocess golden tests, exit codes |
| **`javascript-pro`** | Node CLIs, ESM/CJS `bin`, shebang edge cases |
| **`typescript-pro`** | Typed CLI boundaries when applicable |
| **`docker-pro`** | CLI in containers (TTY, `docker exec`, PATH) |
| **`repo-tooling-pro`** | Internal scripts vs published CLIs |

## When to use

- Designing **flags**, **positionals**, **subcommands**, **precedence** (CLI > env > file).
- **Help**, **examples**, **version**, verbosity, **`--json`** stability.
- **Exit codes**, **stderr** discipline, **pipes**, **SIGPIPE**, **SIGINT**.
- **Completions**, **dynamic** completions, **migration** when argv breaks.
- Reviewing CLIs for **CI safety** (no hung prompts).

## When not to use

- **REST API design only** — **`api-design-pro`** (this skill overlaps only for CLI-as-client).

## Required inputs

- **Invocation** mode (global bin, `npx`, `python -m`), **OS targets**, **interactive vs automation** ratio.

## Expected output

Follow **Suggested response format** strictly — contracts through residual risks — including **failure modes**.

## Workflow

1. Confirm runtime, OS, invocation path, and **machine vs human** output priority.
2. Apply summaries; open `references/`; avoid inventing **tool-specific flags** — **`quality-validation-and-guardrails.md`**.
3. Respond using **Suggested response format**; note **breaking argv** semver.

### Operating principles

1. **Errors to stderr; data to stdout** — Preserve `$(cmd)` and pipes — **`cli-runtime-system-model.md`**.
2. **Meaningful exit codes** — Document **usage** vs **runtime** failure when feasible.
3. **Idempotent `--help` / `--version`** — Fast, no network, exit `0`.
4. **Destructive actions** — Explicit flags; **never** ambiguous prompts in non-TTY — **`decision-framework-and-tradeoffs.md`**.
5. **Stable interface** — Additive flags; deprecate with timeline; semver argv for published tools — **`versions.md`**.
6. **Signals** — Handle **pipe closure** without traceback spam — **`failure-modes-detection-mitigation.md`**.

### CLI runtime system model (summary)

Stdin/stdout/stderr, exit code, TTY, signals — **`cli-runtime-system-model.md`**.

Details: [references/cli-runtime-system-model.md](references/cli-runtime-system-model.md)

### Failure modes — detection and mitigation (summary)

Hung CI, broken pipe noise, JSON pollution, completion drift — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Subcommands vs flat flags; strict parsing; JSON policy — **`decision-framework-and-tradeoffs.md`**.

Details: [references/decision-framework-and-tradeoffs.md](references/decision-framework-and-tradeoffs.md)

### Configuration precedence and files (summary)

Flags > env > files > defaults; config discovery rules — **`configuration-precedence-and-files.md`**.

Details: [references/configuration-precedence-and-files.md](references/configuration-precedence-and-files.md)

### Quality validation and guardrails (summary)

Anti-hallucination for flags and exit-code folklore — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Tips and CLI UX (summary)

Help, naming, verbosity, deprecation — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Patterns by runtime (summary)

Python / Node / Go / Rust / shell — **`patterns-by-runtime.md`**.

Details: [references/patterns-by-runtime.md](references/patterns-by-runtime.md)

### Edge cases (summary)

Windows, containers, sudo PATH, arg limits — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision trees (summary)

Output, destructive ops, parsing, platform — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

stdout errors, secrets on argv, ambiguous prompts — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`code-packaging-pro`**, **`security-pro`**, **`testing-pro`**, **`docker-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Semver argv API; OS differences — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Runtime, OS targets, invocation (`bin`, `npx`, container), human vs automation mix.
2. **Problem** — Symptom (broken pipe, stuck CI, bad `--json`, wrong exit) and success criteria.
3. **System design / architecture** — Stdout/stderr/exit contract; TTY detection; signal handling sketch — cite **`cli-runtime-system-model.md`** when non-trivial.
4. **Decision reasoning** — Argv shape (flat vs subcommands); JSON policy; strict vs permissive parsing — **`decision-framework-and-tradeoffs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Parser-level or pseudocode hooks; redirection rules; minimal example — **no fabricated third-party flags** without labeling as illustrative.
6. **Trade-offs** — Breaking scripts vs UX; verbosity; completion maintenance cost.
7. **Failure modes** — Top risks for this design (EPIPE, hung prompts, log/JSON mix) — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Semver/breaking changes, shell-specific completion gaps, Windows caveats; delegate secret policy to **`security-pro`** when dominant.

## Resources in this skill

| Topic | File |
|-------|------|
| CLI runtime system model | [references/cli-runtime-system-model.md](references/cli-runtime-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-tradeoffs.md](references/decision-framework-and-tradeoffs.md) |
| Configuration precedence | [references/configuration-precedence-and-files.md](references/configuration-precedence-and-files.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Tips & CLI UX | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Patterns by runtime | [references/patterns-by-runtime.md](references/patterns-by-runtime.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

**Input (simple):** Users pipe output to `head`; traceback on broken pipe.  
**Expected output:** Full **Suggested response format** — EPIPE/SIGPIPE handling; quiet stderr; exit convention documented.

**Input (tricky):** Default path deletes files; users typo flags.  
**Expected output:** Non-default destructive path; `--dry-run`; non-TTY refuses without `--force`; **`security-pro`** for narrative.

**Input (cross-skill):** Ship Python CLI on PyPI with completions.  
**Expected output:** **`code-packaging-pro`** for entry points; **this skill** for `--help`, exit codes, completion generation; **`testing-pro`** for subprocess tests.

## Checklist before calling the skill done

### Contract

- [ ] **stdout vs stderr** explicit for success, errors, logs; **`--json`** path does not mix unstructured logs into stdout.
- [ ] **Exit codes** documented; **`--help` / `--version`** cheap and exit `0`.
- [ ] **Non-TTY / CI**: no ambiguous prompts — explicit flags or fail fast.

### Safety & evolution

- [ ] **Breaking argv** changes flagged with semver/migration for published tools — **`versions.md`**.
- [ ] **Secrets** not on argv; **`security-pro`** consulted when credential UX appears.

### Robustness

- [ ] **Broken pipe / SIGPIPE** addressed for streaming commands — **`edge-cases.md`**.
- [ ] **Windows** path/encoding noted when claiming cross-platform — **`edge-cases.md`**.
- [ ] **Failure modes** section addressed — not happy-path only — **`failure-modes-detection-mitigation.md`**.
