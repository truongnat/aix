---
name: ci-cd-pro
description: |
  Production-grade CI/CD system design: pipeline control plane vs runner execution, trigger-to-deploy data flow, immutable artifact and digest promotion, GitHub Actions and GitLab CI/CD patterns, secrets/OIDC/IAM boundaries, caching and parallelism economics, deployment strategies (blue-green, canary, rolling), merge queue and migration gates, failure-mode detection/mitigation, pipeline observability and governance (cost, audit, approvals), artifact signing/provenance hooks, fork/untrusted PR safety, self-hosted runner risk, and YAML quality guardrails — not syntax tutorials alone.

  Use when designing or reviewing pipelines, workflows, runners, OIDC deploys, release automation, branch protection, merge queues, flake strategy in CI, supply-chain gates, or aligning CI with rollout/rollback beyond the workflow file.

  Use with docker-pro, deployment-pro, testing-pro, security-pro, git-operations-pro, code-packaging-pro, postgresql-pro as needed.

  Triggers: "GitHub Actions", "GitLab CI", "CircleCI", "Jenkins", "pipeline", "workflow", "YAML", ".github/workflows", ".gitlab-ci.yml", "runner", "OIDC", "Workload identity", "artifact", "digest", "provenance", "SBOM", "matrix", "concurrency", "environment protection", "merge queue", "branch protection", "fork PR secrets", "self-hosted runner", "flake", "canary", "blue-green", "rollback", "migration pipeline", "DORA", "immutable tag".

metadata:
  short-description: CI/CD — pipeline architecture, OIDC, strategies, failures, observability, supply chain
  content-language: en
  domain: ci-cd
  level: professional
---

# CI/CD (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [GitHub Actions docs](https://docs.github.com/en/actions) and [GitLab CI/CD docs](https://docs.gitlab.com/ee/ci/) for syntax truth; this skill encodes **system architecture** for pipelines (control plane, ephemeral runners, artifact graph), **security boundaries** (OIDC, forks, pinning), **operational failure modes**, **decision frameworks**, and **governance** — not only YAML snippets. Confirm **CI platform**, **runner model** (hosted vs self-hosted), **deploy target**, and **branching strategy** before prescribing changes.

## Boundary

**`ci-cd-pro`** owns **workflow structure**, **job graph economics**, **secrets/OIDC wiring at pipeline level**, **cache/artifact contracts**, **CI-side gates**, and **failure/reliability patterns**. **`deployment-pro`** owns **runtime rollout** (traffic shift, K8s rollout, DB expand/contract detail) **after** the pipeline hands off an immutable reference; **`security-pro`** owns **threat modeling** for dangerous workflow patterns; **`testing-pro`** owns **test design and flake elimination**.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`docker-pro`** | Container builds, registry push, digest immutability |
| **`deployment-pro`** | Promotion, canary/rollback, migration sequencing with releases |
| **`testing-pro`** | Stage ordering, flakes, coverage/contract gates |
| **`security-pro`** | OIDC trust policies, fork PR policy, SBOM/signing gates |
| **`git-operations-pro`** | Triggers, protected branches, merge queue |
| **`code-packaging-pro`** | Publish packages from pipeline outputs |
| **`postgresql-pro`** | Migration jobs and backwards-compatible rollout |

## When to use

- Designing or reviewing **GitHub Actions** / **GitLab CI** pipelines end-to-end.
- **OIDC** deploy from CI to cloud; environment protection and approvals.
- **Throughput vs safety** trade-offs (matrix, concurrency, caches).
- **Supply chain**: pinned actions, signing/provenance awareness.
- **Incident-style** CI failures: queues, OIDC, rate limits, flaky greens.

## When not to use

- **Pure application code review** with no pipeline angle — other skills first.
- **Kubernetes internals** of rollout — **`deployment-pro`** once image reference exists.

## Required inputs

- Platform (**GitHub** / **GitLab** / other), **event triggers** needed, **trust model** for PRs (internal-only vs OSS forks).

## Expected output

Follow **Suggested response format** strictly — context through residual risks — with explicit **system view** and **failure modes**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** platform, triggers, runner type, environments, **fork** exposure → verify: [context documented].
2. **State assumptions** about deployment needs, security requirements (**Think Before Coding**).
3. **Apply** minimum pipeline first; add complexity only when justified (**Simplicity First**).
4. **Make surgical changes** — only modify CI/CD code directly related to the request (**Surgical Changes**).
5. **Define success criteria** (build time, test coverage, security gates); loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; delegate rollout nuance to **`deployment-pro`** when execution leaves CI.

### Operating principles

1. **Think Before Coding** — State assumptions: platform constraints, security needs, deployment pattern. Ask when uncertain.
2. **Simplicity First** — Start with basic pipeline; add stages only when justified.
3. **Surgical Changes** — Only touch pipeline code related to the request. Don't refactor unrelated workflows.
4. **Goal-Driven Execution** — Define build time, test coverage, security gate criteria upfront.
5. **Fail fast** — lint/type/unit before integration/e2e; shift expensive work behind cheap gates.
6. **Cache with correct keys** — lockfile-hash keys; treat cache as **optimization**, not correctness — **`optimization.md`**.
7. **Least-privilege secrets** — OIDC over long-lived keys; narrow IAM — **`secrets-security.md`**.
8. **Immutable references** — deploy **digest** or pinned version; avoid silent **`latest`** — **`artifact-signing-and-provenance.md`**.
9. **Pipeline as code, reviewed as code** — **`CODEOWNERS`** on workflows where policy requires.
10. **Observable pipelines** — reports on failure; duration and queue metrics — **`pipeline-observability-and-governance.md`**.
11. **Know the distributed system** — queues, concurrency caps, eventual consistency of artifacts — **`pipeline-system-architecture.md`**.

### Pipeline system architecture (summary)

Control plane vs runners; trigger → job graph → artifacts → deploy handoff; scaling and idempotency — **`pipeline-system-architecture.md`**.

Details: [references/pipeline-system-architecture.md](/skills/ci-cd-pro/references/pipeline-system-architecture.md)

### Failure modes — detection and mitigation (summary)

Queue starvation, OIDC misconfig, fork leaks, flaky green, rate limits — structured table — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](/skills/ci-cd-pro/references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Scenario defaults; speed vs safety matrix — **`decision-framework-and-tradeoffs.md`**.

Details: [references/decision-framework-and-tradeoffs.md](/skills/ci-cd-pro/references/decision-framework-and-tradeoffs.md)

### Pipeline observability and governance (summary)

Signals, approvals, cost, audit — **`pipeline-observability-and-governance.md`**.

Details: [references/pipeline-observability-and-governance.md](/skills/ci-cd-pro/references/pipeline-observability-and-governance.md)

### Artifact signing and provenance (summary)

Digest deploy, signing/SBOM hooks — **`artifact-signing-and-provenance.md`**.

Details: [references/artifact-signing-and-provenance.md](/skills/ci-cd-pro/references/artifact-signing-and-provenance.md)

### Quality validation and guardrails (summary)

Anti-hallucination checklist; fork/OIDC foot-guns — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](/skills/ci-cd-pro/references/quality-validation-and-guardrails.md)

### GitLab CI overview (summary)

Stages, includes, runner tags — conceptual map from Actions — **`gitlab-ci-overview.md`**.

Details: [references/gitlab-ci-overview.md](/skills/ci-cd-pro/references/gitlab-ci-overview.md)

### GitHub Actions structure (summary)

Triggers, jobs, steps, outputs, concurrency — **`github-actions.md`**.

Details: [references/github-actions.md](/skills/ci-cd-pro/references/github-actions.md)

### Secrets and security (summary)

OIDC, environments, `GITHUB_TOKEN`, pinning — **`secrets-security.md`**.

Details: [references/secrets-security.md](/skills/ci-cd-pro/references/secrets-security.md)

### Pipeline optimization (summary)

Cache, matrix, reusable workflows, concurrency — **`optimization.md`**.

Details: [references/optimization.md](/skills/ci-cd-pro/references/optimization.md)

### Deployment strategies (summary)

Blue-green, canary, rolling, flags — **`deployment-strategies.md`** (handoff to **`deployment-pro`** for execution).

Details: [references/deployment-strategies.md](/skills/ci-cd-pro/references/deployment-strategies.md)

### Decision trees (summary)

Reusable vs composite, OIDC vs keys, hosted vs self-hosted, path filters, migrations — **`decision-tree.md`**.

Details: [references/decision-tree.md](/skills/ci-cd-pro/references/decision-tree.md)

### Anti-patterns (summary)

Unpinned actions, fork secrets, bad caches — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](/skills/ci-cd-pro/references/anti-patterns.md)

### Tips and tricks (summary)

Fail-fast ordering, artifacts on failure, matrix trimming — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](/skills/ci-cd-pro/references/tips-and-tricks.md)

### Edge cases (summary)

Merge queue, OIDC, self-hosted poison, migrations, miners — **`edge-cases.md`**.

Details: [references/edge-cases.md](/skills/ci-cd-pro/references/edge-cases.md)

### Cross-skill handoffs (summary)

**`docker-pro`**, **`deployment-pro`**, **`testing-pro`**, **`security-pro`**, **`postgresql-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](/skills/ci-cd-pro/references/integration-map.md)

### Versions (summary)

Runner images, pinning, dialect differences — **`versions.md`**.

Details: [references/versions.md](/skills/ci-cd-pro/references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Org/repo type (OSS vs internal), platform (**GitHub**/**GitLab**/…), runner model, environments, **fork/trust** model.
2. **Problem** — Symptom (slow, flaky, insecure, unclear deploy) and **success criteria** (time, reliability, compliance).
3. **System design / architecture** — Trigger → job DAG → artifacts → reference passed to CD; control vs execution; what state is **durable** (artifacts, registry) vs **ephemeral** (runner disk) — cite **`pipeline-system-architecture.md`** when non-trivial.
4. **Decision reasoning** — Chosen pattern (reuse/matrix/OIDC/canary/etc.) vs alternatives; link **`decision-tree.md`** / **`decision-framework-and-tradeoffs.md`**.
5. **Implementation sketch** — YAML or job graph **outline** with **pinned** third-party actions where shown; placeholders for secrets; explicit **assumptions** (e.g. hosted `ubuntu-latest`).
6. **Trade-offs** — Speed vs reproducibility; parallel cost; fork safety vs full CI; cache hit vs strict install — matrix row style acceptable.
7. **Failure modes** — Top 3–5 failures for this design (**failure-modes-detection-mitigation.md** themes): what breaks, detection, mitigation.
8. **Residual risks** — Unknowns (cloud IAM outside repo), governance gaps (missing approval env), delegation to **`deployment-pro`** / **`security-pro`** when execution or threat model dominates.

## Resources in this skill

| Topic | File |
|-------|------|
| Pipeline system architecture | [references/pipeline-system-architecture.md](/skills/ci-cd-pro/references/pipeline-system-architecture.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](/skills/ci-cd-pro/references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-tradeoffs.md](/skills/ci-cd-pro/references/decision-framework-and-tradeoffs.md) |
| Observability & governance | [references/pipeline-observability-and-governance.md](/skills/ci-cd-pro/references/pipeline-observability-and-governance.md) |
| Artifact signing & provenance | [references/artifact-signing-and-provenance.md](/skills/ci-cd-pro/references/artifact-signing-and-provenance.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](/skills/ci-cd-pro/references/quality-validation-and-guardrails.md) |
| GitLab CI overview | [references/gitlab-ci-overview.md](/skills/ci-cd-pro/references/gitlab-ci-overview.md) |
| GitHub Actions structure | [references/github-actions.md](/skills/ci-cd-pro/references/github-actions.md) |
| Secrets and security | [references/secrets-security.md](/skills/ci-cd-pro/references/secrets-security.md) |
| Pipeline optimization | [references/optimization.md](/skills/ci-cd-pro/references/optimization.md) |
| Deployment strategies | [references/deployment-strategies.md](/skills/ci-cd-pro/references/deployment-strategies.md) |
| Decision trees | [references/decision-tree.md](/skills/ci-cd-pro/references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](/skills/ci-cd-pro/references/anti-patterns.md) |
| Integration map | [references/integration-map.md](/skills/ci-cd-pro/references/integration-map.md) |
| Tips | [references/tips-and-tricks.md](/skills/ci-cd-pro/references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](/skills/ci-cd-pro/references/edge-cases.md) |
| Versions | [references/versions.md](/skills/ci-cd-pro/references/versions.md) |

## Quick example

**Input:** 12-minute CI; `npm install` every run.  
**Expected output:** Full **Suggested response format** — cache keying, job split, trade-off of cold vs warm, failure **rate limit/cache miss**, residual **fork** irrelevance.

**Input:** Fork PR needs preview deploy.  
**Expected output:** **Context/Problem** fork trust; **Decision** no prod secrets on fork; **Implementation** trusted workflow pattern or **`workflow_run`** sketch; **Failure modes** secret exfiltration; **`security-pro`**.

## Checklist before calling the skill done

### Pipeline correctness

- [ ] Platform and **trigger semantics** stated (fork vs internal PR).
- [ ] Third-party actions **SHA-pinned** in examples where org policy expects it; never unsafe **`pull_request_target`** without **`security-pro`** review.
- [ ] OIDC: `id-token: write` **and** cloud trust side acknowledged if recommending OIDC deploy.

### Reliability & ops

- [ ] **Concurrency** / cancel stale runs where rapid pushes matter.
- [ ] **Artifacts** or **reports** on failure where triage needs them (`if: always()` pattern when applicable).
- [ ] **Failure modes** section addressed — not only happy path.

### Boundaries

- [ ] Rollback/traffic migration detail delegated to **`deployment-pro`** when out of CI scope.
- [ ] **Quality guardrails** — no invented tenant-specific secret values; placeholders labeled.
