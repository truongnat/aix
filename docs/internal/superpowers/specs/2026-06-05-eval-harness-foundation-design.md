# Eval Harness Foundation Design

## Goal

Turn evals into a first-class subsystem of `ai-engineering-harness` so the project can prove, not just claim, that the harness improves agent behavior and task outcomes.

## Problem

The repo currently has strong workflow guidance, validation, and prompt contracts, but no benchmark system that can measure whether those controls improve correctness, discipline, or efficiency.

Without evals:

- product claims remain qualitative
- regressions in rules and workflows are hard to detect
- CI cannot guard against prompt or contract drift
- telemetry data has no stable benchmark loop to feed back into

## Outcome

This design introduces a dedicated eval subsystem with:

- a structured task registry
- reusable fixtures and benchmark suites
- deterministic scoring for outcome and behavior
- A/B execution for `with-harness` versus `without-harness`
- machine-readable and human-readable reports
- a CLI surface that makes evals a normal product capability

## Non-Goals

- Full provider-specific live-agent orchestration in the first pass
- Mandatory LLM-as-judge in the first pass
- A complete 15-30 task corpus in the first pass
- Refactoring unrelated runtime or provider subsystems in the same implementation pass

## Product Framing

The eval subsystem should be treated as both:

1. internal engineering infrastructure for regression protection
2. user-facing product capability that demonstrates harness value

That means the implementation must be usable from the CLI, testable in CI, and documented as part of the repo's core capabilities.

## Architecture

The implementation adds a new top-level `evals/` area and a new `lib/evals/` engine.

### Data Layer

`evals/` becomes the source of truth for benchmark definitions:

- `evals/registry/`
  - suite and task manifests
- `evals/fixtures/`
  - benchmark repos or task-specific fixture trees
- `evals/rubrics/`
  - scoring contracts for behavior and outcome checks
- `evals/README.md`
  - user and contributor reference for the subsystem

Task manifests define:

- task identity and description
- fixture source
- task mode such as `bugfix`, `feature`, `refactor`, or `workflow-discipline`
- normalized prompt
- setup and teardown commands
- deterministic success checks
- behavior checks derived from harness contracts
- tags for filtering and reporting

### Engine Layer

`lib/evals/` owns execution, scoring, and reporting:

- `task-registry.js`
  - load and validate task manifests
- `fixture-manager.js`
  - materialize fixtures into isolated temp workspaces
- `run-context.js`
  - create run ids, directories, and mode-specific context
- `ab-runner.js`
  - execute `with-harness` and `without-harness` runs for the same task
- `checks/`
  - deterministic validations such as tests, file assertions, diff checks, and command checks
- `scoring.js`
  - combine outcome and behavior scores
- `reporter.js`
  - write `summary.json`, `metrics.json`, `transcript.md`, and `report.md`
- `index.js`
  - public entry used by CLI commands

### CLI Surface

Eval becomes a first-class CLI capability:

- `aih eval list`
- `aih eval run <task-or-suite>`
- `aih eval report <run-id>`

`aih eval doctor` is explicitly out of scope for the first implementation pass.

## Scoring Model

Each run should produce two independent score families.

### Outcome Score

Measures whether the task was actually completed.

Examples:

- task-specific tests pass
- required files or diffs exist
- validation commands succeed
- expected output contracts are satisfied

### Behavior Score

Measures whether the agent followed the harness discipline.

Examples:

- phase sequence was respected
- verification was attempted before completion claims
- required artifacts were created when the task required them
- scope did not silently drift
- required command patterns were followed

The first implementation should prioritize deterministic scoring and rule-based checks. LLM judging should be designed as an optional adapter, not as a required core dependency.

## A/B Execution Contract

Every benchmark run should compare two modes under controlled conditions:

- `without-harness`
  - the agent receives only the task prompt and benchmark repo context
- `with-harness`
  - the agent receives the same task prompt plus the harness rules, contracts, and artifacts required by the task

The runner must keep the rest of the environment as stable as possible:

- same provider and model
- same fixture state
- same timeout budget
- same retry or attempt policy

Each mode should emit isolated artifacts so the comparison is auditable.

## Run Artifacts

Each run should write structured output under a run directory, for example:

- `artifacts/runs/<timestamp>/<task>/<mode>/summary.json`
- `artifacts/runs/<timestamp>/<task>/<mode>/metrics.json`
- `artifacts/runs/<timestamp>/<task>/<mode>/transcript.md`
- `artifacts/runs/<timestamp>/<task>/<mode>/report.md`

These artifacts support three use cases:

- local debugging
- CI regression checks
- future analytics and product evidence

## Migration Strategy

The repo already has useful scenarios under `examples/`, but those should not remain the benchmark source of truth.

Recommended migration path:

1. build the eval engine and schema first
2. create a formal `evals/` source of truth
3. migrate or map 3-5 strong scenarios from `examples/` into benchmark tasks
4. add scoring and report tests
5. expand the corpus over time toward the 15-30 task target

This is a hybrid strategy: reuse realistic examples, but move ownership of benchmark structure into the dedicated eval subsystem.

## Repo Refactor Boundaries

This design intentionally keeps the first eval implementation separate from unrelated large refactors.

Allowed in the same implementation plan:

- adding the new `evals/` tree
- adding `lib/evals/`
- adding CLI command wiring for evals
- adding tests and docs required for the eval subsystem
- consolidating overlapping report utilities if they clearly duplicate eval reporting needs

Not included in the same implementation plan:

- splitting `lib/runtime-command-catalog.js`
- provider-schema redesign
- full telemetry analytics command work
- broad docs reorganization outside eval-related surfaces

Those are valid future improvements, but bundling them into the eval foundation would make verification and review too noisy.

## Testing Strategy

The first implementation should include:

- unit tests for manifest loading and validation
- unit tests for scoring logic
- integration tests for fixture materialization
- integration tests for `aih eval list`
- integration tests for `aih eval run` using a deterministic local fixture
- report contract tests for generated JSON and Markdown outputs

CI should eventually run a stable subset of eval tasks as regression coverage, but the first pass can start with a deterministic fixture-backed subset to keep runtime and flakiness under control.

## Documentation Impact

The implementation should add or update:

- `evals/README.md`
- a user-facing eval usage document under `docs/`
- CLI help text for new eval commands
- contributor guidance for adding new eval tasks

The documentation should frame evals as proof infrastructure and as a user-visible capability.

## Risks

### Overfitting to local deterministic tasks

If the first corpus is too synthetic, the benchmark will be easy to game and weak as evidence.

Mitigation:

- seed the first corpus from realistic existing examples
- keep task definitions explicit and outcome-driven

### Excessive scope in the first pass

Trying to ship provider orchestration, LLM judging, analytics, and large repo refactors together would slow delivery and weaken verification.

Mitigation:

- keep the first milestone focused on local deterministic infrastructure plus CLI integration

### Flaky benchmark execution

Eval systems fail when fixture setup, temp workspaces, or command assumptions are unstable across platforms.

Mitigation:

- rely on isolated fixture materialization
- test on the existing Node-based cross-platform CI matrix
- start with deterministic tasks that do not require network access

## Milestones

### Milestone 1

Create the eval subsystem foundation:

- `evals/` structure
- manifest schema
- fixture materialization
- scoring core
- report generation
- CLI `list`, `run`, and `report`

### Milestone 2

Migrate the initial benchmark corpus:

- 3-5 tasks converted from realistic examples
- deterministic outcome checks
- behavior scoring tied to harness contracts

### Milestone 3

Wire evals into regression workflows:

- stable CI subset
- contributor guidance
- expansion path for additional tasks and future telemetry integration

## Decision

Adopt a hybrid migration strategy with a strong architectural reset:

- `evals/` becomes the new benchmark source of truth
- existing `examples/` provide initial realistic seed material
- the first implementation optimizes for deterministic local execution and clean subsystem boundaries

This gives the repo a credible eval foundation without coupling the first pass to live-provider automation or unrelated refactor work.
