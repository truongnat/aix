# Edge cases

- **Leaky** train/test — time-ordered data needs **time-based** splits, not random shuffles.
- **Simpson’s paradox** and **confounding** — aggregate trends can invert within groups — stratify before trusting one number.
- **PII** in tabular exports — mask or aggregate before sharing plots (**`security-pro`**).
- **Excel** row limits (**~1M**) and **float** precision — avoid Excel as canonical store for large IDs; use **text** columns for identifiers in exports — **`failure-modes-detection-mitigation.md`**.

---

## Time and ordering

- **Timezone mix** — UTC vs local in same column breaks daily rollups — normalize first — **`failure-modes-detection-mitigation.md`**.
- **Unsorted time series** — `rolling` / `resample` wrong if index not sorted — assert monotonic.
- **Business calendar** — Holidays shift “business days”; document if using calendar vs trading days.

## Joins and grain

- **Many-to-many accidental** — Exploding rows — validate merge — **`analysis-pipeline-and-grain-model.md`**.
- **Orphan dimensions** — Left join creates null keys silently — count nulls after join.

## Categorical and encoding

- **High-cardinality IDs** — One-hot explosion; usually treat as ID or embed upstream — **`eda-and-cleaning.md`**.
- **Sparse categories** — Long tail collapses signal — group “Other” with rule.

## Statistics and inference

- **Small n per slice** — Noisy percentages — show counts alongside % — **`visualization-and-communication.md`**.
- **Multiple comparisons** — Cherry-picked significant slice — disclose full grid — **`anti-patterns.md`**.

## IO and formats

- **CSV typing** — Leading zeros stripped (ZIP codes) — read as string dtype.
- **Locale decimals** — `1,234.56` vs `1.234,56` — explicit `decimal`/`thousands` parsing.
- **Parquet nested types** — Explode carefully; preserve list semantics.

## Operational data

- **Late-arriving facts** — Yesterday’s metrics change today — state **as-of** cutoffs for dashboards.
