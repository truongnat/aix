# Quality validation and guardrails (algorithms)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [Complexity claims](#complexity-claims)
3. [Benchmark honesty](#benchmark-honesty)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Do **not** invent hidden test constraints or **Big-O** for unspecified DS without stating assumptions.

---

## Complexity claims

- State **average vs worst** case when both matter (hash maps, quicksort pivot).

---

## Benchmark honesty

- Microbench numbers are **environment-specific** — label machine/compiler when citing.

---

## Review checklist

- [ ] Counterexample search for greedy — **`correctness-and-complexity.md`**.
- [ ] Edge scan from **`edge-cases.md`**.
- [ ] If production path: tests delegated — **`testing-pro`**.
