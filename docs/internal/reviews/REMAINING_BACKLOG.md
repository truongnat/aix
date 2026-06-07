# Remaining Backlog — Review Follow-up

> Consolidated outstanding items from `REVIEW_REPORT_VI.md`, `IMPROVEMENTS_EVALUATION_VI.md`, and `IMPROVEMENTS_STATUS.md`.
> Last updated: 2026-06-07 (after shipping the live compatibility matrix update).

## Done (no action)

- 🔴 Critical 1.1–1.4 and 🟠 High 2.1–2.5 (`REVIEW_REPORT_VI`)
- P0 eval harness, P1 telemetry/eval/adoption items (`IMPROVEMENTS_EVALUATION_VI`)
- Catalog split, provider manifests, Husky, coverage gate, changesets, `aih init`, insights, 30-task eval corpus
- Product walkthrough video removed; `AI_Engineering_Harness.mp4` purged from git history
- `main` synced with local (force-push completed when branch protection allowed)
- `ARCH-4` completed: top brittle markdown suites now validate repo behavior through `validateRepository`
- `POL-1` completed: obsolete `bin/cli-ui.js` shim removed; CLI UI source of truth is `lib/cli-ui.js`
- `PROD-1` completed: eval corpus expanded to 30 tasks and compatibility matrix regenerated
- `ARCH-2` completed: dist-first TypeScript migration shipped and verified on build, typecheck, test, and validate
- `DOC-2` completed: release-facing markdown syncs from `package.json`; site version surfaces use injected build-time version
- `ARCH-5` completed: versioning, breaking-change policy, command guardrails, and `v1.0.1` release notes now reflect the current `v1.x` stability posture
- `PROD-3` completed: live provider evals are now available through `--live-provider-command` / `EVAL_PROVIDER_COMMAND`, with live transcripts and evidence tagging
- `PROD-4` completed: telemetry upload endpoint is now backed by a minimal ingest server (`POST /api/telemetry`) and local NDJSON storage
- `PROD-5` completed: telemetry recommendations can now auto-run eval regressions and write a regression report
- `PROD-6` completed: compatibility matrix now annotates live eval pass rates when live runs exist
- `POL-3` completed: `demo-video/` history purged from reachable refs; no demo-video objects remain in the current ref graph
- `POL-2` no longer reproduces in the current environment: npm resolves `always-auth` as `undefined`, with no repo/user `.npmrc` and no warning emitted by current npm commands
- `DOC-3` completed: `CORE_BREAKTHROUGH_VI.md` is treated as internal strategy input, moved under `docs/internal/reviews/`, and referenced from the roadmap as a non-committed long-term direction
- `DOC-1` completed: internal install/runtime research and design notes archived under `docs/internal/archive/`; canonical user-facing install docs now separate command model, remote wrapper usage, per-runtime payloads, and walkthrough/output examples
- `ARCH-1` completed: provider rule content now lives under `rules/` templates/fragments, including Claude command rules via `rules/providers/claude/command.md`; `lib/provider-rule-renderer.js` composes content instead of hard-coding command rule markdown

---

## P0 — Infra / ops (ưu tiên cao nhất)

| ID | Item | Source | Action |
| --- | --- | --- | --- |
| OPS-1 | **`NPM_TOKEN` GitHub secret** for automated npm publish | D / release.yml | Add repo secret; verify changesets release workflow |
| OPS-2 | **Confirm CI green on `main`** after latest push | D | Check Actions → all `validate-and-test` matrix jobs |
| OPS-3 | **Branch protection hygiene** | D | Keep required checks; ensure *Allow force pushes* is **off** after history rewrite |
| OPS-4 | **Notify collaborators** to `git fetch && git reset --hard origin/main` if they cloned pre-rewrite history | Ops | One-time comms |

---

## P1 — Product / moat (mở rộng sau batch vừa ship)

| ID | Item | Source | Notes |
| --- | --- | --- | --- |
| PROD-2 | **Hosted LLM judge service** | A / P3 | Client hook + `EVAL_JUDGE_ENDPOINT` contract shipped; no bundled judge server |

---

---

## Scorecard (trục IMPROVEMENTS)

| Trục | Score | Gap to target 5/5 |
| --- | :---: | --- |
| A Evals | 4.8/5 | Hosted judge, live provider eval command |
| B Telemetry | 4.8/5 | Live upload backend, telemetry-triggered eval regressions |
| C Architecture | 4.8/5 | Remaining local gap is the broader JS→TS conversion; root shims removed |
| D CI/CD | 4.5/5 | NPM_TOKEN, optional nightly eval job |
| E Docs | 4.6/5 | Broader archive and user-doc boundary are in place; optional further pruning remains |
| F Adoption | 4/5 | Live matrix, case studies |
| G DX | 4/5 | Behavior tests, TypeScript |

---

## Suggested next sprint (ordered)

1. OPS-1 + OPS-2 (secrets + CI verify)

---

## Reference commands

```bash
npm test
npm run test:coverage
npm run format:check
node scripts/seed-p1-eval-corpus.js
node scripts/generate-compatibility-matrix.js
aih eval list
aih insights --recommend-evals
```
