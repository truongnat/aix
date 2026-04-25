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