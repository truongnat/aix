# aix — Findings Remediation and Verification

Date: 2026-11-05 · Baseline: `main`, `26381fc6` · Scope: F-01–F-06 and accompanying validation/documentation/deployment gaps · Author: coding assistant with implementation workers and independent reviewers.

## Decision

**PASS — all six reported findings remediated, regression-tested and independently reviewed.** Full build, lint and **95 tests** pass with no skipped tests. Real local CLI and Node 22/Alpine container scenarios passed. The user explicitly approved removal of unsupported shipping behavior, dependency installation, commit and normal push to the current upstream.

This is not a real-model quality assessment or a production deployment. No paid model calls or production data changes occurred. The historical overview report remains a dated baseline; this report records remediation evidence.

## Finding disposition

| ID | Status | Change | Verification |
|---|---|---|---|
| F-01: raw sensitive persistence | PASS | Sanitize content before session/checkpoint/Markdown/SQLite writes. Reject secret-bearing generated code instead of silently changing it. Preserve accepted resource IDs/operational paths with typed sanitation; reject secret-bearing identities/paths. | Policy, engine/checkpoint, Markdown and real HTTP SQLite/WAL tests; raw synthetic tokens absent; email/IP-shaped operational references round-trip and CLI verification succeeds twice. |
| F-02: missing KB credentials | PASS | Optional adapter credentials reach all memory operations; CLI callers use configured/private credentials. HTTP 401/403 raises a nonzero authorization failure rather than degrading to local storage. | Adapter credential/401/403 regressions, actual CLI list/search, real-service authenticated read/write. Network-outage fallback remains covered. |
| F-03: public shutdown | PASS | Master-only management authorization; memory keys cannot terminate service. Loopback default, host-loopback Compose publish, random private local management credential, owned-only automatic cleanup. | Anonymous/API-key/wrong-master shutdown denied; valid admin shutdown exits isolated service; existing shared service is not stopped by automatic cleanup; actual container denies anonymous shutdown. |
| F-04: implicit approval | PASS | Invalid, partial, nonnumeric, blank and closed terminal input rejects; no default approval. Browser choice settles and closes pending terminal input. | Real subprocess input partitions, selection/note EOF, explicit valid option, actual preview endpoint selection; all pass. |
| F-05: heuristic correctness/completion | PASS | Scores are explicitly text-only and no longer terminate pending generation. Remove global three-task cap; runtime-discovered plans finish subject to budget/approval. Generated artifacts report verification NOT RUN. | Real graph handles four preplanned and twelve runtime-planned tasks; incorrect addition fails explicit executable verification; actual mock-output syntax failure is recorded as a failed check rather than hidden. |
| F-06: verify/ship false success | PASS | `verify <session> --command <command>` loads persisted output, runs only a user-supplied command in generated/, records actual result/output/file hashes and invalidates old evidence before preflight. Remove unsupported ship command/phase/fabricated release claims. | Actual CLI checks pass/fail, failed recheck, missing/mutated output, incomplete tasks; successful CLI artifact consumed by core phase guard advances to remember; removed ship command rejects. |

## Supporting gaps closed

- Registry retains malformed YAML, invalid frontmatter and duplicate-ID diagnostics; CLI validation fails nonzero and accepts an explicit content root. First valid duplicate is retained deterministically.
- Canonical skill ownership and the current inventory are documented. Root skill files are legacy mirrors, not additional canonical entries. Current validation loads 158 canonical skills.
- Architecture/getting-started/CLI/environment docs now describe SQLite/FTS5, real route names, actual command options, generation versus verification, and no shipping subsystem. Older historical release/review narratives were not rewritten as current evidence.
- Docker builds from the workspace root, builds/deploys the policy workspace dependency, runs the service as non-root, stores SQLite data separately and removes obsolete database/search/cache containers.
- Session hooks describe a startup attempt, not successful KB readiness, and do not demand automatic shutdown of reused/shared services.
- Existing engine smoke assertions that merely checked score type/nonempty files/spend growth were removed; behavior-focused generation and persistence regressions replace them.

## Implementation contracts and entry points

| Area | Primary files |
|---|---|
| Content redaction | `packages/policy/src/redact.ts`, `packages/policy/src/index.ts` |
| Typed engine persistence | `packages/engine/src/persistence-redaction.ts`, `packages/engine/src/session-store.ts`, `packages/engine/src/file-checkpointer.ts`, `packages/engine/src/nodes/coder.ts`, `packages/engine/src/nodes/discuss.ts`, `packages/engine/src/nodes/plan.ts` |
| Generation semantics | `packages/engine/src/graph.ts`, `packages/engine/src/state.ts`, `packages/cli/src/commands/run.ts` |
| Explicit verification | `packages/cli/src/commands/verify.ts`, `packages/cli/src/index.ts`, `packages/core/src/constants.ts`, `packages/core/src/phase-machine.ts`, `packages/core/src/guards.ts` |
| KB auth/lifecycle | `packages/memory/src/kb-store.ts`, `packages/cli/src/kb-server-manager.ts`, `packages/cli/src/commands/kb.ts`, `services/kb-server/src/auth/master.guard.ts`, `services/kb-server/src/app.controller.ts`, `services/kb-server/src/main.ts` |
| Local/remote memory | `packages/memory/src/markdown-store.ts`, `packages/memory/src/redacted-store.ts`, `services/kb-server/src/kb/kb.service.ts` |
| Approval/registry | `packages/hitl/src/channel.ts`, `packages/registry/src/registry.ts`, `packages/cli/src/commands/skills.ts` |
| Deployment | `services/kb-server/Dockerfile`, `services/kb-server/docker-compose.yml`, `services/kb-server/.env.example`, `.dockerignore`, `pnpm-lock.yaml` |

The verification command is trusted user-supplied shell execution with the user's permissions. `generated/` is its working directory, not an OS isolation boundary. A zero exit code records that command's success; users must choose commands that genuinely check acceptance criteria. Before/after hashes bind the recorded result to unchanged tracked generated files. Generation's `done` means generated, not functionally verified.

## Test-first and independent-review evidence

Regression tests were written before production edits and run centrally against the baseline artifacts. Initial observed RED results included persistence secret leaks (10 failures), approval/validation failures (18 failed plus a hanging browser case), unknown verification command contract and incomplete graph generation, and actual service anonymous shutdown returning 201 instead of expected 403. Subsequent focused RED cases reproduced stale PASS after missing output and the CLI/core artifact-evidence mismatch.

Independent review identified two correction-introduced defects before commit:

1. Whole-record redaction collapsed distinct PII-shaped IDs into one primary key. Real HTTP and Markdown regressions reproduced the issue. Accepted IDs are now preserved; recognized secret IDs return 400 before persistence.
2. Whole-state redaction rewrote operational paths, breaking resume/verification from email/IP-shaped directories. State/checkpoint/pending-write and actual CLI regressions reproduced the issue. Typed engine channel sanitation now distinguishes operational references from prose.

A separate reviewer found successful CLI evidence used `eval` where the core guard required `artifact`. The actual CLI-to-core integration reproduced `GUARD_VERIFY_MISSING`. Success now writes the artifact before committing compatible artifact evidence; failures retain non-passing evidence. Both review scopes accepted the corrections. Full source/test reports are retained in `.aix/sessions/2026-11-05-remediate-findings/`.

## Executed verification

Environment: Linux x64; Node 24.21.0 and pnpm 9.15.0 on host; final service image uses Node 22 Alpine with the non-root `node` user. All test model responses are mock/local fixtures, never paid API calls.

| Command / scenario | Result | Evidence |
|---|---|---|
| `pnpm install --frozen-lockfile --ignore-scripts` | PASS | Locked dependencies installed with lifecycle scripts disabled; new policy workspace link installed with same flags. No lifecycle-script approval was needed for builds. |
| `pnpm build` | PASS | 15/15 tasks; docs render build included. A pre-existing Turbo output-cache warning for VitePress's non-dist/ output remains nonfatal. |
| `pnpm lint` | PASS | 27/27 tasks. Initial exactOptionalPropertyTypes errors were corrected; final typecheck passes without suppression. |
| `pnpm test` | PASS | 95 tests, zero failures/cancellations/skips; 25/25 Turbo tasks. |
| `pnpm run doctor` | PASS | Node/pnpm available, optional KB/config absent, content readable; not substituted for tests. |
| Real CLI temporary project | PASS | Actual `run --auto` starts/stops owned KB and reports verification NOT RUN. A known-good disposable identity fixture is explicitly substituted for labeled mock output to exercise successful verification; actual user check runs, file hash recorded, exit-7 recheck replaces success, ship rejects. |
| Mock generated-code rejection | PASS negative observation | Initial actual CLI check rejected syntactically invalid mock output. This is retained as evidence of fail-closed verification, not a claim the mock generated correct code. |
| Canonical skills + both SessionStart hooks | PASS | Validation loads canonical content; both emitted JSON formats parse and avoid a false readiness guarantee. Hook smoke used temporary plugin roots without a built CLI to avoid background side effects. |
| `docker build --tag localhost/aix-findings-smoke-c5133f12:latest --file services/kb-server/Dockerfile .` | PASS | Actual final image `486e71354afe0a99fa2b2c7b02999df138fe68d1580c5e8cd01a6a59854f26c1`; workspace dependency deploy succeeds. |
| Final image temporary container HTTP | PASS | SQLite/cache healthy; anonymous memory/shutdown 403; authenticated persistence redacts body; two email-shaped IDs remain distinct; secret ID 400 leaves data unchanged. Owned container and anonymous volume removed. |
| `docker compose -f services/kb-server/docker-compose.yml config` with synthetic credential environment | PASS | Local Docker command is Podman 5.7 / podman-compose 1.5.0. Initial --project-directory invocation unsupported; explicit -f invocation passes. Expanded credentials not stored in evidence. |

### Full-suite distribution

| Workspace | Tests |
|---|---:|
| CLI | 23 |
| Core | 1 |
| Engine | 20 |
| HITL | 14 |
| Memory | 17 |
| Policy | 2 |
| Providers | 5 |
| Registry | 6 |
| KB service | 6 |
| Todo demo | 1 |

## Evidence artifacts

Exact commands/output and reproduction fixtures are retained outside tracked source:

- [Final build log](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-build-final.log)
- [Final lint log](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-lint-final.log)
- [Final full-suite log](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-test-final.log)
- [KB authorization RED](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-kb-red.log)
- [Operational identity/path RED](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-paths-red.log)
- [Actual CLI workflow smoke](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-runtime-smoke.json)
- [Mock verification rejection](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-mock-verification-rejection.json)
- [Final container HTTP smoke](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-container-final.json)
- [Compose configuration check](/home/vietis/.agents/outputs/aix/testresults/2026-11-05-remediation-compose-config.log)

These are local evidence links, not published CI artifacts. Temporary runtime fixture workspaces, servers and container volumes were cleaned up. The local build image/cache is not committed or pushed as a software release.

## Limits and intentional interface changes

- `ship` is removed rather than presented as a fake release action. Core phases no longer contain automatic shipment. This is an explicitly approved interface change; callers must use their real deployment workflow.
- No real host-product installation/UI validation, real-model semantic quality check, load benchmark, dependency-vulnerability audit or production deployment occurred.
- Redaction is pattern-based; accepted operational identifiers/paths can contain PII by design to preserve identity. They reject recognized secrets rather than silently changing addresses or resource keys. Avoid using sensitive material as identifiers or prompts.
- HTTP service read/write/auth and final container behavior were exercised. Full Compose orchestration with a persistent named volume was not launched; image build, isolated container behavior and Compose configuration were checked separately.
- Existing canonical skill body-size warnings remain warnings; no unrelated skill content was shortened to hide them.

## Delivery checklist

| Approved item | Disposition |
|---|---|
| F-01 through F-06 | PASS, changes and evidence above |
| Supporting registry/docs/hook/deployment gaps | PASS |
| Safe dependency setup and full verification | PASS |
| Independent-review regressions | PASS, reproduced then corrected and accepted |
| Changelog and verification report | PASS |
| Commit and normal push | Parent performs after report readback; final commit/push result is reported in chat and local session evidence, not fabricated here |
