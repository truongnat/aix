# Edge cases — expanded catalog

Pair with **`algorithm-debugging.md`** when symptoms map to WA/TLE/MLE.

## Numeric

- **Overflow / underflow** — intermediates exceed type; multiply before divide carefully; modular arithmetic (**mod** is not a ring homomorphism for division).
- **Modulo** — negative values; inverse requires prime mod + Fermat/Euclidean (know when).
- **Float precision** — accumulation error; compare with epsilon; prefer integers/rationals when possible.

## Indices and boundaries

- **Off-by-one** — `0..n-1` vs `1..n`; fencepost errors in partitions.
- **Empty / singleton** — empty array, single node tree, two nodes only.
- **Duplicate keys** — stable vs unstable sort assumptions; multiset behavior.
- **Prefix/suffix edge** — empty prefix/suffix allowed or not.

## Graphs

- **Disconnected** — components; source unreachable from sink.
- **Negative cycles** — shortest path assumptions break.
- **Self-loops / multi-edges** — stated or not.
- **Dense vs sparse** — adjacency matrix vs list; memory blowup.

## DP / recursion

- **Wrong base case** — off-by-one in table dimensions.
- **Initialization** — `-inf` vs `0`; unreachable states.
- **Recursion depth** — stack overflow; switch to iterative.

## Data integrity

- **Degenerate distribution** — all equal, sorted already, duplicates everywhere.
- **Pathological adversarial** — sorted input breaks naive pivot QS; know your sort.

## Sorting / equality

- **ComparatorMustBe strict weak ordering** — violations cause subtle WA in C++/Java sorts.

## Systems interactions

- **Large constants** — same asymptotic loses to tuned simpler algorithm on real n.
