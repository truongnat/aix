# agentic-sdlc

Deterministic local execution runtime for agentic software workflows.

This repository runs a single consolidated workflow engine with:
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

Onboard/check local prerequisites:

```bash
./scripts/bootstrap.sh
cargo run -- workflow doctor
cargo run -- workflow setup
```

Run deterministic CI gate locally:

```bash
./scripts/ci_gate.sh
```

Inspect active/previous runs:

```bash
cargo run -- workflow list
cargo run -- workflow status
cargo run -- workflow threads
```

Run a workflow with a reusable template prompt:

```bash
cargo run -- workflow start-template feature_prompt --task "add email validation to signup flow"
```

Run a role-bound workflow launch:

```bash
cargo run -- workflow start-role implementer --task "add email validation to signup flow"
```

Run chat-thread orchestration (thread branch + workflow + optional merge lifecycle):

```bash
cargo run -- workflow chat-thread feature-email --message "implement signup email validation"
cargo run -- workflow chat-thread review-thread --message "review current diff" --workflow-id review --template review_prompt --role reviewer --no-merge
```

Run thread-to-branch lifecycle end-to-end (includes auto conflict resolution attempts):

```bash
cargo run -- workflow thread-flow my-thread --target-branch main --validate-command "cargo test"
```

Run a direct workflow with template/role overrides:

```bash
cargo run -- --workflow-id feature --template feature_prompt --task "add email validation to signup flow"
cargo run -- --workflow-id feature --role-override "architect=planner,implementer=debugger"
```

Inspect available role profiles and templates:

```bash
cargo run -- workflow roles
cargo run -- workflow templates
```

Scaffold markdown package files with schema headers:

```bash
cargo run -- workflow scaffold workflow feature-search --profile advanced
cargo run -- workflow scaffold skill search_docs --profile advanced
```

Generate an advanced domain pack (workflows + skills + roles + templates):

```bash
cargo run -- workflow scaffold-domain payments
```

Rebuild graph index for context retrieval (also refreshes sqlite context tables in `.agents/memory/context.db`):

```bash
cargo run -- workflow index-graph
```

Run skill quality validation and strict gate:

```bash
cargo run -- workflow quality-skills
cargo run -- workflow quality-skills --strict
```

List available curated bundles:

```bash
cargo run -- workflow bundles
cargo run -- workflow bundles --json
```

Generate catalog/manifest/lock artifacts for skill bundles:

```bash
cargo run -- workflow build-catalog
```

Import third-party `SKILL.md` repos into local `.agents/skills/imported`:

```bash
cargo run -- workflow import-skills https://github.com/anthropics/skills --max-skills 20
cargo run -- workflow import-skills https://github.com/anthropics/skills --allow-missing-license
cargo run -- workflow import-skills https://github.com/anthropics/skills --mode global --allow-missing-license
```

Install using installer-style alias command:

```bash
cargo run -- workflow install-skillpack https://github.com/anthropics/skills --mode local --allow-missing-license
cargo run -- workflow install-skillpack https://github.com/anthropics/skills --mode global --allow-missing-license
```

Sync existing imported skills using pinned source commit/provenance from `.agents/skills.lock.json`:

```bash
cargo run -- workflow sync-imports --overwrite
cargo run -- workflow sync-imports --mode global --overwrite --allow-missing-license
```

Install a curated bundle into local/global skills root:

```bash
cargo run -- workflow install-bundle core
cargo run -- workflow install-bundle imported --mode global --overwrite
```

Verify lock integrity (detect missing/changed/extra skill entries):

```bash
cargo run -- workflow verify-lock
cargo run -- workflow verify-lock --mode global --fail-on-extra
```

`--mode local` writes to `.agents/skills/imported`; `--mode global` writes to `$CODEX_HOME/skills/imported` (fallback: `~/.codex/skills/imported`).

Resume a run:

```bash
cargo run -- workflow resume <instance_id>
```

Export trace:

```bash
cargo run -- workflow trace <instance_id> --json
cargo run -- workflow trace <instance_id> --timeline
```

## LLM Router

`llm_subagent` now routes real provider calls with timeout/retry/fallback and normalized telemetry output.

Common environment variables:

```bash
ANTIGRAV_LLM_PROVIDER=ollama|openai|gemini
ANTIGRAV_LLM_MODEL=<primary model>
ANTIGRAV_LLM_FALLBACK=openai,gemini
ANTIGRAV_LLM_TIMEOUT_MS=30000
ANTIGRAV_LLM_MAX_RETRIES=2
ANTIGRAV_LLM_SIMULATION_FALLBACK=true
OPENAI_API_KEY=...
GEMINI_API_KEY=...
```

Context retrieval service (for deterministic LLM context injection):

```bash
ANTIGRAV_CONTEXT_RETRIEVAL_MODE=vector|graph|hybrid|off
ANTIGRAV_CONTEXT_BACKEND=json|sqlite
ANTIGRAV_CONTEXT_INDEX_PATH=.agents/memory/vector_index.json
ANTIGRAV_CONTEXT_MIN_SCORE=0.1
ANTIGRAV_CONTEXT_GRAPH_INDEX_PATH=.agents/memory/graph_index.json
ANTIGRAV_CONTEXT_GRAPH_MIN_SCORE=0.05
ANTIGRAV_CONTEXT_DB_PATH=.agents/memory/context.db
ANTIGRAV_CONTEXT_VECTOR_TABLE=vector_entries
ANTIGRAV_CONTEXT_GRAPH_TABLE=graph_nodes
ANTIGRAV_CONTEXT_MAX_ITEMS=5
ANTIGRAV_CONTEXT_MAX_CHARS=300
```

## Generated Artifacts

These files are generated and ignored by git by default:
- `.agents/catalog/*`
- `.agents/skills_index.json`
- `.agents/workflows.json`
- `.agents/bundles.json`
- `.agents/marketplace.json`
- `.agents/skills.lock.json`
- `.agents/skills/imported/*`

Regenerate them anytime with:

```bash
cargo run -- workflow build-catalog
```

## Skill Format

Skill markdown supports both formats:
- frontmatter metadata (`---` block with at least `name/domain/executor`)
- fenced JSON metadata block (existing format)

Folder-skill layout is supported:
- `.agents/skills/<skill-name>/SKILL.md`
- optional `.agents/skills/<skill-name>/references/` and `.agents/skills/<skill-name>/scripts/`

## Installation

```bash
cargo install --path .
antigrav workflow doctor
```

## Documentation

- Architecture and runtime semantics: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- CLI usage guide: [`docs/CLI_USAGE.md`](docs/CLI_USAGE.md)
- Dev OS execution blueprint: [`docs/DEV_OS_BLUEPRINT.md`](docs/DEV_OS_BLUEPRINT.md)
- Release notes: [`CHANGELOG.md`](CHANGELOG.md)
