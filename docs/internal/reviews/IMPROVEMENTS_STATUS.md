# IMPROVEMENTS_EVALUATION_VI — Completion Status

> Tracker for `IMPROVEMENTS_EVALUATION_VI.md` (2026-06-05). Updated after P1 pass.

## Summary

| Trục | Before | After | Notes |
| --- | :---: | :---: | --- |
| A Evals | 1/5 | **4.5/5** | 20 golden tasks, extended A/B metrics, live LLM judge hook; 30-task corpus deferred |
| B Telemetry | 2/5 | **4.5/5** | `--upload`, `--recommend-evals`, telemetry hints in eval summary |
| C Architecture | 3/5 | **4/5** | Provider manifests + catalog split (`lib/catalog/`) |
| D CI/CD | 3/5 | **4.5/5** | Coverage, dependabot, changesets, smoke install, branch protection active |
| E Docs | 2/5 | **4/5** | 3-tier layout, ADRs, Diátaxis index, v0 archive |
| F Adoption | 2/5 | **4/5** | `aih init` runs demo eval; matrix lists 20 tasks |
| G DX | 3/5 | **4/5** | Husky, CONTRIBUTING DoD, coverage gate; full TS migrate deferred |

## P1 ✅ (completed)

- [x] Eval corpus expanded to **20** tasks (`scripts/seed-p1-eval-corpus.js`)
- [x] LLM-as-judge via `EVAL_JUDGE_ENDPOINT` with deterministic fallback
- [x] Extended eval metrics: efficiency, phase discipline, self-correction delta
- [x] Remote telemetry upload (`aih insights --upload`)
- [x] Telemetry → eval loop (`--recommend-evals`, hints in `eval list` / run summary)
- [x] Compatibility matrix regenerated (20 tasks)
- [x] `aih init` auto-runs `sample-bugfix` demo eval (`--skip-demo-eval` to opt out)

## P3 — deferred

- [ ] Migrate `lib/` to TypeScript
- [ ] Expand to 30 golden eval tasks
- [ ] Hosted LLM judge service (endpoint contract only; no bundled server)
- [ ] Rules engine vs rules content split

## Commands added

```bash
aih eval list|run|report
aih insights [--json] [--export] [--upload] [--recommend-evals]
aih init [--provider <id>] [--yes] [--skip-demo-eval]
node scripts/seed-p1-eval-corpus.js
node scripts/generate-compatibility-matrix.js
```

## Eval tasks (sample-suite) — 20 total

Bugfix: `sample-bugfix`, `sample-string-trim`, `sample-config-patch`, `sample-divide`, `sample-max`, `sample-min`, `sample-abs`, `sample-clamp`, `sample-is-even`, `sample-reverse-string`, `sample-sum-array`, `sample-unique-count`, `sample-default-value`

Workflow: `example-health-report`, `sample-response-contract`, `sample-plan-md`, `sample-verify-md`, `sample-ship-md`, `sample-context-md`, `sample-blockers-md`
