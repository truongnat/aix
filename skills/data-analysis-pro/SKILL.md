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

1. Confirm data source, analytical question, deliverable (figure, table, `.xlsx`), privacy.
2. Apply summaries; open `references/`; establish **grain** before big numbers — **`analysis-pipeline-and-grain-model.md`**.
3. Respond using **Suggested response format**; avoid **causal** overreach — **`decision-framework-and-trade-offs.md`**.

### Operating principles

1. **Look at the data** — dtypes, missingness, duplicates before models — **`eda-and-cleaning.md`**.
2. **Define grain** — One row meaning; join discipline — **`analysis-pipeline-and-grain-model.md`**.
3. **Label uncertainty** — Missing data handling is a **claim** — document it.
4. **Plots serve questions** — Units, zero baseline, **n** — **`visualization-and-communication.md`**.
5. **Reproducibility** — Seeds, versions for non-trivial results — **`quality-validation-and-guardrails.md`**.
6. **Security** — Treat exports/notebooks as leaks — **`security-pro`**.
7. **Honest scope** — Descriptive vs inferential vs causal — **`decision-framework-and-trade-offs.md`**.

### Analysis pipeline and grain model (summary)

Ingest → validate → grain → aggregate → communicate — **`analysis-pipeline-and-grain-model.md`**.

Details: [references/analysis-pipeline-and-grain-model.md](references/analysis-pipeline-and-grain-model.md)

### Failure modes — detection and mitigation (summary)

Join explosions, tz bugs, leakage, Simpson, Excel IDs — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Tooling depth, causal claims boundary — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and reproducibility guardrails (summary)

n, denominators, seeds, anti-number-fabrication — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### EDA and cleaning (summary)

Dtypes, missingness, SQLite safety — **`eda-and-cleaning.md`**.

Details: [references/eda-and-cleaning.md](references/eda-and-cleaning.md)

### Visualization and communication (summary)

Honest charts — **`visualization-and-communication.md`**.

Details: [references/visualization-and-communication.md](references/visualization-and-communication.md)

### Spreadsheets: charts, pivots, validation (summary)

openpyxl patterns — **`spreadsheets-charts-and-validation.md`**.

Details: [references/spreadsheets-charts-and-validation.md](references/spreadsheets-charts-and-validation.md)

### Tips and tricks (summary)

Seeds, Parquet projection — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Timezones, joins, locale CSV, late data — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision trees (summary)

Size, question type, grain, deliverable — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Leakage, p-hacking, misleading charts — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`sql-data-access-pro`**, **`postgresql-pro`**, **`business-analysis-pro`**, **`security-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Library versions (summary)

Pin pandas/numpy for published results — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Data source(s), size hints, privacy, Python environment if relevant.
2. **Problem** — Analytical question; **target metric** definition; descriptive vs causal intent.
3. **System design / architecture** — Pipeline: grain definition, joins, filters, aggregates; lineage note — **`analysis-pipeline-and-grain-model.md`**.
4. **Decision reasoning** — pandas vs SQL pushdown; plot types; Excel vs notebook — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — pandas/SQL/matplotlib/openpyxl **outline** with key steps — label **Code** for snippets.
6. **Trade-offs** — Imputation vs drop; aggregation level; verbosity of EDA vs deadline.
7. **Failure modes** — What could invalidate the headline number (join, tz, leakage, small n) — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Reproducibility gaps, **`security-pro`** if export, **`business-analysis-pro`** if KPI policy needed.

## Resources in this skill

| Topic | File |
|-------|------|
| Pipeline & grain model | [references/analysis-pipeline-and-grain-model.md](references/analysis-pipeline-and-grain-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| EDA & cleaning | [references/eda-and-cleaning.md](references/eda-and-cleaning.md) |
| Visualization | [references/visualization-and-communication.md](references/visualization-and-communication.md) |
| Spreadsheets | [references/spreadsheets-charts-and-validation.md](references/spreadsheets-charts-and-validation.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

**Input:** 200k rows — revenue trend?  
**Expected output:** Grain stated; time aggregation; missing days; **failure modes** for seasonality confound.

**Input:** Train/test in file — AUC 0.99.  
**Expected output:** **Leakage** audit narrative; plots; **no** victory lap without checks — **`anti-patterns.md`**.

**Input:** Survey export → KPIs for roadmap.  
**Expected output:** This skill for cleaning/charts; **`business-analysis-pro`** for KPI policy; weights caveats.

## Checklist before calling the skill done

### Analytical correctness

- [ ] **Grain** explicit for aggregates; joins validated — **`analysis-pipeline-and-grain-model.md`**.
- [ ] **Denominators** and **n** for rates — **`quality-validation-and-guardrails.md`**.
- [ ] **Leakage / bias / Simpson** considered when metrics or splits discussed — **`edge-cases.md`**.

### Delivery

- [ ] **Charts** labeled (axes, units, sample/total where useful) — **`visualization-and-communication.md`**.
- [ ] **Excel** features justified — **`spreadsheets-charts-and-validation.md`**.
- [ ] **Unstructured dominant** task routed to **`content-analysis-pro`**.

### Rigor

- [ ] **Reproducibility** note when non-trivial — versions/seed — **`versions.md`**.
- [ ] **Failure modes** section present — **`failure-modes-detection-mitigation.md`**.
- [ ] **No causal** claims from visuals alone unless experiment framed — **`decision-framework-and-trade-offs.md`**.
