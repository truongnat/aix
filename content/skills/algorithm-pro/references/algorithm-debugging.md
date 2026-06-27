# Debugging algorithm failures (WA / TLE / MLE / RTE)

Structured triage for competitive-style and production failures. Pair with `**testing-pro**` for reproduction harnesses.

## Symptom → first checks


| Symptom               | Likely causes                                                          | Next steps                                                     |
| --------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| **WA** (wrong answer) | Off-by-one, wrong invariant, integer overflow, empty/null edge         | Re-read problem; trace tiny hand example; compare brute on n≤8 |
| **TLE**               | Hidden quadratic, map in loop, flush I/O, Python/Java constant factors | Profiling hot loop; verify actual loop depth; swap DS          |
| **MLE**               | O(n²) memory, adjacency matrix for sparse graph, recursion stack       | Measure peak; use iterative; compress state                    |
| **RTE**               | Stack overflow on deep recursion, array OOB                            | Convert to iterative BFS/stack; bounds check                   |


## WA deep dive

- **Invariant checklist** — loop maintains what? Base cases for DP correct?
- **Integer model** — use wider type or modulo story explicit.
- **Floating compare** — epsilon or rational arithmetic.

## TLE deep dive

- Verify **claimed complexity** matches **implemented** nesting.
- Watch **unordered_map**/hash contention; sometimes vector + sort wins.

## Infinite loop / hang

- Cycle detection in graphs; decreasing measure in DP recursion; strict progress in simulation.

## Proof mismatch

- If greedy: search **counterexample** on small random vs brute before trusting.

## Review checklist

- Minimal counterexample or **stress** input reproduces bug class.
- After fix, **regression** test pinned in suite.