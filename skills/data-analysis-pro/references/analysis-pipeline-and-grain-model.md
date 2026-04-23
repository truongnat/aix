# Analysis pipeline and analytical grain

Tabular analysis is a **pipeline** with a defined **grain** (unit of one row) — mistakes here invalidate every aggregate.

## Pipeline (conceptual)

```text
Source (CSV / Parquet / SQLite / warehouse export)
    → ingest + schema validation
    → typing & parsing (dates, money, tz)
    → grain check (what does one row mean?)
    → joins / merges (preserve or intentionally change grain)
    → filters (cohort definition)
    → transformations (derived columns)
    → aggregates & windows (respect ordering for time)
    → visualization / tables / export
```

## Grain (unit of analysis)

| Question | Why it matters |
|----------|----------------|
| **One row = ?** | Transaction vs daily rollup vs customer — sums differ |
| **Duplicate keys** | Double-count revenue if merges multiply rows |
| **Slowly changing dimensions** | Same `customer_id` may map to different segments over time |

State the **grain** explicitly in write-ups (“daily revenue by **store**”).

## Observation vs inference

| Layer | Examples |
|-------|----------|
| **Observation** | Counts, means from loaded data, plots of sample |
| **Inference** | Causality, generalization to population, forecast — requires **assumptions** and often **`algorithm-pro`** / stats rigor |

This skill defaults to **descriptive** honesty — **`decision-framework-and-trade-offs.md`**.

## Lineage (lightweight)

For deliverables: **source file(s)**, **filter definition**, **as-of date**, **tool versions** — **`quality-validation-and-reproducibility-guardrails.md`**.
