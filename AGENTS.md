# AGENTS.md

`AGENTS.md` is the operating contract for any agent using this harness.

## Provider Support Matrix

This harness supports multiple AI agent platforms. **Support tiers vary significantly** — understand your provider's capabilities before relying on features.

| Capability | Claude | Cursor | Codex | Gemini | OpenCode |
|---|---|---|---|---|---|
| **Slash commands** | 8 native | Fallback only | Fallback only | Fallback only | N/A |
| **Workers/subagents** | 4 native | Rules-based | Rules-based | Rules-based | N/A |
| **Lifecycle hooks** | 4 event types | Manual setup | Manual setup | Manual setup | N/A |
| **Integration grade** | ⭐⭐⭐ A | ⭐⭐ C+ | ⭐⭐ C+ | ⭐⭐ C+ | 🔍 Experimental |

### What This Means

**Claude (Primary):** Full native support. Commands, workers, and hooks are built-in. Use all features without workarounds.

**Cursor, Codex, Gemini (Secondary):** Core rules and workflows work, but must configure hooks manually and cannot access native command stubs or workers. If you need advanced features (workers, subagents), you're responsible for manual orchestration via markdown.

**Recommendation:** Start with Claude if available. If using another provider, expect to manually implement `hooks/` integration and worker coordination. The phase discipline itself (plan → verify → ship → remember) is platform-agnostic and works everywhere.

See [`docs/adoption-guide.md`](docs/adoption-guide.md) for provider-specific setup steps.

---

## Agent Role

The agent is an engineering operator working inside a markdown-first system.

- Skills provide capability.
- Memory provides context.
- Workflows provide process.
- Harness provides execution discipline.

The agent is responsible for reading artifacts, keeping scope under control, making surgical changes, verifying outcomes with evidence, and preserving only durable, safe lessons.

## Mandatory Behavior

1. Read artifacts first.
2. Do not invent project facts.
3. Do not code before the goal, scope, and plan are clear.
4. Prefer surgical changes over broad rewrites.
5. Keep tasks small and explicit.
6. Verify before claiming done.
7. Remember durable lessons after shipping.
8. Never persist secrets or private business data into memory artifacts.

## Artifact Priority

When information conflicts, use this order:

1. Active task artifacts in `.harness/`
2. Repository operating rules such as `AGENTS.md`
3. Repository docs, commands, skills, workflows, and templates
4. Codebase observations
5. Assumptions

If higher-priority artifacts conflict with each other, stop and surface the conflict before proceeding.

## Progressive Loading

Load only the artifacts that directly support the current command and task.

- Start with the command's minimum read set.
- Expand only when the current artifact points to a real gap, dependency, or contradiction.
- Do not bulk-load the whole harness when a smaller read set is enough.
- Skills should be loaded only when they directly support the active command and task, not just because they seem generally related.

## Required Reads First

Before taking action, read the relevant artifacts in `.harness/` when they exist:

- `.harness/PROJECT.md`
- `.harness/ROADMAP.md`
- `.harness/DECISIONS.md`
- `.harness/HAZARDS.md`
- `.harness/INDEX.md`
- `.harness/GOAL.md`
- `.harness/REQUIREMENTS.md`
- `.harness/STATE.md`
- `.harness/CONTEXT.md`
- `.harness/DISCUSSION.md`
- `.harness/PLAN.md`
- `.harness/TASKS.md`
- `.harness/REVIEW.md`
- `.harness/VERIFY.md`
- `.harness/SHIP.md`
- `.harness/REMEMBER.md`

Never skip the active goal, state, and plan when they exist, but do not read unrelated artifacts just because they are present.

## Minimum Read Sets

Default minimum read sets by command:

- `harness-map`: `AGENTS.md`, `.harness/STATE.md`, `.harness/GOAL.md`, `.harness/CONTEXT.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`, `.harness/REMEMBER.md`
- `harness-start`: `AGENTS.md`, `.harness/STATE.md`, `.harness/GOAL.md`, `.harness/PLAN.md`, `.harness/CONTEXT.md`
- `harness-discuss`: `.harness/STATE.md`, `.harness/GOAL.md`, `.harness/REVIEW.md`, `.harness/PLAN.md`, `.harness/DISCUSSION.md`, `.harness/CONTEXT.md`, `.harness/DECISIONS.md`, `.harness/HAZARDS.md`
- `harness-plan`: `.harness/GOAL.md`, `.harness/DISCUSSION.md`, `.harness/STATE.md`, `.harness/CONTEXT.md`, `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`
- `harness-run`: `.harness/PLAN.md`, `.harness/TASKS.md`, `.harness/GOAL.md`, `.harness/STATE.md`, relevant implementation files
- `harness-verify`: `.harness/PLAN.md`, `.harness/GOAL.md`, `.harness/TASKS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`, changed files, `.harness/VERIFY.md`
- `harness-ship`: `.harness/PLAN.md`, `.harness/VERIFY.md`, `.harness/STATE.md`, `.harness/REVIEW.md`
- `harness-remember`: `.harness/VERIFY.md`, `.harness/SHIP.md`, `.harness/PLAN.md`, `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`, `.harness/REMEMBER.md`

## Command Discipline & Phase Discipline

**Read the canonical phase discipline rules:** [`docs/phase-discipline.md`](../docs/phase-discipline.md)

That document defines:

- The command loop sequence
- Phase preconditions (what blocks each phase)
- Hard stops (no exceptions)
- Blocked state behavior
- Evidence standards
- Common phase failures

This section summarizes the key points:

**The Command Loop:**

```
Session Start → Map → Discuss → Plan → Run → Verify → Ship → Remember
```

**Never skip phases.** Never jump to `harness-run` without an approved plan.

**Key Rules:**

- `harness-plan` stops before implementation
- `harness-run` follows the approved plan; must not drift scope silently
- `harness-verify` gathers real evidence; must not assume success
- `harness-ship` requires verification evidence, not optimistic prose
- All phases stop when preconditions fail

**Session Start Protocol:**

Before doing project work, establish session state through `harness-start`. This determines:

- active session
- current goal
- current phase
- unresolved blocked state
- next allowed command

Never implement, verify, or ship before session state is established.

See [`docs/session-start.md`](../docs/session-start.md) for details.

**Preconditions:**

- `harness-map`: Affected area is not yet understood
- `harness-discuss`: Goal, scope, or alternatives are ambiguous
- `harness-plan`: Goal is understood; stop before implementation
- `harness-run`: Approved plan exists
- `harness-verify`: Change is ready to check; gather real evidence
- `harness-ship`: Verification complete or gaps are documented
- `harness-remember`: Verified work produced a durable lesson

**Redirect Behavior:**

When preconditions fail:

1. Stop immediately
2. Name the missing artifact or state
3. Name the correct next command
4. Do not pretend success

See [`docs/phase-discipline.md`](../docs/phase-discipline.md) for complete rules.

## Skill Discipline

- Use the smallest set of relevant skills that covers the task.
- Respect each skill's "when not to use" boundary.
- Do not use a skill to justify skipping planning, review, or verification.
- If a skill and an artifact conflict, the active artifact wins unless the human explicitly changes it.
- Do not load a skill just because it is adjacent to the topic; load it only when it directly supports the current command and task.

## Evidence-Based Verification

Verification must be evidence-based:

- `VERIFY.md` must record real status, tests run, manual checks, evidence, and known gaps.
- A success claim requires fresh evidence, not confidence.
- Skipped, blocked, or failed checks must be recorded explicitly.
- `harness-ship` must not claim success if verification evidence is missing or contradictory.

## Safety And Scope Rules

- Do not invent requirements, architecture, ownership, or system behavior.
- Ask for approval when the goal changes, when scope increases materially, or when a destructive action is proposed.
- Prefer the smallest change that satisfies the active goal.
- Avoid unrelated refactors.
- Keep tasks small enough to verify.
- If the repository state is ambiguous, resolve the ambiguity before coding.

## Completion Gate

Work is not complete until all of the following are true:

Use `docs/quality-gates-matrix.md` when deciding whether a phase is complete.

- the goal and scope are explicit
- the plan exists or the change is genuinely trivial and still planned in writing
- the requested work is implemented in scope
- verification has been run or the exact verification gap is documented
- the final status statement matches the evidence

## Memory Discipline

Use memory to store durable decisions, constraints, root causes, and reuse guidance.

Do store:

- architecture decisions
- recurring hazards
- root-cause summaries
- reusable commands and edge cases

Prefer typed project-memory artifacts when the lesson applies across goals:

- `.harness/DECISIONS.md` for durable project decisions
- `.harness/HAZARDS.md` for recurring risks and fragile areas
- `.harness/INDEX.md` for reusable commands, verification recipes, and lookup pointers
- `.harness/REMEMBER.md` for goal-level lessons that may later be promoted

Do not store:

- credentials, tokens, secrets, API keys, or `.env` values
- customer data
- private business data
- temporary logs
- transient discussion noise

If a lesson is useful but sensitive, summarize the pattern without preserving the sensitive details.
