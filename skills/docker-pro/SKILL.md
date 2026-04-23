---
name: docker-pro
description: |
  Production-grade Docker and container development: Dockerfile authoring, multi-stage builds, image optimization, Docker Compose, networking, volumes, secrets, BuildKit, and production hardening — plus system model (build context → layers → image digest → runtime), failure modes (cache bust, secret leak, PID 1, arch/libc mismatch, compose races, OOM), decision trade-offs (Alpine vs slim vs distroless, speed vs reproducibility), quality guardrails (no fabricated registry digests; pin bases deliberately).

  Use this skill when the user works on Docker, Dockerfile, docker-compose, container images, multi-stage builds, .dockerignore, image layers, container networking, volumes, bind mounts, secrets, health checks, Docker Hub, container registries, BuildKit, or containerizing Node/Python/Go/Java applications.

  Combine with **`ci-cd-pro`**, **`deployment-pro`**, **`security-pro`**, **`network-infra-pro`**, **`code-packaging-pro`**, **`testing-pro`** (Testcontainers), **`postgresql-pro`** when databases are containerized.

  Triggers: "Docker", "Dockerfile", "docker-compose", "container", "image", "multi-stage build", "layer", "BuildKit", "COPY", "RUN", "CMD", "ENTRYPOINT", "ARG", "ENV", "volume", "bind mount", "health check", "registry", "docker push", "docker pull", "distroless", ".dockerignore", "compose", "docker network", "bridge network", "overlay".

metadata:
  short-description: Docker — image/runtime model, Dockerfile, Compose, failure modes, hardening
  content-language: en
  domain: containers
  level: professional
---

# Docker (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [Docker docs](https://docs.docker.com/) for exact CLI/API flags; this skill encodes **layer/cache discipline**, **runtime contracts** (signals, health, filesystem), **Compose orchestration patterns**, and **failure modes** — not vendor-docs duplication. Confirm **Docker Engine version**, **target runtime** (Node/Python/Go/etc.), **CPU architecture**, and **deployment target** (local, Kubernetes, serverless containers) when known.

## Boundary

**`docker-pro`** owns **container images**, **Dockerfile/Compose authoring**, **local multi-container workflows**, and **image-level** security/caching practices. **`deployment-pro`** owns **promotion**, **rollout**, and **cluster/serverless** runtime policy. **`ci-cd-pro`** owns **pipeline YAML** wiring for build/push. **`security-pro`** owns **threat modeling**, **supply chain**, and **policy** beyond Dockerfile basics.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`ci-cd-pro`** | Docker builds in CI, cache, matrix, attestations |
| **`code-packaging-pro`** | Wheel/sdist + Dockerfile for Python; artifact layout |
| **`deployment-pro`** | Registry strategies, digest promotion, K8s/Cloud Run |
| **`security-pro`** | Scanning, SBOM, secret mounts, IAM to registry |
| **`network-infra-pro`** | Compose networks, DNS, overlays beyond single host |
| **`testing-pro`** | Testcontainers, service dependencies in integration tests |
| **`postgresql-pro`** | DB containers, persistence, migration sidecars |

## When to use

- Writing or reviewing Dockerfiles for any runtime (Node, Python, Go, Java, …).
- Optimizing image size: multi-stage builds, layer caching, `.dockerignore`, BuildKit.
- Multi-service **Compose** for dev/staging; profiles, health-gated startup.
- Hardening: non-root, read-only root (where applicable), minimal base, health checks.
- Debugging networking, volumes, UID mismatches, multi-arch builds.

## When not to use

- **Kubernetes manifest design** as the primary topic — **`deployment-pro`** (pair **`docker-pro`** when the image is the artifact).
- **Pure cloud IAM / VPC design** — **`network-infra-pro`** / **`security-pro`**.
- **Application packaging without containers** — **`code-packaging-pro`** only.

## Required inputs

- **Base OS/library constraints** (musl vs glibc, libc compatibility).
- **Target architecture** (amd64/arm64) when publishing images.

## Expected output

Follow **Suggested response format** strictly — system design through residual risks.

## Workflow

1. Confirm Engine baseline, runtime, arch, and whether **Compose** or **cluster** is the consumer.
2. Apply summaries; open `references/` for depth; cite official docs for version-specific flags.
3. Respond with **Suggested response format**; include **failure modes** when production-relevant.

### Operating principles

1. **Layer cache is money** — Order from least-to-most frequently changed; lockfiles before source — **`container-image-and-runtime-system-model.md`**.
2. **Multi-stage by default for compiled/managed deps** — Do not ship toolchains/tests to prod — **`dockerfile.md`**.
3. **Non-root in prod** — `USER` after correct ownership — **`quality-validation-and-guardrails.md`**.
4. **Minimal base** — Smallest image that satisfies **native deps** — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **`.dockerignore` mandatory** — Shrinks context; avoids secret/credential leakage paths — **`anti-patterns.md`**.
6. **Immutable promotion** — Tags move; digests don’t — **`deployment-pro`**, **`versions.md`**.

### Container build, image, and runtime (summary)

Build context, layer graph, registry digest, PID/health expectations — **`container-image-and-runtime-system-model.md`**.

Details: [references/container-image-and-runtime-system-model.md](references/container-image-and-runtime-system-model.md)

### Failure modes — detection and mitigation (summary)

Cold cache, secrets in history, SIGTERM, libc/arch, compose races, OOM — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Size vs debuggability; Alpine vs slim; Compose vs cluster — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No fake digests; lockfile-aware install commands — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Dockerfile authoring (summary)

Multi-stage, `COPY --chown`, BuildKit cache mounts, `HEALTHCHECK`, `ARG` vs `ENV` — **`dockerfile.md`**.

Details: [references/dockerfile.md](references/dockerfile.md)

### Image optimization (summary)

Layer chaining, cache splits, distroless/scratch — **`image-optimization.md`**.

Details: [references/image-optimization.md](references/image-optimization.md)

### Docker Compose (summary)

`depends_on` + health, volumes vs binds, profiles, overrides — **`compose.md`**.

Details: [references/compose.md](references/compose.md)

### Tips and tricks (summary)

`--progress=plain`, `history`, `dive`, prune — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

PID 1, exec vs shell form, volumes/UID, Alpine musl, secrets, read-only root, OOM — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision trees (summary)

Base image, multi-stage, Compose vs K8s, bind vs volume, desktop VM — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Root in prod, secrets in layers, bad layer order — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`ci-cd-pro`**, **`code-packaging-pro`**, **`deployment-pro`**, **`security-pro`**, **`network-infra-pro`**, **`testing-pro`**, **`postgresql-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Engine/BuildKit, digests, Compose format — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Engine/OS, target runtime, arch (amd64/arm64), deploy target (Compose vs cluster/serverless).
2. **Problem / goal** — Image size, security review, compose topology, CI cache, native dependency issue.
3. **System design** — Layer/build graph; context boundaries; digest/tag policy — **`container-image-and-runtime-system-model.md`**.
4. **Decision reasoning** — Base image class; multi-stage necessity; bind vs named volume — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Dockerfile / `compose` excerpt — match user’s package manager and paths — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Image size vs debuggability; build speed vs strict reproducibility; Alpine vs Debian.
7. **Failure modes** — Top risks for this setup — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Untested arch; orchestrator constraints; hand off to **`deployment-pro`** / **`security-pro`** / **`ci-cd-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Build / image / runtime model** | [references/container-image-and-runtime-system-model.md](references/container-image-and-runtime-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| **Dockerfile authoring** | [references/dockerfile.md](references/dockerfile.md) |
| Image optimization | [references/image-optimization.md](references/image-optimization.md) |
| Docker Compose | [references/compose.md](references/compose.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** Node.js app Dockerfile is 1.2 GB and rebuilds cold every time.  
**Expected output:** Full **Suggested response format** — multi-stage; `COPY package*.json` before source; Alpine vs slim trade-off; `.dockerignore`; expected size band — **`decision-framework-and-trade-offs.md`**.

### 2 — Tricky (edge case)

**Input:** Production container runs as root; bind-mount uploads; stops hang on deploy.  
**Expected output:** Non-root + ownership; volume UID alignment — **`edge-cases.md`**; PID 1 / SIGTERM — **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** CI builds Docker image then deploys — slow builds and registry full of `latest`.  
**Expected output:** **`docker-pro`** cache + BuildKit — **`ci-cd-pro`** pipeline — **`deployment-pro`** digest-pinned promotion — **`versions.md`**.

## Checklist before calling the skill done

### Image & build

- [ ] **Multi-stage** where build toolchain or dev deps must not ship — **`dockerfile.md`**.
- [ ] **`.dockerignore`** excludes fat/secret paths — **`anti-patterns.md`**.
- [ ] **Layer order**: dependency install before bulk `COPY` — **`container-image-and-runtime-system-model.md`**.
- [ ] **Base image** matches **libc** and **native modules** — **`decision-tree.md`**.

### Runtime & operations

- [ ] **Non-root** with correct file ownership — **`quality-validation-and-guardrails.md`**.
- [ ] **`HEALTHCHECK`** or equivalent for long-running services — **`dockerfile.md`**.
- [ ] **Signals / PID 1** addressed where graceful shutdown matters — **`edge-cases.md`**.
- [ ] **No secrets** in `ARG`/`ENV`/`COPY` of secret files — **`failure-modes-detection-mitigation.md`**.

### Compose & integration

- [ ] **Startup order** uses health where needed — **`compose.md`**.
- [ ] **Prod deploy** references digest or pinned tag policy — **`versions.md`**; orchestration delegated to **`deployment-pro`** when appropriate.

### Risk narrative

- [ ] **Failure modes** called out for prod paths — **`failure-modes-detection-mitigation.md`**.
- [ ] **Cross-skill** routing when rollout, CI, or scanning dominates — **`integration-map.md`**.
