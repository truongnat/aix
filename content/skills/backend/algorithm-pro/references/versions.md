# Algorithm — implementation environment

## Language numeric limits

- **JS** — safe integer range; `BigInt` for exact large integers with performance trade-off.
- **Python** — arbitrary precision ints; still watch time on huge values.

## Libraries

- Prefer **stdlib** for interviews; production may use **sorted containers**, **heapq**, **networkx** — document dependency impact.

## Numerical algorithms

- If linear algebra heavy → consider **`data-analysis-pro`** / numpy ecosystem vs hand-rolled loops.
