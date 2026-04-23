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

Follow **Suggested response format** — modeling through residual risks, including **complexity table** and **edge-case** scan.

## Workflow

1. Confirm formal statement, constraints, objective, resource limits, and **execution shape** (batch/stream/distributed sketch).
2. Apply principles and summaries; open `references/`; keep **proof sketch** and **complexity** explicit.
3. Respond using **Suggested response format**; cite **debugging** path if symptom-driven (WA/TLE/MLE).

### Operating principles

1. **Model before coding** — states, transitions, objectives.
2. **Classify problem type** — taxonomy in **`decision-tree.md`**.
3. **Pick strategy by structure** — map signals to families; use **`pattern-catalog.md`**.
4. **Prove early** — invariants, exchange argument, or counterexample search for greedy.
5. **Optimize in stages** — asymptotic → DS → constants; **systems** layer when relevant (**`algorithms-in-systems.md`**).
6. **Test adversarially** — boundaries, overflow, degenerate (**`edge-cases.md`**).

### Problem modeling and strategy selection (summary)

Details: [references/modeling-and-strategy-selection.md](references/modeling-and-strategy-selection.md)

### Decision tree and taxonomy (summary)

Problem types + signals → algorithm families.

Details: [references/decision-tree.md](references/decision-tree.md)

### Pattern catalog (summary)

Explicit map: prefix sums, sliding window, graphs, segtree/BIT, DP families.

Details: [references/pattern-catalog.md](references/pattern-catalog.md)

### Correctness and complexity analysis (summary)

Details: [references/correctness-and-complexity.md](references/correctness-and-complexity.md)

### Optimization and trade-offs (summary)

Details: [references/optimization-and-trade-offs.md](references/optimization-and-trade-offs.md)

### Algorithms in systems (summary)

Batch vs streaming, memory/IO, concurrency hints, failure — not only Big-O.

Details: [references/algorithms-in-systems.md](references/algorithms-in-systems.md)

### Debugging WA / TLE / MLE (summary)

Structured triage and checklist.

Details: [references/algorithm-debugging.md](references/algorithm-debugging.md)

### Tips and tricks (summary)

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Expanded catalog: indices, modulo, graphs, DP init.

Details: [references/edge-cases.md](references/edge-cases.md)

### Anti-patterns (summary)

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

Details: [references/integration-map.md](references/integration-map.md)

### Implementation environment (summary)

Details: [references/versions.md](references/versions.md)

## Suggested response format (implement / review)

1. **Problem modeling** — Formal inputs/outputs, constraints, objective, problem **type** (taxonomy).
2. **Strategy selection** — Candidate approaches; why chosen family fits; greedy counterexample risk if applicable.
3. **Algorithm design** — States, transitions, pseudocode-level steps; key DS.
4. **Complexity analysis** — Time and space with assumptions; bottleneck identification.
5. **Code** — Implementation sketch or snippet; still labeled **Code**.
6. **Edge cases** — Overflow, boundaries, degenerate data; link **`edge-cases.md`** themes.
7. **Residual risks** — Hidden constants, benchmark uncertainty, systems limits (**memory/IO/streaming**), maintainability.

## Resources in this skill

| Topic | File |
|-------|------|
| Modeling and strategy | [references/modeling-and-strategy-selection.md](references/modeling-and-strategy-selection.md) |
| Decision tree & taxonomy | [references/decision-tree.md](references/decision-tree.md) |
| Pattern catalog | [references/pattern-catalog.md](references/pattern-catalog.md) |
| Correctness and complexity | [references/correctness-and-complexity.md](references/correctness-and-complexity.md) |
| Optimization and trade-offs | [references/optimization-and-trade-offs.md](references/optimization-and-trade-offs.md) |
| Algorithms in systems | [references/algorithms-in-systems.md](references/algorithms-in-systems.md) |
| Debugging WA/TLE/MLE | [references/algorithm-debugging.md](references/algorithm-debugging.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Implementation environment | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Modeling + proof

**Input:** Interval scheduling variant — unsure greedy works.  
**Expected output:** Formalize; exchange argument or counterexample; alternative algorithm if greedy fails — full **Suggested response format**.

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
