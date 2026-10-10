# Failure modes — detection and mitigation (algorithms)

## Contents

1. [WA — wrong answer](#wa--wrong-answer)
2. [TLE — time limit](#tle--time-limit)
3. [MLE — memory limit](#mle--memory-limit)
4. [Overflow and modulo](#overflow-and-modulo)

Pair with **`algorithm-debugging.md`** and **`edge-cases.md`**.

---

## WA — wrong answer

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Off-by-one / empty input** | Fails hidden edge | Invariant checks; brute small — **`edge-cases.md`** |
| **Greedy without proof** | Counterexample exists | Exchange argument or switch algorithm — **`correctness-and-complexity.md`** |

---

## TLE — time limit

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Hidden quadratic** | n≈2e5 TLE | Profiling, DS choice — **`algorithm-debugging.md`** |
| **Recursion depth** | Stack overflow / TLE | Iterative DP, widen stack if platform allows — **`edge-cases.md`** |

---

## MLE — memory limit

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **O(n²) memory** | MLE on large n | Compact representation, streaming — **`algorithms-in-systems.md`** |

---

## Overflow and modulo

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **32-bit silent wrap** | Wrong mod answers | `int64` / `BigInt` per language — **`edge-cases.md`**, **`versions.md`** |
