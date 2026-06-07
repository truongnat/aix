# IMPROVEMENTS_EVALUATION_VI — Completion Status

> Tracker for `IMPROVEMENTS_EVALUATION_VI.md` (2026-06-05). Updated after `ARCH-2` shipped.

## Summary

| Trục | Before | After | Notes |
| --- | :---: | :---: | --- |
| A Evals | 1/5 | **4.8/5** | 30 golden tasks, extended A/B metrics, live LLM judge hook, live provider command path; hosted judge service deferred |
| B Telemetry | 2/5 | **4.8/5** | `--upload`, `--recommend-evals`, telemetry hints in eval summary, ingest backend, auto regression |
| C Architecture | 3/5 | **4.8/5** | Provider manifests + catalog split (`lib/catalog/`) + provider rule content split under `rules/` + dist-first runtime source-of-truth migration + root-shim removal |
| D CI/CD | 3/5 | **4.5/5** | Coverage, dependabot, changesets, smoke install, branch protection active |
| E Docs | 2/5 | **4/5** | 3-tier layout, ADRs, Diátaxis index, v0 archive |
| F Adoption | 2/5 | **4/5** | `aih init` runs demo eval; matrix lists 30 tasks |
| G DX | 3/5 | **4.1/5** | Husky, CONTRIBUTING DoD, coverage gate; dist-first TS gate shipped, full lib/ migration still incremental |

## P1 ✅ (completed)

- [x] Eval corpus expanded to **30** tasks (`scripts/seed-p1-eval-corpus.js`)
- [x] LLM-as-judge via `EVAL_JUDGE_ENDPOINT` with deterministic fallback
- [x] Extended eval metrics: efficiency, phase discipline, self-correction delta
- [x] Live provider command eval path (`--live-provider-command` / `EVAL_PROVIDER_COMMAND`)
- [x] Remote telemetry upload (`aih insights --upload`)
- [x] Minimal telemetry ingest backend (`POST /api/telemetry`)
- [x] Telemetry → eval loop (`--recommend-evals`, hints in `eval list` / run summary)
- [x] Telemetry-triggered eval regression runner (`--run-recommended-evals`)
- [x] Compatibility matrix regenerated with live eval pass-rate annotations (30 tasks)
- [x] `aih init` auto-runs `sample-bugfix` demo eval (`--skip-demo-eval` to opt out)

## P3 — deferred

- [ ] Migrate `lib/` to TypeScript (incremental gate shipped: `npm run typecheck` via `tsconfig.lib.json` for selected `lib/` modules including provider rule rendering, catalog metadata, command rendering, command installation, runtime command catalog wiring, Claude worker adapter surfaces, install runtime flow, install cache flow, legacy install flow, command-surface/file-operation helpers, plugin packaging, and core CLI help/detection/planning helpers; remaining work is the full JS→TS conversion)
- [ ] Hosted LLM judge service (endpoint contract only; no bundled server)

## Commands added

```bash
aih eval list|run|report
aih insights [--json] [--export] [--upload] [--recommend-evals]
aih init [--provider <id>] [--yes] [--skip-demo-eval]
node scripts/seed-p1-eval-corpus.js
node scripts/generate-compatibility-matrix.js
```

## Eval tasks (sample-suite) — 30 total

Bugfix: `sample-bugfix`, `sample-string-trim`, `sample-config-patch`, `sample-divide`, `sample-max`, `sample-min`, `sample-abs`, `sample-clamp`, `sample-is-even`, `sample-reverse-string`, `sample-sum-array`, `sample-unique-count`, `sample-default-value`, `sample-multiply`, `sample-subtract`, `sample-first-item`, `sample-last-item`, `sample-uppercase`

Workflow: `example-health-report`, `sample-response-contract`, `sample-plan-md`, `sample-verify-md`, `sample-ship-md`, `sample-context-md`, `sample-blockers-md`, `sample-discussion-md`, `sample-review-md`, `sample-remember-md`, `sample-report-md`, `sample-pr-message-md`
