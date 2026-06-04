# Team Architecture Selection

## Purpose

This guide helps an agent choose the smallest team architecture pattern that still gives enough planning, review, verification, and risk control for a host repository.

Use this document during initial harness setup when selecting the team pattern for `.harness/TEAM.md`.

## Decision Table

| Situation | Recommended Pattern | Why |
|---|---|---|
| Small scoped change with meaningful review risk | Producer-Reviewer | Keeps execution simple while preserving review discipline |
| Multi-stage work with clear handoffs | Pipeline | Makes planning, implementation, and verification responsibilities explicit |
| Several independent investigations or code slices | Fan-out/Fan-in | Parallelizes bounded work and then re-integrates results |
| Problem needs different specialties | Expert Pool | Assigns narrow expertise without forcing full team decomposition |
| Work needs coordination across several roles or streams | Supervisor | Centralizes orchestration and decision flow |
| Work is large, layered, or decomposes into nested subproblems | Hierarchical Delegation | Supports structured breakdown without flattening all coordination |
| Tiny low-risk repository setup or docs-only work | Pipeline or Producer-Reviewer | Prefer the smallest pattern that still preserves review and verification |

## Pipeline

### When To Use

- the work has clear stages such as map, plan, execute, verify
- handoffs are more important than deep parallelism
- the project needs a stable, repeatable delivery chain

### When Not To Use

- the work is trivial enough for a single pass
- several independent subtasks should run in parallel

### Team Shape

- planner
- executor
- verifier or reviewer

### Information Flow

Work moves forward stage by stage. Each stage receives explicit artifacts and produces explicit outputs for the next stage.

### Strengths

- simple to reason about
- strong handoff clarity
- supports evidence discipline well

### Risks

- can become slow if overused for tiny work
- weak fit for independent parallel tasks

### Verification Strategy

Verify at the end of each stage that required artifacts exist and the next stage has enough context to proceed safely.

### Example

Adopting the harness into a new repository and producing the first project profile artifacts.

## Producer-Reviewer

### When To Use

- one agent or role can produce the work
- separate review is still required before completion
- the change is small to medium but not trivial

### When Not To Use

- there is no meaningful review surface
- the work needs deeper coordination across several streams

### Team Shape

- producer
- reviewer

### Information Flow

The producer creates artifacts or changes. The reviewer checks correctness, gaps, and verification evidence before completion.

### Strengths

- minimal coordination cost
- strong protection against unreviewed claims
- easy to apply to features, fixes, and profile design

### Risks

- reviewer may become a bottleneck
- weak fit for large decomposed programs of work

### Verification Strategy

Require the reviewer to inspect artifacts, challenge assumptions, and confirm verification evidence before ship.

### Example

Adding Google login while preserving guest mode, where one agent implements and another validates flow integrity.

## Fan-out/Fan-in

### When To Use

- multiple bounded tasks can proceed independently
- the project benefits from parallel investigation or implementation
- integration back into one plan or result is manageable

### When Not To Use

- tasks are tightly coupled
- integration risk is higher than the value of parallelism

### Team Shape

- coordinator
- multiple workers
- integrator or final reviewer

### Information Flow

The coordinator splits work into bounded slices. Workers execute independently. Results are merged and reviewed together.

### Strengths

- faster exploration or implementation across disjoint areas
- good fit for codebase mapping or parallel task breakdown

### Risks

- merge and consistency problems
- duplicated assumptions across workers

### Verification Strategy

Verify each slice independently, then run an integration review that checks consistency, overlapping assumptions, and regression surface.

### Example

Tracing several likely root-cause areas for a production incident, then converging on one root-cause report and mitigation plan.

## Expert Pool

### When To Use

- the task needs several specialties
- domain knowledge matters more than strict pipeline stages
- the work benefits from choosing focused experts rather than splitting the whole flow

### When Not To Use

- the project does not need specialized roles
- expertise boundaries are unclear and will cause churn

### Team Shape

- coordinator
- domain experts selected as needed

### Information Flow

The coordinator routes subproblems to the most relevant experts and consolidates their findings into one plan or decision.

### Strengths

- efficient use of expertise
- avoids overloading one generalist with all subproblems

### Risks

- too many experts can create noise
- synthesis quality becomes critical

### Verification Strategy

Verify that each expert output is scoped, evidence-based, and reconciled into one consistent operating decision.

### Example

A mobile auth change that needs both mobile flow expertise and backend auth boundary review.

## Supervisor

### When To Use

- the work spans several roles or streams that need active coordination
- priorities, scope, or risk may change during execution
- a central role must decide sequencing and escalation

### When Not To Use

- a simpler pattern already fits
- coordination overhead would outweigh the task size

### Team Shape

- supervisor
- one or more specialized contributors

### Information Flow

The supervisor owns the overall state, routes work, resolves conflicts, and decides when to escalate or stop.

### Strengths

- strong control over changing or risky work
- good for mixed investigation, implementation, and verification threads

### Risks

- can become process-heavy
- too much centralization may slow execution

### Verification Strategy

Require the supervisor to maintain explicit state, review evidence from contributors, and confirm that no completion claim bypasses gates.

### Example

A release-risky refactor where planning, implementation, regression review, and verification need active coordination.

## Hierarchical Delegation

### When To Use

- the problem decomposes into layers of subproblems
- multiple levels of planning and execution are needed
- the repository or task is large enough that flat coordination breaks down

### When Not To Use

- the work can be handled with one coordinator layer
- nested delegation would create confusion rather than clarity

### Team Shape

- top-level coordinator
- intermediate leads
- bounded workers beneath each lead

### Information Flow

The top level sets overall goals and constraints. Intermediate leads break work into subareas. Workers execute bounded tasks within those subareas.

### Strengths

- scales to larger work without one flat queue
- preserves accountability at each layer

### Risks

- information can degrade across layers
- over-delegation can hide critical assumptions

### Verification Strategy

Verify at each layer that goals, assumptions, and evidence remain consistent with the parent layer before work is accepted upward.

### Example

A broad platform change where mobile, backend, and verification concerns each need their own scoped lead and task set.
