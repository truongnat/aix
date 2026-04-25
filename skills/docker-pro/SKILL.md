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