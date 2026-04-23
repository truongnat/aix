# Data analysis — decision tree

## Data size and tool

```
Fits memory comfortably?
├── pandas / polars locally — profile dtypes early — eda-and-cleaning.md
└── Larger than RAM?
    ├── Chunked reads / SQL pushdown — postgresql-pro / sql-data-access-pro
    └── True cluster engine?
        └── Out of core — note boundary; not pandas tutorial depth
```

## Question type

```
Descriptive (counts, trends in sample)?
├── EDA + honest plots — analysis-pipeline-and-grain-model.md
└── Inferential / causal claim?
    ├── State assumptions; often outside pure pandas — decision-framework-and-trade-offs.md
    └── Designed experiment?
        └── Pair domain stats rigor — algorithm-pro / external stats
```

## Grain first

```
Know what one row represents?
├── Yes → proceed to aggregates
└── Unclear?
    └── Stop — clarify with stakeholder before sums — analysis-pipeline-and-grain-model.md
```

## Clean vs explore

```
Dirty ingest?
├── Cleaning checklist before headline metrics — eda-and-cleaning.md
└── Clean export from warehouse?
    └── Still validate dtypes and duplicate keys
```

## Deliverable

```
Notebook for self?
├── Explore freely — quality-validation-and-reproducibility-guardrails.md when sharing
└── Leadership Excel deck?
    └── pandas compute + openpyxl polish — spreadsheets-charts-and-validation.md
```

## Further reading

- [failure-modes-detection-mitigation.md](failure-modes-detection-mitigation.md)
