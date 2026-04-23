# Decision framework and trade-offs (algorithms)

## Contents

1. [Exact vs approximate](#exact-vs-approximate)
2. [Simple heuristic vs heavy DS](#simple-heuristic-vs-heavy-ds)
3. [Proof burden vs ship speed](#proof-burden-vs-ship-speed)
4. [Batch vs streaming algorithm](#batch-vs-streaming-algorithm)

Deep numeric trade-offs remain in **[optimization-and-trade-offs.md](optimization-and-trade-offs.md)**.

---

## Exact vs approximate

Exact algorithms may be **too slow** for web-scale streams — document error bounds when using sketches — **`algorithms-in-systems.md`**.

---

## Simple heuristic vs heavy DS

Segment trees vs difference arrays — complexity of **implementation** vs query time — **`pattern-catalog.md`**, **`decision-tree.md`**.

---

## Proof burden vs ship speed

Contest vs production: production still needs **invariant** or property tests — **`testing-pro`**.

---

## Batch vs streaming algorithm

Streaming sacrifices **global** view unless extra memory — **`algorithms-in-systems.md`**.
