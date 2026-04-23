# Decision framework and trade-offs

## Tooling matrix

| Situation | Default bias |
|-----------|---------------|
| **Single-machine EDA** | pandas (skill default); consider Polars if huge + local |
| **Heavy aggregates in DB** | Push down SQL — **`postgresql-pro`** / **`sql-data-access-pro`** |
| **Notebook exploration** | Fast iteration; freeze to `.py` / pipeline when repeating — **`repo-tooling-pro`** |
| **Stakeholder Excel** | pandas logic → openpyxl presentation — **`spreadsheets-charts-and-validation.md`** |

## Claim type

| Claim | Requirement |
|-------|-------------|
| **Descriptive** (“mean revenue Q3”) | Clear grain + filters |
| **Comparative** (“A vs B”) | Same metric definition both sides |
| **Causal** (“X caused Y”) | Usually **out of scope** without experiment design — flag handoff |

## Depth vs speed

| Mode | When |
|------|------|
| **Minimal path** | Answer one question with one chart + caveats |
| **Full EDA** | Greenfield dataset; document for team |

## Reproducibility vs convenience

- **Interactive** OK for discovery; **published** numbers need pinned env — **`quality-validation-and-reproducibility-guardrails.md`**.
