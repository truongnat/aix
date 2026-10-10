# Algorithm — anti-patterns

## Coding before modeling

- Wrong state definition → wasted time and subtle wrong answers.
- **Fix:** Write states, transitions, and base cases on paper first.

## “It passed sample” as proof

- Hidden TLE/WA on max tests.
- **Fix:** Derive complexity; add stress tests and edge cases (empty, single, max values).

## Floating point for exact equality

- Rounding breaks equality checks.
- **Fix:** Epsilon with care, or integer/rational representation.

## Recursion without depth guard

- Stack overflow on deep recursion in JS/Python.
- **Fix:** Iterative DP or tail where possible; increase stack only when justified.

## Optimizing wrong bottleneck

- Micro-optimizing O(1) while main loop is O(n²).
- **Fix:** Profile or count operations against constraints.

## Memorizing templates without invariant

- Copy-paste DP recurrence that does not match problem.
- **Fix:** State definition must imply optimal substructure explicitly.
