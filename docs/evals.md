# Evals

The eval subsystem provides benchmark-style comparisons between:

- `with-harness`
- `without-harness`

Primary commands:

```bash
aih eval list
aih eval run sample-bugfix --provider codex --yes
aih eval report <run-id>
```

## First milestone

The first milestone is deterministic and local-only. It uses fixtures, rule-based scoring, and artifact reports to prove harness behavior changes in a repeatable way.

### Task registry

Task manifests live in `evals/registry/<suite>/*.json`. Each manifest defines:

- fixture path under `evals/fixtures/`
- success checks (outcome)
- behavior checks (discipline)
- scoring rubric under `evals/rubrics/`

### Reports

Each run writes artifacts under `artifacts/runs/<run-id>/`:

- `summary.json` — A/B score comparison
- `<mode>/report.md` — human-readable mode report
- `<mode>/metrics.json` — structured check results

### Sample tasks

| Task | Mode | Purpose |
| --- | --- | --- |
| `sample-bugfix` | bugfix | Fix a broken helper; with-harness passes tests |
| `example-health-report` | workflow-discipline | Generate a health report artifact |

See [evals/README.md](../evals/README.md) for contributor reference.
