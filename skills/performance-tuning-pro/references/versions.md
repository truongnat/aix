# Versions and environment notes (performance tuning)

## Contents

1. [Runtime and VM](#runtime-and-vm)
2. [Profiling tools](#profiling-tools)
3. [Cross-environment drift](#cross-environment-drift)

Performance numbers are **not portable** across arbitrary version jumps — always tie claims to **measured** context.

---

## Runtime and VM

- **Node.js**: major upgrades change V8, GC behavior, and built-in perf hooks — re-baseline after upgrades.
- **Browser**: engine + device class dominate — separate desktop vs mobile budgets when relevant.

---

## Profiling tools

Exact CLI flags change by **tool version** — prefer official docs for `perf`, `py-spy`, `0x`, Chrome Performance, Node `--inspect`, OpenTelemetry collectors. This skill stays **pattern-based**, not flag-prescriptive.

---

## Cross-environment drift

Laptop vs CI vs prod differ in **cores**, **network RTT**, **neighbor noise**, and **container limits**. Treat CI perf smoke as **regression guard**, not absolute SLA proof — **`quality-validation-and-guardrails.md`**.
