# Decision framework and trade-offs (bug discovery)

## Contents

1. [Graph-first vs telemetry-first](#graph-first-vs-telemetry-first)
2. [Bisect vs brute read](#bisect-vs-brute-read)
3. [Wide impact vs deep single file](#wide-impact-vs-deep-single-file)
4. [Stop rules](#stop-rules)

See **`decision-tree.md`** for starting point.

---

## Graph-first vs telemetry-first

Production-shaped failures often start **traces/metrics**; structural unknowns benefit from **graph** — **`runtime-debugging.md`**, **`gitnexus-graph-workflow.md`**.

---

## Bisect vs brute read

Bisect pays off on **regression** with clean history; noisy history → targeted read — **`tips-and-tricks.md`**.

---

## Wide impact vs deep single file

`impact` d=1 first; avoid premature deep dive in unrelated module — **`tips-and-tricks.md`**.

---

## Stop rules

Diminishing returns: document **open risks** and **next instrumentation** instead of endless exploration — **`bug-candidates-and-confidence.md`**.
