# Enforcement System Report

Date: 2026-06-03
Repo: `ai-engineering-harness`
Version reviewed: `0.11.0`

## Executive Summary

The harness is no longer just a loose documentation system. As of `v0.11.0`, it already defines command-level preconditions, minimum read sets, redirect behavior, required outputs, a verification evidence contract, and progressive loading guidance across `AGENTS.md`, `commands/`, and supporting docs.

The real gap now is not "missing command contracts." The real gap is that most of those contracts are still declared in markdown and socially enforced by the agent prompt, not mechanically enforced by the harness runtime, installer scaffolding, validator, or artifact schemas.

So the correct framing is:

- Current state: contract-rich documentation system with partial workflow discipline
- Target state: enforcement system where phase gates, recall, evidence, and artifact freshness are hard to skip
- Main delta: move from "agent should comply" to "harness makes non-compliance obvious, invalid, or blocked"

## Sources Reviewed

- [AGENTS.md](../AGENTS.md)
- [docs/usage-examples.md](usage-examples.md)
- [docs/harness-command-behavior.md](harness-command-behavior.md)
- [docs/runtime-command-surface.md](runtime-command-surface.md)
- [docs/provider-command-matrix.md](provider-command-matrix.md)
- [docs/quality-gates-matrix.md](quality-gates-matrix.md)
- [docs/memory-model.md](memory-model.md)
- [docs/artifact-layout.md](artifact-layout.md)
- [templates/VERIFY.md](../templates/VERIFY.md)
- [templates/REMEMBER.md](../templates/REMEMBER.md)
- [commands/harness-map.md](../commands/harness-map.md)
- [commands/harness-discuss.md](../commands/harness-discuss.md)
- [commands/harness-plan.md](../commands/harness-plan.md)
- [commands/harness-run.md](../commands/harness-run.md)
- [commands/harness-verify.md](../commands/harness-verify.md)
- [commands/harness-ship.md](../commands/harness-ship.md)
- [commands/harness-remember.md](../commands/harness-remember.md)
- [aih.sh](../aih.sh)
- [package.json](../package.json)
- [CHANGELOG.md](../CHANGELOG.md)

## What Is Already True in v0.11.0

### 1. Command contracts exist

The repo already ships explicit command contracts in `commands/`:

- `Minimum Read Set`
- `Preconditions`
- `Required Outputs`
- `Redirect Behavior`
- `Failure Conditions`
- `Completion Gate`

This is materially stronger than a free-form prompt pack.

### 2. Phase discipline is already documented

`AGENTS.md` already states:

- do not jump to `harness-run` without a clear goal and approved plan
- `harness-plan` stops before implementation
- `harness-verify` requires evidence
- `harness-ship` depends on verification evidence
- commands must redirect backward when preconditions fail

That is already the shape of an enforcement-oriented SDLC.

### 3. Verification is no longer "looks right" at the policy level

`AGENTS.md`, `commands/harness-verify.md`, `commands/harness-ship.md`, and `docs/quality-gates-matrix.md` all require fresh evidence, explicit not-run items, and truthful pass/fail/partial states.

### 4. Progressive loading is already a first-class concept

The harness already defines per-command read sets in both `AGENTS.md` and command docs. This is a meaningful move away from "load everything upfront."

### 5. Memory is richer than a single flat note conceptually

`docs/memory-model.md` already distinguishes:

- project facts
- decisions
- root causes
- reusable commands
- constraints
- hazards
- open questions

So conceptually, the project already knows it needs more than a generic `REMEMBER.md`.

## Where The Harness Is Still Soft

This is the real gap analysis.

### A. Contracts are declared, but not fully enforced

The docs say `harness-run` requires an approved plan and `harness-ship` requires real verification evidence. But the runtime does not currently prove those conditions before an agent can proceed.

Observed reality:

- `commands/` define behavior, but there is no hard validator for command execution state.
- `aih.sh` manages install, update, doctor, and runtime entrypoints, but it does not execute phase-gate validation against live `.harness/` artifacts.
- `doctor` checks installation health and command-surface wiring, not workflow validity.

Implication:

- The harness can tell the agent what the rules are.
- The harness cannot yet reliably stop a determined or sloppy agent from violating them.

### B. Memory recall is encouraged, not mandatory enough

Current command contracts tell `harness-map` to read `.harness/REMEMBER.md` if present. That is better than nothing, but still weaker than the target model.

Gaps:

- No mandatory hazard-first recall artifact
- No clear separation between reusable patterns, hazards, and architectural decisions in the artifact layout
- No runtime or validator rule that blocks planning when required memory recall did not happen

Implication:

- Memory exists, but its retrieval is still easy to skip in practice.

### C. Verification schema is structured, but still too prose-friendly

`templates/VERIFY.md` is better than an unstructured note, but it is still a markdown table plus free text. It is not yet a strongly checkable evidence schema.

Current fields:

- `status`
- tests table
- manual checks table
- evidence bullets
- known gaps

Remaining weakness:

- easy to fill with vague prose
- no required freshness marker
- no normalized verdict model like `pass|fail|partial|blocked`
- no guaranteed machine-checkable minimum such as at least one executed command with exit code

Implication:

- Verification quality is guided, but not strongly auditable.

### D. Memory artifact layout is conceptually rich, physically flat

The project has a strong memory model in docs, but the artifact layout still centers a single `.harness/REMEMBER.md`.

That creates three problems:

- hazard recall is not privileged
- decisions and root causes get mixed with session lessons
- future automation cannot easily route memory by type

### E. Skill system still leans more static than operational

`v0.11.0` improved skills with `Inputs`, `Output Contract`, and `Common Failure Modes`, which is real progress. But the repo still lacks a complete harness-level routing model that treats skills as intent-routed execution strategies with explicit composition and negative boundaries across the board.

### F. The harness cannot reason about staleness well enough

The docs discuss stale state and redirect behavior, but there is no clear universal artifact freshness system.

Missing examples:

- last verified timestamp
- artifact provenance
- "produced by command X" metadata
- explicit stale detection rules between `PLAN.md`, `TASKS.md`, `VERIFY.md`, and current diff

Implication:

- The harness can warn about staleness conceptually.
- It cannot systematically detect stale operational state.

### G. Self-improvement loop is present in spirit, not as a built-in mechanism

The repo has dogfood artifacts and historical learning in docs and changelog, but there is not yet a standardized friction log and audit loop built into the harness lifecycle.

## Updated Assessment of Your Proposed Gaps

Your original diagnosis was directionally right, but the repo has already closed part of it. The revised assessment is below.

### "No precondition enforcement"

Update: partially outdated.

What is true now:

- Precondition blocks exist in command contracts.

What remains true:

- Enforcement is mostly prompt-contract enforcement, not runtime enforcement.

Correct revised statement:

- Preconditions are documented well, but not yet made unavoidable by tooling.

### "Verification = looks right"

Update: partially outdated.

What is true now:

- The official contract is evidence-first.

What remains true:

- The artifact template is still soft enough that weak evidence can pass socially.

Correct revised statement:

- Verification philosophy is fixed; verification schema hardness is not.

### "Memory passive, recall not required"

Update: mostly still true operationally.

What is true now:

- Memory docs are much stronger than before.

What remains true:

- Recall is not yet privileged and blocked-in by artifact design and validation.

### "Skills are static prompt snippets"

Update: less true than before, but still directionally useful.

What is true now:

- Skill contracts are getting more structured.

What remains true:

- Intent routing, negative boundaries, and composition rules are not yet systematic enough.

### "Load everything upfront"

Update: outdated at the policy layer.

What is true now:

- Progressive loading is already documented.

What remains true:

- There is still no measurable enforcement or telemetry that proves agents are following minimum read sets instead of overloading context.

## Target State: Enforcement System

The target should be defined as five layers.

### 1. Command Gate Enforcement

Each command should have two things:

- human-readable markdown contract
- machine-checkable gate rules

Practical meaning:

- `harness-plan` fails if no current goal exists
- `harness-run` fails if `PLAN.md` lacks `Approval Status: approved`
- `harness-ship` fails if `VERIFY.md` has no executable evidence
- `harness-remember` fails if no verified or failed outcome exists to generalize

This is the single highest-leverage change because it turns the command loop into an actual control plane.

### 2. Memory as a Required Recall System

Move from one generic memory sink to typed memory with privileged recall order.

Recommended structure:

- `.harness/DECISIONS.md`
- `.harness/HAZARDS.md`
- `.harness/INDEX.md`
- keep goal-local `.harness/REMEMBER.md` for per-goal lessons if desired

Recall rule:

- `harness-map` must read `HAZARDS.md` first when present
- `harness-plan` must read `DECISIONS.md` and `HAZARDS.md` when relevant
- `harness-verify` should consult `INDEX.md` for reusable checks

This is the difference between memory being archival and memory being operational.

### 3. Evidence Schema, Not Just Evidence Guidance

`VERIFY.md` should become much stricter.

Recommended minimum schema:

- `verdict: pass|fail|partial|blocked`
- `freshness:` date/time or run marker
- `tests_run:` list of entries with `cmd`, `exit_code`, `summary`
- `manual_checks:` list of entries with `step`, `expected`, `observed`, `result`
- `known_gaps:` explicit list
- `evidence_links:` files, logs, or inspected outputs

Important nuance:

- markdown is fine
- free-form structure is not

The goal is machine-checkable markdown, not necessarily JSON.

### 4. Staleness Awareness

Artifacts should record enough metadata to detect drift.

Examples:

- `Produced By: harness-plan`
- `Last Updated: <timestamp>`
- `Plan Basis: GOAL.md hash or summary`
- `Verification Basis: changed files or commit ref`

This enables commands like:

- `harness-run` warning if plan predates major scope changes
- `harness-ship` blocking when verify predates the latest code changes

### 5. Friction-Driven Harness Evolution

Add a first-class loop for harness self-improvement.

Recommended artifacts:

- `.harness/FRICTION.md`
- `harness-audit`

Purpose:

- capture where commands were unclear
- capture where skills overfired or underfired
- capture where templates invited fake completeness
- periodically synthesize recurring friction into product changes

This makes the harness anti-drift by design.

## Prioritized Recommendations

### Priority 1: Hard gate the command loop

Why:

- Highest trust gain
- Smallest conceptual change
- Builds directly on v0.11.0 contracts already written

Ship next:

1. Add machine-checkable required headings and status markers for `GOAL.md`, `PLAN.md`, `VERIFY.md`, and `SHIP.md`.
2. Extend validator or a new gate checker to validate command preconditions.
3. Make `doctor` or a new `harness-audit` report workflow validity, not just install validity.

### Priority 2: Split memory into typed operational artifacts

Why:

- Strongest improvement to recall quality
- Enables hazard-first planning
- Makes future automation much easier

Ship next:

1. Add `DECISIONS.md`, `HAZARDS.md`, and `INDEX.md` templates.
2. Update `AGENTS.md`, `artifact-layout.md`, and command read sets.
3. Require `harness-map` to surface top hazards before recommending next action.

### Priority 3: Harden `VERIFY.md`

Why:

- Biggest product-quality protection
- Most measurable improvement
- Necessary before any "ship" claim can be trusted

Ship next:

1. Replace prose-friendly template sections with required tables or required field blocks.
2. Normalize verdict values.
3. Require at least one evidence-bearing check or an explicit blocked reason.

### Priority 4: Add artifact freshness metadata

Why:

- Prevents stale plans and stale verification from silently surviving
- Supports compaction, handoff, and resume flows

Ship next:

1. Add `Last Updated` and `Produced By` to active artifacts.
2. Add freshness checks in validator or runtime audit.
3. Use stale detection in `harness-start`, `harness-run`, and `harness-ship`.

### Priority 5: Upgrade skills from contract-rich snippets to routed strategies

Why:

- Valuable, but less urgent than command and verification enforcement
- Depends on stable command gates first

Ship next:

1. Add `When Not To Use` across all active skills if missing.
2. Add intent signal tables.
3. Add composition rules such as `runs after`, `blocks`, `conflicts with`.

## Recommended Roadmap

### Now

- Build gate validation for `PLAN.md`, `VERIFY.md`, and `SHIP.md`
- Harden `VERIFY.md` template
- Add typed memory templates

### Week 1

- Wire `harness-map` to mandatory hazard recall
- Add workflow-validity checks to `doctor` or `harness-audit`
- Add artifact freshness metadata

### Week 2

- Update all command docs and artifact layout to typed memory
- Add reusable verification command indexing in `INDEX.md`
- Dogfood one full end-to-end goal using the stricter contracts

### Week 3-4

- Add `FRICTION.md`
- Add `harness-audit`
- Add skill routing and composition rules
- Publish one end-to-end demo proving blocked phase-skipping

### Month 2

- Add session handoff artifact such as `SESSION.md`
- Port the core shell workflow checks into Node for stronger cross-platform validation
- Freeze one primary provider path until the enforcement model is stable

## If Only Three Things Ship

### 1. Command gate validation

This is the actual transition from documentation to enforcement.

### 2. Typed memory plus mandatory hazard recall

This is the operational memory breakthrough.

### 3. Strong `VERIFY.md` evidence schema

This is the quality trust layer.

## Bottom Line

This repo has already solved the "we need command contracts" stage. `v0.11.0` is meaningfully ahead of the baseline diagnosis.

The next phase is different work:

- not more command prose
- not more policy statements
- not more generic memory advice

The next phase is enforcement plumbing.

In short:

- The harness already knows the right workflow.
- It does not yet reliably prevent cheating.
- The highest-value move is to make workflow violations structurally invalid, not merely discouraged.
