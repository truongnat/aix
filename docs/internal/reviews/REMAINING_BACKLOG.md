# Remaining Backlog — Review Follow-up

> Consolidated outstanding items from `REVIEW_REPORT_VI.md`, `IMPROVEMENTS_EVALUATION_VI.md`, and `IMPROVEMENTS_STATUS.md`.
> Last updated: 2026-06-06 (after adding CLI planning coverage to `ARCH-2` typecheck).

## Done (no action)

- 🔴 Critical 1.1–1.4 and 🟠 High 2.1–2.5 (`REVIEW_REPORT_VI`)
- P0 eval harness, P1 telemetry/eval/adoption items (`IMPROVEMENTS_EVALUATION_VI`)
- Catalog split, provider manifests, Husky, coverage gate, changesets, `aih init`, insights, 30-task eval corpus
- Product walkthrough video removed; `AI_Engineering_Harness.mp4` purged from git history
- `main` synced with local (force-push completed when branch protection allowed)
- `ARCH-4` completed: top brittle markdown suites now validate repo behavior through `validateRepository`
- `POL-1` completed: obsolete `bin/cli-ui.js` shim removed; CLI UI source of truth is `lib/cli-ui.js`
- `PROD-1` completed: eval corpus expanded to 30 tasks and compatibility matrix regenerated
- `DOC-2` completed: release-facing markdown syncs from `package.json`; site version surfaces use injected build-time version
- `ARCH-5` completed: versioning, breaking-change policy, command guardrails, and `v1.0.1` release notes now reflect the current `v1.x` stability posture
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
| PROD-3 | **Live provider evals** (not only deterministic local mutations) | A | Run real agent + harness on subset of corpus in CI/nightly |
| PROD-4 | **Telemetry upload endpoint** | B | `aih insights --upload` ready; need real `HARNESS_TELEMETRY_ENDPOINT` backend |
| PROD-5 | **Automated telemetry→eval regression** | B | `--recommend-evals` is heuristic; wire into scheduled eval runs / dashboard |
| PROD-6 | **Compatibility matrix from live eval results** | F | Matrix is registry-based; annotate pass rates per provider when live evals exist |

---

## P2 — Architecture & quality

| ID | Item | Source | Notes |
| --- | --- | --- | --- |
| ARCH-2 | **Migrate `lib/` to TypeScript** | C / G / P3 | Partial: `typescript` + `@types/node`, `tsconfig.lib.json`, `npm run typecheck`, and `checkJs` coverage for `lib/provider-registry.js`, `lib/cli-providers.js`, `lib/provider-rule-renderer.js`, `lib/catalog/provider-command-metadata.js`, `lib/catalog/command-rendering.js`, `lib/catalog/command-installation.js`, `lib/runtime-command-catalog.js`, `lib/worker-claude-adapter.js`, `lib/install-runtime.js`, `lib/install-cache.js`, `lib/install-legacy.js`, `lib/file-operations.js`, `lib/command-surface-report.js`, `lib/plugin-packaging.js`, `lib/cli-help.js`, `lib/cli-detect.js`, `lib/cli-plan.js`, and dependency `workers/registry.js`; full `lib/` migration remains open |
| ARCH-3 | **Remove root shims** (`install.js`, `validate.js`, …) | 3.5 | Planned v1.1.0; document deprecation timeline |

## P3 — Docs & polish

| ID | Item | Source | Notes |
| --- | --- | --- | --- |
| POL-3 | **Purge `demo-video/` tree from history** (optional) | Hygiene | Source TS remains in old commits; no MP4 blobs; optional `filter-repo` if folder unwanted |

---

## Scorecard (trục IMPROVEMENTS)

| Trục | Score | Gap to target 5/5 |
| --- | :---: | --- |
| A Evals | 4.7/5 | Live agent evals, hosted judge |
| B Telemetry | 4.5/5 | Real upload backend, automated regression loop |
| C Architecture | 4.5/5 | TypeScript migration remains the main local structural gap |
| D CI/CD | 4.5/5 | NPM_TOKEN, optional nightly eval job |
| E Docs | 4.6/5 | Broader archive and user-doc boundary are in place; optional further pruning remains |
| F Adoption | 4/5 | Live matrix, case studies |
| G DX | 4/5 | Behavior tests, TypeScript |

---

## Suggested next sprint (ordered)

1. OPS-1 + OPS-2 (secrets + CI verify)
2. ARCH-2 (TypeScript migration)
3. PROD-4 (stand up minimal telemetry ingest endpoint)
4. ARCH-3 (root shim deprecation timeline)
5. POL-3 (optional history hygiene for `demo-video/`)

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
