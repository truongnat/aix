---
name: code-packaging-pro
description: |
  Production-grade code packaging and CI build automation: artifact graph (wheel, sdist, OCI image) from source to registry; reproducible builds, lockfiles vs semver library ranges, pyproject.toml / build backends (hatchling, setuptools), multi-stage Docker and .dockerignore, GitHub Actions job graphs (lint → test → build → publish), trusted publishing OIDC to PyPI/GHCR, supply-chain hooks (SBOM, attestations pointers), failure modes (ABI mismatch, PEP 668, cache drift, fork secrets, publish races), decision trade-offs (library vs app, slim vs fat image), multi-ecosystem notes (npm), boundary with deployment runtime promotion.

  Use when authoring pyproject.toml, Dockerfiles, CI workflows for build/publish, choosing packaging tooling, or reviewing reproducibility and registry safety — not for choosing Kubernetes vs Lambda runtime topology alone.

  Use with deployment-pro, testing-pro, security-pro, ci-cd-pro, docker-pro, javascript-pro as needed.

  Triggers: "pyproject.toml", "Dockerfile", "multi-stage", "GitHub Actions", "workflow yml", "build wheel", "publish PyPI", "trusted publishing", "OIDC PyPI", "GHCR", "ECR", "manylinux", "cibuildwheel", "dockerignore", "hatchling", "setuptools", "uv lock", "poetry export", "pip-tools", "PEP 621", "PEP 668", "sigstore", "SBOM", "npm publish", "package.json files", "digest pin", "reproducible build".

metadata:
  short-description: Packaging — artifacts, registries, Docker/CI, OIDC publish, supply chain hooks
  content-language: en
  domain: packaging
  level: professional
---

# Code packaging (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use **[Python packaging](https://packaging.python.org/)** and **GitHub Actions** official docs for syntax truth; this skill encodes **artifact/registry system behavior**, **build CI graphs**, **supply-chain-aware publish**, and **failure modes** — not only snippet collection. Depth defaults to **Python + Docker + Actions**; see **`multi-ecosystem-packaging-notes.md`** for Node/Rust orientation. Confirm **artifact type** (library vs deployable), **Python range**, **registry**, and **public vs private** index.

## Boundary

**`code-packaging-pro`** owns **how artifacts are produced and pushed** (metadata, locks, Dockerfile structure, workflow jobs for build/publish, OIDC wiring **at CI level**). **`deployment-pro`** owns **where artifacts run**, **traffic**, **rollback**, **environment promotion** beyond registry push. **`security-pro`** owns **threat model** for tokens and attestations policy detail.

## Related skills (this repo)

| Skill | When to combine with `code-packaging-pro` |
|-------|-------------------------------------------|
| **`deployment-pro`** | Promote digest, canary, rollback after artifact exists |
| **`testing-pro`** | CI test gates, flake policy, what to run before build |
| **`security-pro`** | OIDC trust, SBOM/signing gates, fork PR safety |
| **`ci-cd-pro`** | Workflow patterns, concurrency, reusable workflows |
| **`docker-pro`** | Advanced BuildKit, layer optimization |
| **`javascript-pro`** / **`cli-pro`** | npm publish, `bin` entry when shipping CLI |
| **`nestjs-pro`** / **`nextjs-pro`** | Framework-specific container or output |

## When to use

- **`pyproject.toml`**, build backend, **`requires-python`**, optional deps.
- **Dockerfile** multi-stage, non-root, `.dockerignore`.
- **GitHub Actions**: matrices, cache keys, build vs release jobs, **trusted publishing**.
- **Supply chain**: provenance hooks, SBOM step placement — **`supply-chain-and-provenance-hooks.md`**.

## When not to use

- **Cluster topology / SRE rollout** only — **`deployment-pro`** first for “where it runs.”

## Required inputs

- **Library** vs **application** image; **single package** vs **monorepo** hint.

## Expected output

Follow **Suggested response format** strictly — artifact system through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** artifact type, Python range, registry, trust model → verify: [context documented].
2. **State assumptions** about packaging needs, deployment target (**Think Before Coding**).
3. **Apply** minimum packaging first; add complexity only when justified (**Simplicity First**).
4. **Make surgical changes** — only modify packaging config directly related to the request (**Surgical Changes**).
5. **Define success criteria** (build reproducibility, image size, CI time); loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; delegate runtime promotion to **`deployment-pro`**.

### Operating principles

1. **Think Before Coding** — State assumptions: artifact type, target registry, deployment needs. Ask when uncertain.
2. **Simplicity First** — Start with basic packaging; add multi-stage/optimization only when justified.
3. **Surgical Changes** — Only touch packaging config related to the request. Don't refactor unrelated build steps.
4. **Goal-Driven Execution** — Define build reproducibility, image size, CI time targets upfront.
5. **Reproducible builds** — Lock apps; test matrix for libs — **`decision-framework-and-tradeoffs.md`**.
6. **Smallest runnable image** — Multi-stage, slim runtime, no compilers in final stage — **`python-packaging-and-containers.md`**.
7. **CI clarity** — Lint → test → build → publish; fail fast — **`github-actions-and-ci.md`**.
8. **Secrets** — OIDC over PAT; no secrets in image layers — **`failure-modes-detection-mitigation.md`**.
9. **Dockerignore** — Same class of importance as `.gitignore` for context and leaks — **`anti-patterns.md`**.
10. **Immutable references** — Image **digest** for serious deploys; library **version** as public API — **`artifact-build-and-registry-model.md`**.

### Artifact build and registry model (summary)

Source → CI gates → artifact → registry; handoff to **`deployment-pro`** — **`artifact-build-and-registry-model.md`**.

Details: [references/artifact-build-and-registry-model.md](/skills/code-packaging-pro/references/artifact-build-and-registry-model.md)

### Failure modes — detection and mitigation (summary)

ABI drift, PEP 668, publish/OIDC failures, cache keys — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](/skills/code-packaging-pro/references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Library vs app, backends, OIDC vs token, image slim vs debug — **`decision-framework-and-tradeoffs.md`**.

Details: [references/decision-framework-and-tradeoffs.md](/skills/code-packaging-pro/references/decision-framework-and-tradeoffs.md)

### Supply chain and provenance hooks (summary)

Trusted publishing, SBOM/sign steps — **`supply-chain-and-provenance-hooks.md`**.

Details: [references/supply-chain-and-provenance-hooks.md](/skills/code-packaging-pro/references/supply-chain-and-provenance-hooks.md)

### Multi-ecosystem packaging notes (summary)

npm / other ecosystems — same artifact discipline — **`multi-ecosystem-packaging-notes.md`**.

Details: [references/multi-ecosystem-packaging-notes.md](/skills/code-packaging-pro/references/multi-ecosystem-packaging-notes.md)

### Quality validation and guardrails (summary)

PEP 621 honesty; no secrets in Dockerfile — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](/skills/code-packaging-pro/references/quality-validation-and-guardrails.md)

### Python packaging and containers (summary)

`pyproject`, Docker boundaries — **`python-packaging-and-containers.md`**.

Details: [references/python-packaging-and-containers.md](/skills/code-packaging-pro/references/python-packaging-and-containers.md)

### GitHub Actions and CI (summary)

Matrices, caching, publish jobs — **`github-actions-and-ci.md`**.

Details: [references/github-actions-and-ci.md](/skills/code-packaging-pro/references/github-actions-and-ci.md)

### Tips and tricks (summary)

Locks, semver, slim images — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](/skills/code-packaging-pro/references/tips-and-tricks.md)

### Edge cases (summary)

Monorepo, manylinux, PEP 668, platforms — **`edge-cases.md`**.

Details: [references/edge-cases.md](/skills/code-packaging-pro/references/edge-cases.md)

### Decision trees (summary)

Artifact type, publish path, backend choice — **`decision-tree.md`**.

Details: [references/decision-tree.md](/skills/code-packaging-pro/references/decision-tree.md)

### Anti-patterns (summary)

Secrets in layers, fat images, unpinned actions — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](/skills/code-packaging-pro/references/anti-patterns.md)

### Integration map (summary)

**`deployment-pro`**, **`security-pro`**, **`ci-cd-pro`**, **`docker-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](/skills/code-packaging-pro/references/integration-map.md)

### Versions (summary)

Python matrix, digests, Actions majors — **`versions.md`**.

Details: [references/versions.md](/skills/code-packaging-pro/references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Repo type (lib vs service), Python range, registry target, fork/OSS exposure.
2. **Problem** — Goal (ship wheel, fix CI, harden Docker) and constraints (air gap, private index).
3. **System design / architecture** — Artifact types; build graph (lint → test → build → publish); registry handoff — cite **`artifact-build-and-registry-model.md`** when non-trivial.
4. **Decision reasoning** — Build backend / lock strategy; OIDC vs token; image slim strategy — **`decision-framework-and-tradeoffs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — `pyproject` / Dockerfile / workflow **outline**; placeholders for org/registry; pin policy for Actions — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Reproducibility vs velocity; matrix cost; debug image vs attack surface.
7. **Failure modes** — ABI, PEP 668, cache, fork workflow, publish race — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Promotion/rollback (**`deployment-pro`**), deep security (**`security-pro`**), secret scanning gaps.

## Resources in this skill

| Topic | File |
|-------|------|
| Artifact & registry model | [references/artifact-build-and-registry-model.md](/skills/code-packaging-pro/references/artifact-build-and-registry-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](/skills/code-packaging-pro/references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-tradeoffs.md](/skills/code-packaging-pro/references/decision-framework-and-tradeoffs.md) |
| Supply chain & provenance | [references/supply-chain-and-provenance-hooks.md](/skills/code-packaging-pro/references/supply-chain-and-provenance-hooks.md) |
| Multi-ecosystem notes | [references/multi-ecosystem-packaging-notes.md](/skills/code-packaging-pro/references/multi-ecosystem-packaging-notes.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](/skills/code-packaging-pro/references/quality-validation-and-guardrails.md) |
| Python & Docker | [references/python-packaging-and-containers.md](/skills/code-packaging-pro/references/python-packaging-and-containers.md) |
| GitHub Actions & CI | [references/github-actions-and-ci.md](/skills/code-packaging-pro/references/github-actions-and-ci.md) |
| Tips | [references/tips-and-tricks.md](/skills/code-packaging-pro/references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](/skills/code-packaging-pro/references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](/skills/code-packaging-pro/references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](/skills/code-packaging-pro/references/anti-patterns.md) |
| Integration map | [references/integration-map.md](/skills/code-packaging-pro/references/integration-map.md) |
| Versions | [references/versions.md](/skills/code-packaging-pro/references/versions.md) |

## Quick example

**Input:** Multi-stage Dockerfile for FastAPI, non-root.  
**Expected output:** Full **Suggested response format** — stages, `.dockerignore`, USER; **`deployment-pro`** for orchestration; failure **secret-in-layer**.

**Input:** Bake `DATABASE_URL` into image.  
**Expected output:** **Reject**; runtime env; **`security-pro`**; promote **same digest** story.

**Input:** PyPI OIDC from GHA.  
**Expected output:** Trusted publishing skeleton; fork safety; **`security-pro`** trust alignment.

## Checklist before calling the skill done

### Artifact & CI

- [ ] **Artifact** type (lib wheel vs image) clear; **`requires-python`** matches matrix.
- [ ] **Workflow** order lint → test → build; release triggers safe for secrets.

### Safety

- [ ] **No secrets** baked into Dockerfile or logged; **OIDC** preferred for publish — **`supply-chain-and-provenance-hooks.md`**.
- [ ] **`.dockerignore`** / multi-stage explicitly considered for images — **`anti-patterns.md`**.

### Boundaries

- [ ] **Runtime rollout** delegated when beyond build/push — **`deployment-pro`**.
- [ ] **Failure modes** addressed — not only happy path — **`failure-modes-detection-mitigation.md`**.
- [ ] **Supply chain**: pinning policy for Actions stated when relevant — **`versions.md`**.
