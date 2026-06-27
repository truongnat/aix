---
name: docker-compose-pro
description: >
  Multi-service Docker Compose orchestration: service definitions, networking,
  volumes, health checks, depends_on, env/secrets, and dev/prod profiles.


  Use this skill when writing or reviewing docker-compose.yml, configuring
  inter-service networking, named volumes, health checks, dependency ordering,
  or port mapping strategy.


  Combine with **`vps-devops-pro`** for host provisioning and reverse proxy,
  **`deploy-workflow`** for project deploy steps.


  Triggers: "docker compose", "docker-compose.yml", "services", "volumes",
  "depends_on", "networks", "container", "ports", "healthcheck", "env_file",
  "compose profile"
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# Docker Compose (professional)

Use official [Docker Compose docs](https://docs.docker.com/compose/) for syntax truth; this skill encodes **production-safe orchestration**, **volume discipline**, and **startup ordering**. Confirm **environment** (dev vs prod) and **which services** must persist data.

## Boundary

**`docker-compose-pro`** owns **multi-service Compose files**: services, networks, volumes, health checks, depends_on, env_file, and profiles. Defers to **`vps-devops-pro`** for VPS firewall, Caddy/systemd, and SSL; **`deploy-workflow`** for git-pull deploy procedures on this project.

## When to use

- Defining multi-service stacks (API + DB + cache + search + proxy)
- Configuring inter-service DNS and port exposure
- Named volumes vs bind mounts for databases
- Health checks and `depends_on` with `condition: service_healthy`
- Dev/staging/prod compose profiles
- Trigger keywords: `docker compose`, `compose.yml`, `depends_on`, `healthcheck`, `volumes`

## When not to use

- **Kubernetes** — not covered
- **Dockerfile authoring** — use image docs or project Dockerfile patterns
- **VPS provisioning / UFW / Caddy** — use **`vps-devops-pro`**
- **Project-specific deploy runbook** — use **`deploy-workflow`**

## Required inputs

- **Services** to orchestrate and their images or build contexts
- **Environment** (dev, staging, production)
- **Host port constraints** and conflicts
- **Persistence** requirements (what survives `docker compose down`)
- **Network exposure** (which services are public vs internal only)

## Expected output

1. **Issue or goal** — what stack or change is needed
2. **Recommendation** — topology, volumes, health checks, profiles
3. **Code** — `docker-compose.yml`, `.env.example`, startup commands
4. **Residual risks** — data loss, port exposure, startup race conditions

## Workflow

1. **Confirm** services, env, ports, persistence. Verify: `docker compose config`, existing `.env`, host port usage (`ss -tlnp`).
2. **Apply** minimum compose that works; add health checks and `depends_on` for stateful deps; use named volumes for DBs (**Simplicity First**).
3. **Verify** `docker compose up -d`, `docker compose ps`, service logs, health endpoints (**Goal-Driven Execution**).

### Operating principles

1. **Think Before Coding** — inventory services and ports before editing compose.
2. **Simplicity First** — default bridge network until custom networks are required.
3. **Surgical Changes** — change one service or profile at a time.
4. **Goal-Driven Execution** — every compose change ends with `config` + `ps` + health curl.
5. **Named volumes for databases** — Neo4j, Redis, Meilisearch use named volumes, not bind mounts.
6. **depends_on + healthcheck** — pair ordering with health for Neo4j (~30s) and Meilisearch (~5s).
7. **env_file over inline secrets** — never commit secrets in compose YAML.

## Default recommendations by scenario

| Scenario | Recommendation |
|----------|----------------|
| Local dev | `build: .`, expose debug ports, optional profiles for heavy services |
| Production VPS | Pre-built images, no DB ports on host, `restart: unless-stopped` |
| Staging | Mirror prod topology; separate `.env.staging` |
| API + graph stack | healthcheck on neo4j/meili/redis before `api` starts |

## Anti-patterns

- **`:latest` image tags** — unpredictable deploys
- **DB ports on host in prod** — security exposure
- **No health checks** — API starts before DB is ready
- **Secrets in compose file** — use `.env` + `env_file`
- **No restart policy** — crashed containers stay down

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Service orchestration (summary)

- Restart policies, build contexts, profiles, container naming
- Startup order via `depends_on` and health conditions

Details: [references/service-orchestration.md](references/service-orchestration.md)

### Networking patterns (summary)

- Service DNS names, internal-only services, port mapping comments
- When to add custom networks

Details: [references/networking-patterns.md](references/networking-patterns.md)

### Volume strategies (summary)

- Named vs bind mounts, `:ro` config mounts, backup implications

Details: [references/volume-strategies.md](references/volume-strategies.md)

### Health checks and dependencies (summary)

- `healthcheck` syntax, `start_period`, `condition: service_healthy`

Details: [references/health-checks-deps.md](references/health-checks-deps.md)

### Environment and secrets (summary)

- `.env`, `env_file`, interpolation, `.env.example` conventions

Details: [references/env-and-secrets.md](references/env-and-secrets.md)

### Decision tree (summary)

- Single host Compose vs Swarm/K8s; dev vs prod file split; build vs image

Details: [references/decision-tree.md](references/decision-tree.md)

## Suggested response format (implement / review)

1. **Issue or goal** — stack or change requested
2. **Recommendation** — services, volumes, health, ports rationale
3. **Code** — compose YAML + `.env.example` + startup commands
4. **Residual risks** — exposure, data loss on `down -v`, startup timing

## Resources in this skill

| Topic | File |
|-------|------|
| Service orchestration | [references/service-orchestration.md](references/service-orchestration.md) |
| Networking | [references/networking-patterns.md](references/networking-patterns.md) |
| Volumes | [references/volume-strategies.md](references/volume-strategies.md) |
| Health checks | [references/health-checks-deps.md](references/health-checks-deps.md) |
| Env and secrets | [references/env-and-secrets.md](references/env-and-secrets.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |

## Quick example

**Input:** "Compose for Neo4j + Meilisearch + Redis + NestJS API on VPS"

**Expected output:**

1. Issue or goal: Four-service stack with safe startup order
2. Recommendation: Named volumes for data services; healthchecks; API depends on healthy DB/cache/search; API port `••••:••••` commented
3. Code: `docker-compose.yml` with `depends_on` + `condition: service_healthy` on neo4j, meilisearch, redis
4. Residual risks: Neo4j `start_period` too short causes API crash-loop; never `down -v` without backup

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum solution; no speculative complexity (Simplicity First)
- [ ] Only touched code/content directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified before marking done (Goal-Driven Execution)
- [ ] Stateful services use named volumes
- [ ] Health checks on services with init time
- [ ] `depends_on` uses `service_healthy` where needed
- [ ] No secrets in compose; `.env.example` provided
- [ ] Port mappings commented; DB not exposed on host in prod
- [ ] `docker compose config` and `up -d` tested
