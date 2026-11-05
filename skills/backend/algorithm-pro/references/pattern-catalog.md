# Pattern catalog — explicit map

Quick reference for **recognizing** structure → **pattern** → see `**decision-tree.md`** + `**tips-and-tricks.md**` for depth.

## Arrays / sequences


| Pattern                     | Signal                                    | Typical complexity           |
| --------------------------- | ----------------------------------------- | ---------------------------- |
| **Prefix sum**              | Range sum query static array              | Build O(n), query O(1)       |
| **Difference array**        | Range add, point query                    | Range updates O(1) amortized |
| **Two pointers**            | Sorted + monotonic direction              | Often O(n)                   |
| **Sliding window**          | Subarray with constraint on min/max/count | O(n) with deque or counts    |
| **Binary search on answer** | Monotonic feasibility                     | O(log V · check)             |


## Stacks / queues / monotonic


| Pattern             | Signal                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| **Monotonic stack** | Nearest greater/smaller, histogram                                         |
| **Monotonic deque** | Sliding window min/max                                                     |
| **BFS layers**      | Unweighted shortest path on 0/1 or small integer weights (0-1 BFS variant) |


## Trees / graphs


| Pattern                 | Signal                                 |
| ----------------------- | -------------------------------------- |
| **DFS / Euler tour**    | Subtree queries, path sums             |
| **Union-find**          | Connectivity, Kruskal, offline queries |
| **Dijkstra**            | Non-negative edge shortest path        |
| **Bellman-Ford / SPFA** | Negative weights (careful cycles)      |
| **Topo sort**           | DAG scheduling, prerequisites          |


## Range queries (static)


| Structure         | Query / update trade-off                                |
| ----------------- | ------------------------------------------------------- |
| **Segment tree**  | Range query + point/range update O(log n)               |
| **Fenwick (BIT)** | Prefix sums + point updates O(log n), simpler constants |


## DP families


| Pattern               | Signal                                       |
| --------------------- | -------------------------------------------- |
| **Knapsack / subset** | Capacity constraint                          |
| **LIS variants**      | Patience sorting / segment tree optimization |
| **Digit DP**          | Count numbers with digit constraints         |


## Bit tricks


| Pattern        | Signal             |
| -------------- | ------------------ |
| **Bitmask DP** | n ≤ ~20–22 subsets |


Use `**correctness-and-complexity.md`** when proving why a pattern applies.