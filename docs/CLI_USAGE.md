# CLI Usage

Binary command names are `agentic-sdlc` and `asd`.

For a global install similar to `npm link`:

```bash
cargo install --path .
```

That installs both binaries globally:

```bash
agentic-sdlc
asd
```

`as` is intentionally not used because it conflicts with the system assembler command on macOS and Linux.

When invoked globally, the CLI works against the directory you call it from. If that directory is inside a Git repository, workflow/package operations resolve to the repository root instead of the binary installation directory.

## Init a project

To initialize another repository for first use:

```bash
asd init
```

Optional:

```bash
asd init --strict-ollama
asd init --json
```

`init` bootstraps the local `.agents/` structure and runs the same setup checks previously exposed under `workflow setup`.

## Index a project

To build or refresh the local project index:

```bash
asd index
```

Optional:

```bash
asd index --max-files 500
asd index --json
```

`index` rebuilds the graph index and sqlite context store used by project retrieval.

## Ask a project

After indexing, ask questions against the local repository context:

```bash
asd ask "project này làm gì?"
asd ask "where is auth logic?"
asd ask "tiếp theo nên làm gì?"
```

Optional:

```bash
asd ask "where is auth logic?" --limit 8
asd ask "project này làm gì?" --json
```

`ask` uses deterministic retrieval from the local index. It does not require network or a remote LLM.

## Fastest useful path

If you want the most practical daily command, run:

```bash
cargo run -- bug analyze examples/bug-sample.md
cargo run -- bug plan examples/bug-sample.md
cargo run -- bug reply examples/bug-sample.md
cargo run -- bug prompt examples/bug-sample.md
```

The sample input lives at [examples/bug-sample.md](../examples/bug-sample.md).

## Bug Mode

These commands are deterministic by default and do not require network access.
They read plain text or markdown files containing mixed language ticket text, logs, API errors, or stack traces.

```bash
cargo run -- bug analyze <input-file>
cargo run -- bug plan <input-file>
cargo run -- bug reply <input-file>
cargo run -- bug prompt <input-file>
```

`bug analyze` outputs:

- Summary
- Current behavior
- Expected behavior
- Reproduction steps
- Impact
- Suspected root cause
- Evidence from input
- Missing information
- Suggested investigation points
- Risk level

`bug plan` outputs:

- step-by-step investigation
- likely files/modules to inspect
- DB/API/log checkpoints
- fix direction
- validation checklist
- regression risk and priority

`bug reply` outputs:

- Vietnamese summary
- Japanese business-style reply
- short confirmation message
- clarification questions if needed

`bug prompt` outputs a copy-paste implementation prompt for a coding agent with:

- bug summary
- current behavior
- expected behavior
- investigation target
- fix constraints
- acceptance criteria
- test checklist

If you want to confirm the harness can create a real artifact after that, run:

```bash
cargo run -- --workflow-id starter/app-builder --task "create a todo list app"
```

This uses a skill-defined artifact blueprint to create files under `local_tmp/generated-app` and then runs a real validation command.

After that, inspect what is available:

```bash
cargo run -- workflow list
cargo run -- workflow check
cargo run -- workflow status
```

## Workflow Mode

Workflow definitions under `.agents/workflows` must use Markdown (`.md`) format.
Project rules under `.agents/rules` are Markdown files with a fenced `json` block.
Custom skills under `.agents/skills` are Markdown files with a fenced `json` metadata block plus prompt body.
Role profiles under `.agents/roles` are Markdown files (optional fenced `json` metadata + role prompt body).
`workflow check` also validates that `llm_subagent` role references like `architect:::` resolve to an existing role file.
All package markdown files must include a schema line:
- workflows: `Schema: agentic-sdlc.workflow@v1`
- skills: `Schema: agentic-sdlc.skill@v1`
- roles: `Schema: agentic-sdlc.role@v1`
- rules: `Schema: agentic-sdlc.rule@v1`

Run a workflow from file path:

```bash
cargo run -- --workflow valid_flow.md
```

Run a workflow resolved from `.agents/workflows` ID:

```bash
cargo run -- --workflow-id feature
cargo run -- --workflow-id starter/app-builder --task "create a todo list app"
cargo run -- --workflow-id starter/todo-cli-node
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

Important:

- `starter/*` workflows are the best first run when you want a concrete generated artifact.
- many `feature/review/release` workflows are analysis/report workflows unless they include explicit mutation steps like `agent.write_file` or `agent.run_script`.

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

Evaluate workflow report quality from a dataset (pass/fail gate by pass-rate threshold):

```bash
cargo run -- workflow eval .agents/evals/release_eval.json
cargo run -- workflow eval .agents/evals/release_eval.json --min-pass-rate 0.9 --json
```

Approve/reject manual approval gates and resume paused workflows:

```bash
cargo run -- workflow status <instance_id>
cargo run -- workflow approve <instance_id> --step manual_approval_gate --by release-manager --note "qa+security passed"
cargo run -- workflow reject <instance_id> --step manual_approval_gate --by security --note "blocking risk"
cargo run -- workflow resume <instance_id>
```

Dataset format example:

```json
{
  "name": "release-eval",
  "cases": [
    {
      "id": "release-case-1",
      "report": {
        "summary": "Release summary with rollback and risk posture.",
        "actions": ["run regression tests", "prepare rollback checklist"],
        "risks": ["latency spike risk"]
      },
      "required_summary_keywords": ["rollback", "risk"],
      "required_action_keywords": ["test", "rollback"],
      "required_risk_keywords": ["latency"],
      "min_actions": 2,
      "min_risks": 1,
      "min_summary_chars": 80
    }
  ]
}
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

Import external `SKILL.md` repositories and convert to local folder-skill format:

```bash
cargo run -- workflow import-skills https://github.com/anthropics/skills --max-skills 20
cargo run -- workflow import-skills https://github.com/anthropics/skills --allow-missing-license
cargo run -- workflow import-skills https://github.com/anthropics/skills --mode global --allow-missing-license
cargo run -- workflow import-skills /absolute/path/to/skills-repo --domain agent --overwrite --json
cargo run -- workflow import-skills /absolute/path/to/skills-repo --no-catalog-rebuild
```

Imported entries are written as:
- `.agents/skills/imported/<skill-name>/SKILL.md`

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

Normalize imported skill metadata in-place (`risk/source/tags`) without re-syncing remote sources:

```bash
cargo run -- workflow normalize-imported-skills
cargo run -- workflow normalize-imported-skills --dry-run --json
cargo run -- workflow normalize-imported-skills --mode global --json
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
cargo run -- workflow verify-lock --require-attestation
cargo run -- workflow verify-lock --mode global --json
```

Mode behavior:
- `--mode local`: install/sync under `.agents/skills/imported` and lockfile `.agents/skills.lock.json`
- `--mode global`: install/sync under `$CODEX_HOME/skills/imported` (fallback `~/.codex/skills/imported`) and lockfile `$CODEX_HOME/skills/skills.lock.json`

Register MCP runtime servers:

```bash
cargo run -- workflow mcp-register ollama-cli --transport stdio --command npx --arg -y --arg mcp-client-for-ollama --arg --ollama-host --arg http://127.0.0.1:11434
cargo run -- workflow mcp-register local-supabase --transport http --url http://127.0.0.1:54321/mcp --allow-tool query --allow-tool list_tables
cargo run -- workflow mcp-register analytics-sse --transport sse --url http://127.0.0.1:8787/sse --env API_TOKEN=dev-token --disabled
```

List MCP servers:

```bash
cargo run -- workflow mcp-list
cargo run -- workflow mcp-list --json
```

Ping MCP servers (all enabled by default, or one by name):

```bash
cargo run -- workflow mcp-ping
cargo run -- workflow mcp-ping ollama-cli --timeout-ms 8000
cargo run -- workflow mcp-ping local-supabase --json
```

Evaluate MCP tool policy for a registered server:

```bash
cargo run -- workflow mcp-policy local-supabase --tool query
cargo run -- workflow mcp-policy local-supabase --tool query_secret --json
```

MCP command notes:
- registry path: `.agents/mcp/servers.json`
- supported transports: `stdio|http|sse`
- `stdio` requires `--command` and optional repeated `--arg`
- `http|sse` require `--url`
- `--env` accepts repeated `KEY=VALUE` entries
- `--allow-tool` / `--deny-tool` define per-server policy metadata
- policy matching supports exact names, `prefix*`, and `*` wildcard
- by default, `mcp-ping` checks only enabled servers

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

Bootstrap missing package skeleton files (rules + core workflows/templates/roles/skills + memory indexes) and run doctor:

```bash
cargo run -- init
cargo run -- init --strict-ollama
cargo run -- init --json
```

Generate scaffold markdown packages with correct schema headers:

```bash
cargo run -- workflow scaffold workflow feature-search --profile advanced
cargo run -- workflow scaffold skill search_docs --profile advanced
cargo run -- workflow scaffold role planner --profile basic
cargo run -- workflow scaffold rule runtime --overwrite
```

`workflow scaffold skill ...` writes:
- `.agents/skills/<skill-name>/SKILL.md`

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

Export OpenTelemetry-compatible trace payload (OTLP JSON shape):

```bash
cargo run -- workflow trace <instance_id> --otel
cargo run -- workflow trace <instance_id> --otel --timeline
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
- Ollama availability/reachability (warn by default, strict mode via `AGENTIC_SDLC_BOOTSTRAP_REQUIRE_OLLAMA=1`)
- package layout under `.agents/` (workflows/rules/skills/roles/templates/memory) and markdown-only policy (no YAML under workflows/skills/roles/rules/templates)
- `workflow check` integrity

`init` additionally creates missing baseline markdown package files:
- `.agents/rules/{runtime,branching_rules,coding_rules,merge_rules}.md`
- `.agents/workflows/{starter,feature,bugfix,review,release}.md` (created when each file is missing)
- `.agents/templates/{feature_prompt,bugfix_prompt,review_prompt,release_prompt}.md` (created when each file is missing)
- `.agents/roles/{architect,implementer,reviewer,resolver,releaser}.md` (created when each file is missing)
- `.agents/skills/{analyze_code,generate_tests,next_steps}/SKILL.md` (created when each file is missing)
- `.agents/memory/vector_index.json`
- `.agents/memory/graph_index.json`

Context retrieval injection controls:
- `AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE=vector|graph|hybrid|off`
- `AGENTIC_SDLC_CONTEXT_BACKEND=json|sqlite`
- `AGENTIC_SDLC_CONTEXT_INDEX_PATH=.agents/memory/vector_index.json`
- `AGENTIC_SDLC_CONTEXT_MIN_SCORE=0.1`
- `AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH=.agents/memory/graph_index.json`
- `AGENTIC_SDLC_CONTEXT_GRAPH_MIN_SCORE=0.05`
- `AGENTIC_SDLC_CONTEXT_DB_PATH=.agents/memory/context.db`
- `AGENTIC_SDLC_CONTEXT_VECTOR_TABLE=vector_entries`
- `AGENTIC_SDLC_CONTEXT_GRAPH_TABLE=graph_nodes`

`ci_gate.sh` includes clean-clone smoke coverage:
- clones repo into a temp directory
- runs `init`, `workflow doctor`, `workflow check`
- runs `cargo run -- --workflow valid_flow.md` in the fresh clone
