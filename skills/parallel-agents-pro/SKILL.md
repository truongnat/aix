---
name: parallel-agents-pro
description: |
  Production-grade concurrent subagent workflows: dispatching parallel agents for independent tasks, coordinating dependencies across agents, aggregating results, handling agent failures, and managing shared state — plus system model (dispatch → parallel execution → coordination → aggregation), failure modes (race conditions, shared state conflicts, agent failures, coordination overhead), decision trade-offs (parallel vs sequential, agent count vs overhead, shared vs isolated state), and quality guardrails (dependency respect, state isolation, failure handling).

  Use this skill when the user asks to run multiple independent tasks in parallel, coordinate concurrent work, dispatch parallel agents, or manage parallel workflows.

  Use **with** **`executing-plans-pro`** for execution coordination, **`writing-plans-pro`** for dependency-aware task breakdown, domain **`*-pro`** skills for agent task execution, and **`planning-pro`** for workflow orchestration.

  Triggers: "parallel", "concurrent", "multiple agents", "parallel execution", "dispatch tasks", "coordinate parallel work", "run in parallel".

metadata:
  short-description: Parallel agents — concurrent workflows, coordination, result aggregation
  content-language: en
  domain: orchestration
  level: professional
---

# Parallel agent workflows (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use references such as [Parallel Computing Patterns](https://www.amazon.com/Patterns-Parallel-Software-Expert-Computing/dp/0321488134) and [Distributed Systems](https://www.amazon.com/Distributed-Systems-Principles-Paradigms/dp/1107427416) for methodology; this skill encodes **dependency-aware parallelization**, **state isolation**, **failure handling**, and **result aggregation** — not naive parallel execution.

## Boundary

**`parallel-agents-pro`** owns **agent dispatch**, **dependency coordination across agents**, **result aggregation**, and **failure handling**. **`executing-plans-pro`** owns **sequential execution coordination**. **`writing-plans-pro`** owns **dependency mapping for parallelization**. Domain **`*-pro`** skills own **agent task execution**.

## Related skills (this repo)

| Skill | When to combine with `parallel-agents-pro` |
|-------|------------------------------------------|
| **`executing-plans-pro`** | Sequential execution coordination for dependent tasks |
| **`writing-plans-pro`** | Dependency mapping to identify parallelizable tasks |
| **Domain `*-pro` skills** | Agent task execution within each agent |
| **`planning-pro`** | Workflow orchestration and milestone coordination |
| **`testing-pro`** | Parallel test execution strategies |

## When to use

- Running multiple independent tasks concurrently.
- Coordinating parallel workflows with dependencies.
- Dispatching agents for parallel exploration or execution.
- Aggregating results from multiple parallel tasks.
- Managing shared state across concurrent work.

- Trigger keywords: `parallel`, `concurrent`, `multiple agents`, `parallel execution`, `dispatch tasks`, `coordinate parallel work`, `run in parallel`

## When not to use

- **Sequential task execution** without parallelization — **`executing-plans-pro`**.
- **Single agent workflow** — domain skill directly.
- **High-level orchestration** without agent detail — **`planning-pro`**.
- **Pure task breakdown** without execution — **`writing-plans-pro`**.

## Required inputs

- **Tasks to execute in parallel** with their dependencies.
- **Agent capabilities** and constraints.
- **Shared state requirements** (if any).
- **Coordination strategy** for dependencies.

## Expected output

Follow **Suggested response format** strictly — agent dispatch plan, coordination strategy, aggregation approach, failure handling.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** tasks, dependencies, agent capabilities, shared state needs, and coordination strategy. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm which tasks are actually independent, what dependencies exist, and whether subagents are justified at all. Ask before parallelizing blocking work.
2. **Simplicity First** — Use the smallest number of agents that materially reduces time without increasing coordination cost too much.
3. **Surgical Changes** — Parallelize only disjoint or clearly coordinated work. Do not split tightly coupled tasks across agents just because parallelism sounds faster.
4. **Goal-Driven Execution** — Done = ownership, dependency order, and aggregation criteria are explicit and the parallel plan can be verified.
5. **Dependency truth first** — Critical-path work should stay local or serialized when waiting on it would block everything anyway.
6. **State isolation beats hero coordination** — Shared write surfaces and implicit coupling should be reduced before dispatching agents.
7. **Aggregation is part of the job** — Parallel outputs are only useful if the integration contract is clear.
8. **Failure handling must be planned** — Timeouts, partial completion, and inconsistent agent results should have a defined response.

## Default recommendations by scenario

- **Independent research slices** — Dispatch in parallel and aggregate after all return.
- **Code changes with disjoint files** — Split by ownership boundary, not by arbitrary task count.
- **Blocking critical-path work** — Keep local unless a subagent can run truly in parallel with non-overlapping work.
- **Shared-state tasks** — Avoid parallelism unless the integration contract is explicit and low-risk.

## Decision trees

Summary: choose sequential vs parallel execution based on dependency tightness, shared state, and integration cost.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: parallelizing blocking work, overlapping write ownership, and creating more coordination overhead than actual speedup.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Dispatch, coordination, and aggregation (summary)

How work should move from dispatch through execution to result merging without losing ownership clarity.

Details: [references/dispatch-coordination-aggregation.md](references/dispatch-coordination-aggregation.md)

### Dependency-aware parallelization (summary)

How to separate truly parallel work from tasks that only appear independent.

Details: [references/dependency-aware-parallelization.md](references/dependency-aware-parallelization.md)

### State isolation and failure handling (summary)

How to prevent shared-state conflicts and recover cleanly from partial or failed agent runs.

Details: [references/state-isolation.md](references/state-isolation.md)

### Monitoring and adaptation (summary)

How to watch progress, detect blocked agents, and adapt the plan when coordination assumptions break.

Details: [references/monitoring-and-adaptation.md](references/monitoring-and-adaptation.md)

## Suggested response format

1. **Context** — Tasks, dependencies, ownership boundaries, and why parallelism is or is not justified.
2. **Parallelization model** — Explain dispatch, coordination, and aggregation plan.
3. **Execution plan** — Which agent handles what and in what order dependencies resolve.
4. **Verification** — How to confirm ownership, result quality, and integration success.
5. **Residual risks** — Remaining shared-state, coordination, or failure-handling caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Dispatch, coordination, and aggregation | [references/dispatch-coordination-aggregation.md](references/dispatch-coordination-aggregation.md) |
| Dependency-aware parallelization | [references/dependency-aware-parallelization.md](references/dependency-aware-parallelization.md) |
| Coordination strategies | [references/coordination-strategies.md](references/coordination-strategies.md) |
| State isolation | [references/state-isolation.md](references/state-isolation.md) |
| Failure handling | [references/failure-handling.md](references/failure-handling.md) |
| Monitoring and adaptation | [references/monitoring-and-adaptation.md](references/monitoring-and-adaptation.md) |
| Result aggregation | [references/result-aggregation.md](references/result-aggregation.md) |
| Decision framework | [references/decision-framework.md](references/decision-framework.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Failure modes | [references/failure-modes.md](references/failure-modes.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

**Input:** "Research three independent libraries and summarize the trade-offs."
- Dispatch three independent research slices in parallel and define a common comparison template.
- Aggregate only after each slice returns its evidence.
- **Verify:** The final synthesis preserves ownership and comparable outputs across all three threads.

**Input (tricky):** "Split one refactor across agents that all touch the same files."
- Call out that this is not good parallel work unless ownership can be cleanly separated.
- Prefer sequential or boundary-based decomposition instead of collision-heavy dispatch.
- **Verify:** No overlapping write set remains before agents are launched.

**Input (cross-skill):** "Run implementation and validation in parallel."
- Pair **`executing-plans-pro`** for checkpoint discipline and let **`parallel-agents-pro`** define safe concurrency boundaries.
- Keep one track from invalidating the other’s assumptions mid-run.
- **Verify:** Verification results can still be trusted against the implementation state they were meant to test.

## Checklist before calling the skill done

- [ ] True task independence, dependencies, and ownership boundaries confirmed first (Think Before Coding)
- [ ] Minimum useful number of agents chosen; no unnecessary orchestration overhead (Simplicity First)
- [ ] Only disjoint or safely coordinated work was parallelized (Surgical Changes)
- [ ] Success criteria, aggregation plan, and dependency handling are explicit (Goal-Driven Execution)
- [ ] Shared state and write conflicts are addressed
- [ ] Failure/timeout handling is defined
- [ ] Critical-path tasks are not parallelized naively
- [ ] Residual coordination risks are documented
