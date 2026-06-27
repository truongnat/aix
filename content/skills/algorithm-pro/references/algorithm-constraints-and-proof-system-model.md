# Algorithm — constraints, state space, and proof obligations (system model)

## Contents

1. [Formal object](#formal-object)
2. [Resource envelope](#resource-envelope)
3. [Proof and disproof](#proof-and-disproof)
4. [Systems coupling](#systems-coupling)

Pair with **[modeling-and-strategy-selection.md](modeling-and-strategy-selection.md)** and **[correctness-and-complexity.md](correctness-and-complexity.md)**.

---

## Formal object

Inputs, outputs, objective (minimize, count, decide), and **hidden constraints** (modulo, ordering) drive admissible algorithms — **`decision-tree.md`**.

---

## Resource envelope

Time, memory, **online** arrival, and IO define whether asymptotics or **constants** dominate — **`algorithms-in-systems.md`**.

---

## Proof and disproof

Greedy and heuristics need **certificate** (proof) or **counterexample** search before coding — **`correctness-and-complexity.md`**.

---

## Systems coupling

Distributed/streaming context shifts bottleneck from CPU to **network/partitions** — **`algorithms-in-systems.md`**, **`algorithm-debugging.md`**.
