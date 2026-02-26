# CLI Usage

Binary command name is `antigrav` (invoked in this repo via `cargo run -- ...`).

## Workflow Mode

Workflow definitions under `.agents/workflows` must use Markdown (`.md`) format.
Project rules under `.agents/rules` are Markdown files with a fenced `json` block.
Custom skills under `.agents/skills` are Markdown files with a fenced `json` metadata block plus prompt body.
Role profiles under `.agents/roles` are Markdown files (optional fenced `json` metadata + role prompt body).
`workflow check` also validates that `llm_subagent` role references like `architect:::` resolve to an existing role file.
All package markdown files must include a schema line:
- workflows: `Schema: antigrav.workflow@v1`
- skills: `Schema: antigrav.skill@v1`
- roles: `Schema: antigrav.role@v1`
- rules: `Schema: antigrav.rule@v1`

Run a workflow from file path:

```bash
cargo run -- --workflow valid_flow.md
```

Run a workflow resolved from `.agents/workflows` ID:

```bash
cargo run -- --workflow-id feature
```

Run a template-driven workflow (inject template prompt + concrete task into first `llm_subagent` step):

```bash
cargo run -- workflow start-template feature_prompt --task "add email validation to signup flow"
```

Override the target workflow if template name does not match workflow ID:

```bash
cargo run -- workflow start-template custom_prompt --workflow-id feature --task "..."
```

Run role-bound launch (bind all `llm_subagent` steps to one role profile):

```bash
cargo run -- workflow start-role implementer --task "add email validation to signup flow"
cargo run -- workflow start-role reviewer --workflow-id review --template review_prompt --task "review current diff" --json
```

Run chat-thread orchestration (thread branch -> selected workflow -> optional merge lifecycle):

```bash
cargo run -- workflow chat-thread feature-auth --message "implement signup auth and tests"
cargo run -- workflow chat-thread review-auth --message "review current diff" --workflow-id review --template review_prompt --role reviewer --no-merge
cargo run -- workflow chat-thread bug-thread --message "fix panic in checkout flow" --target-branch main --validate-command "cargo test" --json
```

Run a normal workflow with template/task override flags (no subcommand):

```bash
cargo run -- --workflow-id feature --template feature_prompt --task "add email validation to signup flow"
```

Override role mapping for `llm_subagent` inputs:

```bash
cargo run -- --workflow-id feature --role-override "architect=planner,implementer=debugger"
```

Inspect workflow instances:

```bash
cargo run -- workflow list
cargo run -- workflow status
cargo run -- workflow status <instance_id>
cargo run -- workflow threads
cargo run -- workflow threads <thread_id>
cargo run -- workflow threads --json
```

List available role profiles and templates:

```bash
cargo run -- workflow roles
cargo run -- workflow roles --json
cargo run -- workflow templates
cargo run -- workflow templates --json
```

Validate project package definitions:

```bash
cargo run -- workflow check
cargo run -- workflow check --json
```

Run skill quality-bar validation (metadata, trigger sections, examples, limitations, dangling links):

```bash
cargo run -- workflow quality-skills
cargo run -- workflow quality-skills --strict
cargo run -- workflow quality-skills --json
```

Build curated catalog and marketplace artifacts under `.agents/`:

```bash
cargo run -- workflow build-catalog
cargo run -- workflow build-catalog --json
```

List curated bundles from catalog:

```bash
cargo run -- workflow bundles
cargo run -- workflow bundles --json
```

Import external `SKILL.md` repositories and convert to local `.agents/skills/imported/*.md` format:

```bash
cargo run -- workflow import-skills https://github.com/anthropics/skills --max-skills 20
cargo run -- workflow import-skills https://github.com/anthropics/skills --allow-missing-license
cargo run -- workflow import-skills https://github.com/anthropics/skills --mode global --allow-missing-license
cargo run -- workflow import-skills /absolute/path/to/skills-repo --domain agent --overwrite --json
cargo run -- workflow import-skills /absolute/path/to/skills-repo --no-catalog-rebuild
```

Install skillpacks via installer alias:

```bash
cargo run -- workflow install-skillpack https://github.com/anthropics/skills --mode local --allow-missing-license
cargo run -- workflow install-skillpack https://github.com/anthropics/skills --mode global --allow-missing-license
```

Sync already-imported skills from lockfile-pinned provenance/commit:

```bash
cargo run -- workflow sync-imports --overwrite
cargo run -- workflow sync-imports --overwrite --allow-missing-license --json
cargo run -- workflow sync-imports --mode global --overwrite --allow-missing-license
```

Install bundle packs by id:

```bash
cargo run -- workflow install-bundle core
cargo run -- workflow install-bundle imported --mode global --overwrite --json
```

Verify lockfile integrity and detect drift:

```bash
cargo run -- workflow verify-lock
cargo run -- workflow verify-lock --fail-on-extra
cargo run -- workflow verify-lock --mode global --json
```

Mode behavior:
- `--mode local`: install/sync under `.agents/skills/imported` and lockfile `.agents/skills.lock.json`
- `--mode global`: install/sync under `$CODEX_HOME/skills/imported` (fallback `~/.codex/skills/imported`) and lockfile `$CODEX_HOME/skills/skills.lock.json`

Skill markdown format:
- frontmatter metadata (`---`) with at least `name/domain/executor`, or
- fenced JSON metadata block (legacy/current format).

Folder-skill structure is supported:
- `.agents/skills/<skill-name>/SKILL.md`
- optional `.agents/skills/<skill-name>/references/` and `.agents/skills/<skill-name>/scripts/`

Rebuild graph index for context retrieval (also refreshes sqlite context tables in `.agents/memory/context.db`):

```bash
cargo run -- workflow index-graph
cargo run -- workflow index-graph --max-files 500 --json
```

Run onboarding doctor checks (toolchain, package layout, markdown policy, package integrity):

```bash
cargo run -- workflow doctor
cargo run -- workflow doctor --strict-ollama
cargo run -- workflow doctor --json
```

Bootstrap missing package skeleton files (rules + starter workflow) and run doctor:

```bash
cargo run -- workflow setup
cargo run -- workflow setup --strict-ollama
cargo run -- workflow setup --json
```

Generate scaffold markdown packages with correct schema headers:

```bash
cargo run -- workflow scaffold workflow feature-search --profile advanced
cargo run -- workflow scaffold skill search_docs --profile advanced
cargo run -- workflow scaffold role planner --profile basic
cargo run -- workflow scaffold rule runtime --overwrite
```

Generate an advanced domain pack (workflows + skills + roles + templates):

```bash
cargo run -- workflow scaffold-domain payments
cargo run -- workflow scaffold-domain growth --json
```

Run thread lifecycle flow (thread start -> feature branch validate -> merge target -> auto conflict resolve loop -> conflict gate -> finalize):

```bash
cargo run -- workflow thread-flow <thread_id>
cargo run -- workflow thread-flow <thread_id> --target-branch main --validate-command "cargo test"
cargo run -- workflow thread-flow <thread_id> --json
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

After engine consolidation:
- `--replay` is deprecated and rejected
- `--resume` snapshot mode is deprecated and rejected
- `--snapshot-out` is ignored

## Onboarding And CI Gate

Bootstrap local environment and package checks:

```bash
./scripts/bootstrap.sh
cargo run -- workflow doctor
```

Run the full deterministic gate:

```bash
./scripts/ci_gate.sh
```

`ci_gate.sh` enforces:
- `cargo fmt --check`
- `cargo test`
- `cargo clippy -D warnings`
- clean-clone smoke
- `workflow check` with zero warnings
- `workflow quality-skills --strict`
- `workflow build-catalog`

`bootstrap.sh` verifies:
- `git`, `rustc`, `cargo`
- Ollama availability/reachability (warn by default, strict mode via `ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA=1`)
- package layout under `.agents/` (workflows/rules/skills/roles/templates/memory) and markdown-only policy (no YAML under workflows/skills/roles/rules/templates)
- `workflow check` integrity

`workflow setup` additionally creates missing baseline markdown package files:
- `.agents/rules/{runtime,branching_rules,coding_rules,merge_rules}.md`
- `.agents/workflows/starter.md` (only when no workflow markdown exists)
- `.agents/memory/vector_index.json`
- `.agents/memory/graph_index.json`

Context retrieval injection controls:
- `ANTIGRAV_CONTEXT_RETRIEVAL_MODE=vector|graph|hybrid|off`
- `ANTIGRAV_CONTEXT_BACKEND=json|sqlite`
- `ANTIGRAV_CONTEXT_INDEX_PATH=.agents/memory/vector_index.json`
- `ANTIGRAV_CONTEXT_MIN_SCORE=0.1`
- `ANTIGRAV_CONTEXT_GRAPH_INDEX_PATH=.agents/memory/graph_index.json`
- `ANTIGRAV_CONTEXT_GRAPH_MIN_SCORE=0.05`
- `ANTIGRAV_CONTEXT_DB_PATH=.agents/memory/context.db`
- `ANTIGRAV_CONTEXT_VECTOR_TABLE=vector_entries`
- `ANTIGRAV_CONTEXT_GRAPH_TABLE=graph_nodes`

`ci_gate.sh` includes clean-clone smoke coverage:
- clones repo into a temp directory
- runs `workflow setup`, `workflow doctor`, `workflow check`
- runs `cargo run -- --workflow valid_flow.md` in the fresh clone
