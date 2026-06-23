# Data & AI Pack

## Purpose

Route data engineering, ML, retrieval, and LLM workflow work toward the most relevant core skills, commands, and checks.

## When To Use

- data pipelines, notebooks, datasets, embeddings, or model evaluation
- retrieval, prompting, tool-use chains, or LLM application behavior
- reproducibility-sensitive transformation or inference work

## Recommended Core Skills

- `mapping-codebase`
- `writing-plans`
- `executing-plans`
- `verification`
- `test-driven-development`

## Recommended Commands

- `harness-map`
- `harness-discuss`
- `harness-plan`
- `harness-run`
- `harness-verify`

## Key Checks

- reproducible data inputs
- deterministic fixtures where possible
- explicit evaluation criteria
- model or retrieval regression checks

## Common Failure Modes

| Failure | Symptom | Detection |
| --- | --- | --- |
| Non-reproducible notebook | result cannot be rerun or reviewed | run from clean inputs or scripted execution |
| Evaluation gap | output looks plausible but quality is unmeasured | explicit metric, rubric, or benchmark |
| Data leakage | test or validation data influences training or prompting | review splits, joins, and sample sources |
| Hidden drift | pipeline passes once but degrades later | replay the same fixture or baseline input |

## Verification Expectations

- reproducible script or notebook execution
- fixture-based tests when practical
- explicit model or retrieval evaluation when the repo supports it

## Verification Strategy

- Start from the dataset or model boundary and verify the exact transformation path.
- Prefer scripts and saved fixtures over ad hoc notebook inspection.
- Record seeds, sample data, and evaluation notes when behavior is stochastic.
- Check both the happy path and a negative or degraded input when possible.

## Anti-Rationalization

| Shortcut agents take | Counter |
| --- | --- |
| "The notebook ran once, so it is fine" | Rerun from a clean environment and keep the input fixture visible. |
| "The output looks good" | Good-looking output is not an evaluation; record the metric or rubric. |
| "The model is deterministic enough" | Even stable outputs can drift with dependency or prompt changes; pin and test the boundary. |

## When Not To Use

- UI-only tasks
- generic backend CRUD with no data or AI component
- documentation-only work

## Notes

Use this pack when the repository's stack signals point to data, ML, or LLM workflows.
