---
name: algorithm-pro
description: |
  Professional algorithm engineering: formal modeling, problem taxonomy (optimization, counting, online, …), strategy selection (greedy/DP/graph/search), correctness and complexity proofs, pattern recognition, competitive debugging (WA/TLE/MLE), systems constraints (memory, IO, streaming), and performance trade-offs.

  Use this skill when the user designs or optimizes algorithms, compares approaches, proves correctness, solves hard CS problems, or tunes implementations under strict limits.

  Use **with** **`testing-pro`** for adversarial and property-based tests, **`data-analysis-pro`** for benchmarks, **`network-infra-pro`** / **`caching-pro`** when algorithms run in distributed or cached pipelines.

  Triggers: "algorithm", "data structure", "dynamic programming", "graph", "greedy", "complexity", "Big-O", "optimize", "proof", "LeetCode", "competitive programming", "two pointers", "binary search on answer", "Dijkstra", "bitmask", "TLE", "WA", "MLE", "overflow", "streaming", "batch", "pattern", "prefix sum", "segment tree".

metadata:
  short-description: Algorithm — modeling, taxonomy, correctness, patterns, systems, debugging
  content-language: en
  domain: algorithms
  level: professional
---

# Algorithm design and analysis (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [CLRS](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) and [CP-Algorithms](https://cp-algorithms.com/) for formal references; this skill encodes **constraint-first modeling**, **correctness-first reasoning**, **explicit pattern selection**, and **systems-aware trade-offs**. Confirm **input constraints**, **objective**, **memory/time limits**, and **execution context** (batch, streaming, distributed) before proposing a solution.

## Boundary

**`algorithm-pro`** owns **problem modeling**, **taxonomy**, **algorithm family choice**, **proof sketches**, **complexity**, **pattern catalog usage**, **WA/TLE/MLE debugging**, and **algorithmic aspects** of batch/streaming design. It does **not** replace **`postgresql-pro`** for SQL-centric solutions, **`security-pro`** for crypto protocols, or full **SRE** ownership — pair as needed.

| Skill | When to combine |
|-------|-----------------|
| **`testing-pro`** | Adversarial tests, property-based tests, regression suites |
| **`data-analysis-pro`** | Benchmark interpretation, distributions |
| **`typescript-pro`** / **`javascript-pro`** | Numeric limits, BigInt, typed arrays |
| **`postgresql-pro`** | Query + index equals “algorithm” in DB |
| **`network-infra-pro`**, **`caching-pro`**, **`deployment-pro`** | Distributed runs, caches, rollout — with **`algorithms-in-systems.md`** |

## When to use

- Hard algorithmic tasks under tight constraints; proof of greedy or DP correctness.
- **WA / TLE / MLE** triage; complexity audit of nested loops and DS usage.
- Choosing patterns (prefix sum, sliding window, graphs, segment trees, …).
- **Systems**: streaming vs batch, memory ceilings, parallel stages — algorithmic implications.

## When not to use

- Pure **product requirements** without an algorithmic core — other skills first.
- **Formal verification** / theorem-prover obligations — specialized tooling.
- **Cryptographic protocol design** — **`security-pro`** + domain experts.

## Required inputs

- Constraints: **n**, value ranges, **time/memory** limits, **online** vs offline.
- **Correctness** definition (optimization target, counting mod, etc.).
- **Language/runtime** if constants matter.

## Expected output

Follow **Suggested response format (STRICT)** — eight sections including **complexity** and **edge-case** scan.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** formal statement, constraints, objective, resource limits, **execution shape** → verify: [problem classified].
2. **State assumptions** about input ranges, performance requirements (**Think Before Coding**).
3. **Apply** minimum algorithm first; optimize only when justified (**Simplicity First**).
4. **Make surgical changes** — only modify algorithm code directly related to the request (**Surgical Changes**).
5. **Define success criteria** (complexity bounds, test coverage, benchmark targets); loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format (STRICT)**; cite **debugging** path if symptom-driven (WA/TLE/MLE).

### Operating principles

1. **Think Before Coding** — State assumptions: input constraints, performance bounds, edge cases. Ask when uncertain.
2. **Simplicity First** — Start with brute force; optimize only when complexity justified.
3. **Surgical Changes** — Only touch algorithm code related to the request. Don't refactor unrelated data structures.
4. **Goal-Driven Execution** — Define complexity bounds, test coverage, benchmark targets upfront.
5. **Model before coding** — states, transitions, objectives.
6. **Classify problem type** — taxonomy in **`decision-tree.md`**.
7. **Pick strategy by structure** — map signals to families; use **`pattern-catalog.md`**.
8. **Prove early** — invariants, exchange argument, or counterexample search for greedy.
9. **Optimize in stages** — asymptotic → DS → constants; **systems** layer when relevant (**`algorithms-in-systems.md`**).
10. **Test adversarially** — boundaries, overflow, degenerate (**`edge-cases.md`**).

### Algorithm constraints and proof (system model) (summary)

Formal object, resource envelope, proof obligations, systems coupling — **`algorithm-constraints-and-proof-system-model.md`**.

Details: [references/algorithm-constraints-and-proof-system-model.md](/skills/algorithm-pro/references/algorithm-constraints-and-proof-system-model.md)

### Failure modes — detection and mitigation (summary)

WA/TLE/MLE, overflow — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](/skills/algorithm-pro/references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Exact vs approximate, DS vs heuristic, streaming — **`decision-framework-and-trade-offs.md`** (see also **`optimization-and-trade-offs.md`**).

Details: [references/decision-framework-and-trade-offs.md](/skills/algorithm-pro/references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Evidence on complexity and benchmarks — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](/skills/algorithm-pro/references/quality-validation-and-guardrails.md)

### Problem modeling and strategy selection (summary)

Details: [references/modeling-and-strategy-selection.md](/skills/algorithm-pro/references/modeling-and-strategy-selection.md)

### Decision tree and taxonomy (summary)

Problem types + signals → algorithm families.

Details: [references/decision-tree.md](/skills/algorithm-pro/references/decision-tree.md)

### Pattern catalog (summary)

Explicit map: prefix sums, sliding window, graphs, segtree/BIT, DP families.

Details: [references/pattern-catalog.md](/skills/algorithm-pro/references/pattern-catalog.md)

### Correctness and complexity analysis (summary)

Details: [references/correctness-and-complexity.md](/skills/algorithm-pro/references/correctness-and-complexity.md)

### Optimization and trade-offs (summary)

Details: [references/optimization-and-trade-offs.md](/skills/algorithm-pro/references/optimization-and-trade-offs.md)

### Algorithms in systems (summary)

Batch vs streaming, memory/IO, concurrency hints, failure — not only Big-O.

Details: [references/algorithms-in-systems.md](/skills/algorithm-pro/references/algorithms-in-systems.md)

### Debugging WA / TLE / MLE (summary)

Structured triage and checklist.

Details: [references/algorithm-debugging.md](/skills/algorithm-pro/references/algorithm-debugging.md)

### Tips and tricks (summary)

Details: [references/tips-and-tricks.md](/skills/algorithm-pro/references/tips-and-tricks.md)

### Edge cases (summary)

Expanded catalog: indices, modulo, graphs, DP init.

Details: [references/edge-cases.md](/skills/algorithm-pro/references/edge-cases.md)

### Anti-patterns (summary)

Details: [references/anti-patterns.md](/skills/algorithm-pro/references/anti-patterns.md)

### Integration map (summary)

Details: [references/integration-map.md](/skills/algorithm-pro/references/integration-map.md)

### Implementation environment (summary)

Details: [references/versions.md](/skills/algorithm-pro/references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Constraints (n, values), limits, execution shape (batch/stream/distributed), language/runtime.
2. **Problem / goal** — Objective (optimize/count/decide) and correctness notion.
3. **System design** — State/transition view or reduction — **`algorithm-constraints-and-proof-system-model.md`**.
4. **Decision reasoning** — Family choice vs alternatives; greedy proof obligation — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Pseudocode or snippet — label **Code**.
6. **Trade-offs** — Asymptotic vs constants; memory vs time; exact vs approximate.
7. **Failure modes** — WA/TLE/MLE/overflow angles — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Unproven greedy, benchmark noise, systems limits — **`algorithms-in-systems.md`**, **`testing-pro`**.

## Resources in this skill

| Topic | File |
|-------|------|
| Modeling and strategy | [references/modeling-and-strategy-selection.md](/skills/algorithm-pro/references/modeling-and-strategy-selection.md) |
| Decision tree & taxonomy | [references/decision-tree.md](/skills/algorithm-pro/references/decision-tree.md) |
| Pattern catalog | [references/pattern-catalog.md](/skills/algorithm-pro/references/pattern-catalog.md) |
| Correctness and complexity | [references/correctness-and-complexity.md](/skills/algorithm-pro/references/correctness-and-complexity.md) |
| Optimization and trade-offs | [references/optimization-and-trade-offs.md](/skills/algorithm-pro/references/optimization-and-trade-offs.md) |
| Algorithms in systems | [references/algorithms-in-systems.md](/skills/algorithm-pro/references/algorithms-in-systems.md) |
| Debugging WA/TLE/MLE | [references/algorithm-debugging.md](/skills/algorithm-pro/references/algorithm-debugging.md) |
| Tips | [references/tips-and-tricks.md](/skills/algorithm-pro/references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](/skills/algorithm-pro/references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](/skills/algorithm-pro/references/anti-patterns.md) |
| Integration map | [references/integration-map.md](/skills/algorithm-pro/references/integration-map.md) |
| Implementation environment | [references/versions.md](/skills/algorithm-pro/references/versions.md) |

## Quick example

### 1 — Modeling + proof

**Input:** Interval scheduling variant — unsure greedy works.  
**Expected output:** Formalize; exchange argument or counterexample; alternative algorithm if greedy fails — full **Suggested response format (STRICT)**.

### 2 — Complexity audit

**Input:** O(n log n) on paper but TLE at n=2e5.  
**Expected output:** Hidden quadratic, DS misuse, or language constants; profiling plan — **`algorithm-debugging.md`**, **`data-analysis-pro`**.

### 3 — Systems

**Input:** Need one-pass memory-bounded frequency for infinite stream.  
**Expected output:** Streaming constraints; approximate vs exact trade-offs — **`algorithms-in-systems.md`**.

## Checklist before calling the skill done

### Core

- [ ] Problem model, constraints, and **problem type** explicit.
- [ ] Strategy justified vs alternatives; **pattern** or **decision-tree** link clear.
- [ ] Correctness argument and **complexity** stated.
- [ ] **Numeric** overflow/precision risks named.

### Debugging & edges

- [ ] If symptom **WA/TLE/MLE**: **`algorithm-debugging.md`** checklist addressed.
- [ ] **Edge cases** scan: empty, boundaries, duplicates, graphs, mod (**`edge-cases.md`**).

### Systems (when applicable)

- [ ] **Batch vs streaming**, memory ceiling, IO, or parallelism considered — **`algorithms-in-systems.md`**.
- [ ] Greedy: **proof sketch** or counterexample documented.

### Integration

- [ ] Tests/adversarial ideas reference **`testing-pro`** when shipping code.
