# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Wrong join multiplicity** | `merge` duplicates rows | Row count explosion; revenue 2× | Validate keys; `validate=`; assert 1:1 / m:1 — **`analysis-pipeline-and-grain-model.md`** |
| **Timezone-naive datetime** | Mixed UTC/local | Seasonality shifts; wrong “day” bucket | Normalize tz before resample — **`eda-and-cleaning.md`** |
| **Lookahead leakage** | Feature uses future column | Impossible offline AUC | Time-based split; drop future fields — **`anti-patterns.md`** |
| **Survivor bias** | Only churned users in export | Wrong retention | Define cohort inclusion explicitly |
| **Simpson reversal** | Aggregates hide segments | Contradictory subgroup plots | Stratify; show both levels — **`edge-cases.md`** |
| **Unstable mean** | Heavy tails | Means jump with one row | Report median/IQR; show distribution |
| **Excel precision** | Float IDs rounded | Broken joins downstream | Strings for IDs in Excel export — **`edge-cases.md`** |
| **Parquet schema drift** | Nullable column suddenly object | Silent NaN coercion | Schema assertions on ingest |
| **p-hacking** | Many tests | “Significant” noise | Pre-specify; adjust or show all tests — **`anti-patterns.md`** |
| **PII in notebook output** | Display full rows | Compliance breach | Aggregate/mask — **`security-pro`** |
