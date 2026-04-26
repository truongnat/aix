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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** Engine baseline, runtime, arch, and whether **Compose** or **cluster** is the consumer. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm runtime, architecture, base-image constraints, and whether the container is for local dev, CI, or production. Ask before assuming libc, OS, or platform behavior.
2. **Simplicity First** — Start with the smallest working image and Compose setup that meets the need. Do not add distroless, multi-stage complexity, or extra services without justification.
3. **Surgical Changes** — Touch only the Dockerfile, Compose service, or runtime contract directly involved. Do not redesign unrelated app packaging.
4. **Goal-Driven Execution** — Done = the image builds reproducibly, the container starts correctly, and the runtime contract is verified.
5. **Layers are decisions** — Cache order, context size, and copy boundaries materially affect build speed and traceability.
6. **Runtime != build** — A passing build does not prove PID 1 behavior, filesystem assumptions, or network wiring are correct.
7. **Secrets stay out of layers** — Build args, ENV, and copied files should never become secret transport by accident.
8. **Compose is orchestration, not magic** — Startup order, health checks, and network behavior need explicit contracts.

## Default recommendations by scenario

- **Simple app container** — Start with one clear Dockerfile and a tight `.dockerignore`.
- **Size/perf issue** — Optimize layer order and build context before exotic base-image changes.
- **Local multi-service dev** — Use Compose with health-gated dependencies instead of sleep-based startup hacks.
- **Prod hardening** — Add non-root and runtime minimization only after the app contract is stable.

## Decision trees

Summary: choose image and orchestration complexity based on runtime needs, architecture constraints, and whether the consumer is local dev, CI, or production.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: leaking secrets into layers, oversized contexts, broken PID 1 behavior, and Compose startup logic based on hope rather than health checks.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Container image and runtime system model (summary)

How context, layers, image digest, and runtime process contracts fit together so container changes stay explainable.

Details: [references/container-image-and-runtime-system-model.md](references/container-image-and-runtime-system-model.md)

### Dockerfile patterns (summary)

How to structure copy/build/run stages so the image is reproducible and maintainable.

Details: [references/dockerfile.md](references/dockerfile.md)

### Compose (summary)

How service wiring, health checks, volumes, and local orchestration should behave.

Details: [references/compose.md](references/compose.md)

### Image optimization (summary)

How to reduce build time and size without sacrificing debuggability or correctness.

Details: [references/image-optimization.md](references/image-optimization.md)

### Failure modes and mitigation (summary)

Cache busts, arch mismatches, OOMs, signal handling, and startup races to catch before deploy-time pain.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect Dockerfile syntax, BuildKit behavior, and platform compatibility.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Runtime, architecture, target environment, and service topology.
2. **Container model** — Explain the relevant image, layer, process, or Compose behavior.
3. **Solution** — Minimum Dockerfile/Compose/runtime change with rationale.
4. **Verification** — Build, run, and health-check steps that prove the fix.
5. **Residual risks** — Remaining platform, secret, networking, or runtime caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Container image and runtime system model | [references/container-image-and-runtime-system-model.md](references/container-image-and-runtime-system-model.md) |
| Dockerfile patterns | [references/dockerfile.md](references/dockerfile.md) |
| Compose | [references/compose.md](references/compose.md) |
| Image optimization | [references/image-optimization.md](references/image-optimization.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Containerize this Node app for production."
- Start with a minimal reproducible Dockerfile and a tight build context.
- Verify runtime contract before adding hardening extras.
- **Verify:** The image builds, the app starts, and the health endpoint passes inside the container.

**Input (tricky):** "Compose works locally only if we sleep 15 seconds before starting the API."
- Replace timing hacks with health-checked dependency readiness.
- Keep orchestration logic explicit rather than cargo-culting retries.
- **Verify:** Services start reliably without arbitrary sleeps.

**Input (cross-skill):** "Build and publish a Python image from CI."
- Pair **`ci-cd-pro`** for workflow wiring and **`code-packaging-pro`** for artifact layout, while **`docker-pro`** owns the image contract.
- Keep image and pipeline responsibilities separate.
- **Verify:** CI builds the same image contract locally and remotely, then pushes the expected digest.

## Checklist before calling the skill done

- [ ] Runtime, architecture, and target environment confirmed first (Think Before Coding)
- [ ] Minimum working image/orchestration chosen; no unnecessary container complexity added (Simplicity First)
- [ ] Only the relevant Dockerfile/Compose/runtime surface was changed (Surgical Changes)
- [ ] Success criteria and build/run verification are explicit (Goal-Driven Execution)
- [ ] Layer order and build context are intentional
- [ ] Secrets are kept out of layers and logs
- [ ] Runtime behavior, not just build success, is verified
- [ ] Remaining platform or orchestration caveats are documented
