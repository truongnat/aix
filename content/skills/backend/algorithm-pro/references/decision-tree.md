# Algorithm — decision tree

## Problem type taxonomy (mindset)

| Type | Question shape | Typical tools |
|------|----------------|----------------|
| **Optimization** | Min/max objective under constraints | Greedy (with proof), DP, convex tricks |
| **Counting / combinatorics** | Number of valid objects | DP, inclusion–exclusion, generating functions (advanced) |
| **Decision / feasibility** | Exists? Yes/no | Binary search on answer, SAT-like small n |
| **Enumeration / listing** | Output all / k-best | Backtracking, heaps, divide & conquer |
| **Search** | Find element / structure | Binary search, graph search, A* (domain-specific) |
| **Online / streaming** | Bounded memory, adversarial order | Heaps, reservoirs, amortized structures |

Mixed problems — classify **primary objective** first, then nested structure.

## Problem signals → family

- **Optimal substructure + overlapping subproblems** → Dynamic programming (top-down with memo or bottom-up table).
- **Greedy choice + exchange argument** → Greedy after proof sketch.
- **Entities as vertices, constraints as edges** → Graph (BFS/DFS/shortest path/MST/flow).
- **Search space finite but large** → Backtracking with pruning; bitmasks for tiny n.
- **Sorted structure + monotonicity** → Two pointers, binary search on answer.

## When greedy is risky

- If counterexample exists without proof → default to DP or exhaustive on small n first.

## Complexity target

- **n ≤ 20** → Often O(2^n) or bitmask DP feasible.
- **n ≤ 2e5** → Usually O(n) or O(n log n); avoid O(n²) unless constants tiny.

## Escalation

- **Benchmark interpretation** → **`data-analysis-pro`**.
- **Production integration** → stack **`*-pro`** skill.
