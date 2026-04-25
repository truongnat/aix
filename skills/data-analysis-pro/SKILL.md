---
name: data-analysis-pro
description: |
  Production-grade tabular data analysis in Python: analytical pipeline and grain model (row unit, joins, lineage), EDA and cleaning discipline, descriptive statistics and honest visualization, pivot-style workflows, Parquet/CSV/SQLite IO, failure modes (join explosions, timezone bugs, lookahead leakage, Simpson’s paradox, p-hacking, Excel precision), decision trade-offs (pandas vs SQL pushdown, notebook vs pipeline, descriptive vs causal claims), reproducibility and anti-hallucination guardrails for numbers, spreadsheet delivery (openpyxl charts, validation, freeze panes), and integration with SQL, business analysis, and security for PII-safe exports.

  Use when analyzing CSV/Parquet/SQLite exports, profiling datasets, building aggregates and charts, or authoring Excel analytics — not for unstructured PDF/image semantic reading (content-analysis-pro).

  Use with content-analysis-pro, business-analysis-pro, postgresql-pro, sql-data-access-pro, security-pro, testing-pro as needed.

  Triggers: "analyze CSV", "pandas", "EDA", "Parquet", "pivot", "groupby", "matplotlib", "seaborn", "histogram", "missing values", "outliers", "correlation", "openpyxl", "data validation", "freeze panes", "SQLite", "profiling", "dtype", "leakage", "Simpson", "grain", "timezone", "reproducibility", "join", "many-to-many", "causation", "p-hacking", "cohort", "read_parquet".

metadata:
  short-description: Data analysis — pipeline/grain, EDA, viz, Excel, failure modes, reproducibility
  content-language: en
  domain: data-analysis
  level: professional
---

# Data analysis (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use **[pandas](https://pandas.pydata.org/docs/)** and your stack’s plotting docs for API truth; this skill encodes **analytical grain**, **pipeline discipline**, **honest descriptive statistics**, and **delivery patterns** — not notebook theater. Confirm **Python environment**, **data sensitivity** (PII), and **whether claims are descriptive or causal**. **`content-analysis-pro`** handles unstructured narrative/media interpretation.

## Boundary

**`data-analysis-pro`** owns **tabular** workflows: ingest → validate types → define grain → transform → aggregate → visualize → export (including **openpyxl** presentation). **`postgresql-pro`** owns **server-side database** product design beyond extracts. **`business-analysis-pro`** owns **business requirements** packaging from metrics. **`algorithm-pro`** is for heavy algorithmic theory — not typical EDA.

## Related skills (this repo)

| Skill | When to combine with `data-analysis-pro` |
|-------|----------------------------------------|
| **`content-analysis-pro`** | Unstructured PDF/image/video meaning — not pivot tables |
| **`business-analysis-pro`** | KPI definitions, BRD from metrics |
| **`postgresql-pro`** | Warehouse-scale SQL, indexing when analysis drives schema |
| **`sql-data-access-pro`** | SQLite extracts; parameterized SQL hygiene |
| **`security-pro`** | Anonymization, safe exports, notebook leakage |
| **`testing-pro`** | Regression tests on transform pipelines |
| **`market-research-pro`** | External validation of market assumptions |
| **`repo-tooling-pro`** | Batch orchestration for repeatable pipelines |

## When to use

- **EDA**, cleaning, profiling, aggregates, pivots.
- **Visualization** with labeled, honest axes.
- **Excel** analytics delivery (charts, validation).
- **Leakage/bias** sanity when metrics or splits appear.

## When not to use

- **“What does this scanned contract mean?”** — **`content-analysis-pro`**.
- **Kubernetes deployment** of pipelines — **`deployment-pro`** / **`ci-cd-pro`**.

## Required inputs

- **Data location**, **question**, **grain** if known, **privacy** constraints.

## Expected output

Follow **Suggested response format** strictly — pipeline through residual risks — with explicit **grain** and **denominators**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** data source, analytical question, deliverable (figure, table, `.xlsx`), privacy. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.