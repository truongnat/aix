# Decision Tree

## Single host vs Docker Swarm vs Kubernetes

### When to stay on single-host Docker Compose

Choose single-host compose when:
- **1-3 services** with modest resource needs
- **Single VPS** deployment (2-8 CPU cores, 4-32GB RAM)
- **No high-availability requirement** (acceptable minutes of downtime)
- **Small team** (1-5 developers)
- **Predictable traffic** (no sudden 10x spikes)
- **Budget-conscious** (one $20-50/month VPS)

This covers most personal projects, MVPs, internal tools, and early-stage startups. The personal-ai stack (Neo4j + Meilisearch + Redis + NestJS + Nginx) is a textbook single-host case.

### When to consider Docker Swarm

Move to Swarm when:
- **Multi-node requirement** (2-5 nodes for redundancy)
- **Rolling updates** needed with zero downtime
- **Service replication** across multiple hosts
- **Built-in load balancing** needed
- **Same compose file** should work (Swarm uses compose format with deploy section)

Swarm advantages over plain compose:
- Multi-host orchestration
- Automatic service failover
- Built-in secrets management
- Routing mesh for ingress

Swarm disadvantages:
- Docker Inc. has deprioritized Swarm development
- Smaller community and fewer resources than K8s
- Limited autoscaling capabilities
- Fewer third-party integrations

### When to move to Kubernetes

Move to K8s when:
- **10+ services** with complex inter-dependencies
- **Multiple teams** deploying independently
- **Auto-scaling** required (horizontal pod autoscaler)
- **Multi-region** deployment
- **Advanced networking** (service mesh, traffic splitting)
- **Compliance requirements** (managed K8s providers offer certifications)
- **Budget allows** (K8s clusters cost $100-500+/month minimum)

K8s is overkill for:
- Personal projects
- Prototypes and MVPs
- Teams under 5 people without dedicated DevOps
- Applications with < 1000 daily active users

## Dev compose vs prod compose

### Single file with profiles

For simple stacks, one file with profiles can work:

```yaml
services:
  api:
    build: .
    ports:
      - "${API_PORT:-3456}:3000"
    profiles: ["dev", "prod"]   # Don't actually do this — just omit profiles

  neo4j-browser:
    image: neo4j:5.15-community
    profiles: ["dev"]           # Only in dev
    ports:
      - "7474:7474"

  nginx:
    image: nginx:alpine
    profiles: ["prod"]          # Only in production
    ports:
      - "80:80"
      - "443:443"
```

### Multi-file approach (recommended for production)

```
docker-compose.yml          # Base: service definitions, volumes, networks
docker-compose.dev.yml      # Dev overrides: build, ports, bind mounts
docker-compose.prod.yml     # Prod overrides: images, restart, resource limits
```

```bash
# Development
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Base file** (`docker-compose.yml`):
```yaml
services:
  neo4j:
    image: neo4j:5.15-community
    volumes:
      - neo4j_data:/data
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "${NEO4J_USER}", "-p", "${NEO4J_PASSWORD}", "RETURN 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  api:
    depends_on:
      neo4j:
        condition: service_healthy
    env_file: .env

volumes:
  neo4j_data:
```

**Dev overrides** (`docker-compose.dev.yml`):
```yaml
services:
  neo4j:
    ports:
      - "7474:7474"      # Browser for debugging
      - "7687:7687"      # Direct bolt access

  api:
    build:
      context: .
      target: development
    ports:
      - "3456:3000"
      - "9229:9229"       # Debugger
    volumes:
      - ./src:/app/src    # Hot reload
```

**Prod overrides** (`docker-compose.prod.yml`):
```yaml
services:
  neo4j:
    restart: unless-stopped
    # No ports — internal only

  api:
    image: ghcr.io/myorg/api:${VERSION}
    restart: unless-stopped
    ports:
      - "127.0.0.1:3456:3000"   # Localhost only, Nginx proxies
    deploy:
      resources:
        limits:
          memory: 512M

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - api
```

## When to use build vs image

### Use `build:` when

- Developing the service locally (need code changes reflected)
- Service is your own application (not a third-party tool)
- CI pipeline builds and tests the image
- No pre-built image exists for your application

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: development    # Multi-stage target for dev
```

### Use `image:` when

- Using official third-party services (Neo4j, Redis, Nginx)
- Deploying a pre-built image from CI
- Production environment (never build on the server)
- Using a specific tested version

```yaml
services:
  neo4j:
    image: neo4j:5.15-community    # Always image for third-party
  api:
    image: ghcr.io/myorg/api:v1.2.3   # Pre-built in CI
```

### Hybrid (both)

```yaml
services:
  api:
    image: myapp/api:dev        # Tag for the built image
    build:
      context: .
      dockerfile: Dockerfile
```

Behavior:
- `docker compose up`: uses image if exists, otherwise builds
- `docker compose up --build`: always rebuilds
- `docker compose build`: builds and tags as `myapp/api:dev`
- `docker compose push`: pushes to registry

## When to use custom networks

### Default network is sufficient when

- All services need to communicate with each other
- No security isolation requirements
- Simple topology (< 5 services)
- Development environment

### Use custom networks when

- **Security isolation needed** — prevent reverse proxy from directly accessing database
- **Multi-tier architecture** — frontend network, backend network, database network
- **Multiple compose projects** need to communicate — shared external network
- **Internal-only services** — backend network with `internal: true` blocks outbound internet

```yaml
# Decision: Do you need network isolation?
# NO → don't define any networks (use default)
# YES → define purpose-specific networks

networks:
  frontend:        # Services reachable from outside
    driver: bridge
  backend:         # Database tier — no internet access
    driver: bridge
    internal: true
```

## Docker Compose v1 vs v2

### v1 (deprecated)

- Command: `docker-compose` (hyphenated, separate binary)
- File format: requires `version: '3.x'` at top
- Installed separately via pip or standalone binary
- End of life: June 2023

### v2 (current)

- Command: `docker compose` (space, plugin to docker CLI)
- File format: `version:` field is optional and ignored
- Installed as Docker CLI plugin (bundled with Docker Desktop)
- Active development

### Migration

```bash
# Check which version you have
docker compose version    # v2 (correct)
docker-compose --version  # v1 (deprecated)

# v2 is backward-compatible with v1 files
# Just change your commands:
docker-compose up -d    →    docker compose up -d
docker-compose down     →    docker compose down
docker-compose logs     →    docker compose logs
```

Key differences in v2:
- Container names use `-` instead of `_`: `project-service-1` vs `project_service_1`
- Better build cache handling
- `depends_on` with `condition` works properly (was broken in some v1 versions)
- `profiles` support
- `docker compose watch` for file sync (alternative to bind mounts)

### Compose file format version

```yaml
# v1 file format (old)
version: '3.8'    # Required in v1, specifies feature set
services:
  ...

# v2 file format (current)
# No version field needed — compose auto-detects features
services:
  ...
```

If maintaining compatibility with both: keep `version: '3.8'` (v2 ignores it, v1 needs it).

## Summary decision flowchart

```
Q: How many services?
├─ 1 service → docker run, no compose needed
├─ 2-10 services → Docker Compose (this skill)
├─ 10-50 services, single team → Docker Compose or Swarm
└─ 50+ services, multiple teams → Kubernetes

Q: Environment?
├─ Local dev → build + bind mounts + all ports exposed
├─ Staging → images + limited port exposure
└─ Production → images + no DB ports + restart + resource limits

Q: Need multi-host?
├─ No → single docker-compose.yml
├─ Yes, simple → Docker Swarm (same compose format)
└─ Yes, complex → Kubernetes

Q: Custom networks?
├─ All services talk to all → default (don't define networks)
├─ Need isolation → custom networks with internal flag
└─ Multi-project comms → external shared network
```
