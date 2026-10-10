# Quality validation and guardrails (data analysis — reproducibility)

## Before stating numbers in the wild

- [ ] **n** (rows) and **denominator** for rates — “% of what?”
- [ ] **Time window** and **timezone** for time series
- [ ] **Filters** repeated if someone reruns (“exclude test accounts”)
- [ ] **Rounding** policy — financial may need fixed decimals

## Anti-hallucination (analysis)

- Do **not** invent correlations or trends not computed from described data.
- Do **not** claim **causation** from plots alone — label **associational**.
- If **sample**, say **sample** — not population truth.

## Reproducibility checklist (non-trivial work)

- **Random seed** if any stochastic step
- **pandas / numpy / matplotlib** versions noted for published results
- **Input file hash** or version id when feasible
- **Notebook order** top-to-bottom executable (no “run cell 7 first”)

## Export safety

- Strip **PII columns** before **`to_csv`/`to_excel`** for broad sharing — **`security-pro`**.
