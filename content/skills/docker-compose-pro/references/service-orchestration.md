# Service Orchestration

## Service ordering and startup

Docker Compose starts services in dependency order defined by `depends_on`. Without explicit dependencies, services start in parallel with no guaranteed order.

### Startup sequence principles

1. **Databases first** — Neo4j, PostgreSQL, MySQL start before anything that queries them
2. **Caches second** — Redis, Memcached start after databases (some caches warm from DB)
3. **Search engines third** — Meilisearch, Elasticsearch need data services available
4. **Application services fourth** — API servers that consume all the above
5. **Reverse proxies last** — Nginx, Traefik need backends ready to proxy to

### depends_on variants

```yaml
# Basic ordering (only waits for container start, NOT readiness)
depends_on:
  - neo4j
  - redis

# With health condition (waits for service to be healthy)
depends_on:
  neo4j:
    condition: service_healthy
  redis:
    condition: service_healthy

# Wait for service to complete (one-shot containers like migrations)
depends_on:
  migrate:
    condition: service_completed_successfully
```

## Restart policies

| Policy | Behavior | Use case |
|--------|----------|----------|
| `no` | Never restart | One-shot tasks, debugging |
| `always` | Restart unconditionally | Services that must always run (including after `docker stop`) |
| `unless-stopped` | Restart unless manually stopped | Production services (respects `docker compose stop`) |
| `on-failure` | Restart only on non-zero exit | Batch jobs, workers that should retry |

Production recommendation: `unless-stopped` for all long-running services. This survives host reboots (with Docker daemon auto-start) while still allowing manual `docker compose stop` for maintenance.

```yaml
services:
  api:
    restart: unless-stopped
    # With backoff limits (compose v2.4+)
    deploy:
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
```

## Build context

### Development with local build

```yaml
services:
  api:
    build:
      context: .                    # Build context (where Dockerfile lives)
      dockerfile: Dockerfile        # Explicit Dockerfile path
      args:
        NODE_ENV: development       # Build-time arguments
      target: development           # Multi-stage target
    volumes:
      - ./src:/app/src              # Hot reload via bind mount
      - /app/node_modules           # Anonymous volume protects node_modules
```

### Production with pre-built image

```yaml
services:
  api:
    image: ghcr.io/myorg/api:${VERSION:-latest}
    # No build context in production — use CI-built images
```

### Hybrid approach

```yaml
services:
  api:
    image: myapp/api:dev
    build:
      context: .
      dockerfile: Dockerfile
    # `docker compose up` uses image if available
    # `docker compose up --build` forces rebuild
    # `docker compose build` builds and tags
```

## Profiles for optional services

Profiles allow defining services that only start when explicitly requested. Ideal for development tools, monitoring, or debugging services.

```yaml
services:
  api:
    # No profile = always starts
    build: .
    ports:
      - "3456:3000"

  neo4j:
    # No profile = always starts
    image: neo4j:5.15-community

  neo4j-browser:
    image: neo4j:5.15-community
    profiles: ["debug"]
    ports:
      - "7474:7474"       # Browser UI
      - "7687:7687"       # Bolt protocol

  redis-commander:
    image: rediscommander/redis-commander
    profiles: ["debug"]
    ports:
      - "8081:8081"
    environment:
      - REDIS_HOSTS=local:redis:6379

  mailhog:
    image: mailhog/mailhog
    profiles: ["dev"]
    ports:
      - "1025:1025"       # SMTP
      - "8025:8025"       # Web UI
```

Usage:
```bash
docker compose up -d                      # Only non-profiled services
docker compose --profile debug up -d      # Include debug services
docker compose --profile dev --profile debug up -d  # Multiple profiles
```

## Container naming

```yaml
services:
  api:
    container_name: personal-ai-api    # Fixed name (prevents scaling)
    hostname: api                       # Hostname inside the network

  worker:
    # No container_name = auto-generated: {project}_{service}_{replica}
    # Allows: docker compose up --scale worker=3
```

Naming rules:
- Set `container_name` only for services that must have a predictable name (e.g., referenced by external tools)
- Omit `container_name` for services you might scale
- Project name defaults to directory name; override with `COMPOSE_PROJECT_NAME` env var or `-p` flag

## Scaling services

```yaml
services:
  worker:
    image: myapp/worker:latest
    deploy:
      replicas: 3                # Start 3 instances
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

```bash
# Runtime scaling
docker compose up -d --scale worker=5

# Note: cannot scale services with container_name or host port mappings
# This FAILS:
#   ports: "8080:3000"  # Port 8080 conflict on second instance
# This WORKS:
#   ports: "3000"       # Random host port per instance
```

## Service inheritance with extends

```yaml
# docker-compose.base.yml
services:
  base-node:
    build:
      context: .
      target: base
    env_file: .env
    restart: unless-stopped

# docker-compose.yml
services:
  api:
    extends:
      file: docker-compose.base.yml
      service: base-node
    ports:
      - "3456:3000"
    command: ["node", "dist/main.js"]

  worker:
    extends:
      file: docker-compose.base.yml
      service: base-node
    command: ["node", "dist/worker.js"]
```

## Multi-file composition

```bash
# Compose merges files left to right (later files override earlier)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or via environment variable
COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml docker compose up -d
```

```yaml
# docker-compose.yml — base configuration
services:
  api:
    build: .
    env_file: .env

# docker-compose.prod.yml — production overrides
services:
  api:
    image: ghcr.io/myorg/api:${VERSION}
    build: !reset null              # Remove build in production
    ports:
      - "127.0.0.1:3456:3000"      # Bind only to localhost (Nginx proxies)
    deploy:
      resources:
        limits:
          memory: 512M
```
