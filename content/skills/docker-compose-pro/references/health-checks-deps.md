# Health Checks & Dependencies

## healthcheck directive syntax

```yaml
services:
  neo4j:
    image: neo4j:5.15-community
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "neo4j", "-p", "password", "RETURN 1"]
      interval: 10s        # Time between checks
      timeout: 5s          # Max time for a single check
      retries: 5           # Failures before marking unhealthy
      start_period: 30s    # Grace period for startup (failures don't count)
```

### test formats

```yaml
# CMD form — exec directly, no shell
test: ["CMD", "curl", "-f", "http://localhost:7700/health"]

# CMD-SHELL form — runs through /bin/sh
test: ["CMD-SHELL", "curl -f http://localhost:7700/health || exit 1"]

# Shell shorthand (equivalent to CMD-SHELL)
test: curl -f http://localhost:7700/health || exit 1
```

Rules:
- Exit code 0 = healthy
- Exit code 1 = unhealthy
- Any other exit code = error (treated as unhealthy)
- The check runs INSIDE the container — use tools available in the container image

### Timing parameters explained

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `interval` | 30s | How often to run the check |
| `timeout` | 30s | How long to wait before considering the check failed |
| `retries` | 3 | How many consecutive failures before "unhealthy" |
| `start_period` | 0s | Initial grace period — failures during this don't count toward retries |

**start_period is critical for databases.** Neo4j can take 20-40 seconds to initialize on first startup. Without `start_period`, the container gets marked unhealthy before it finishes starting.

## Service-specific health checks

### Neo4j

```yaml
neo4j:
  healthcheck:
    test: ["CMD", "cypher-shell", "-u", "${NEO4J_USER:-neo4j}", "-p", "${NEO4J_PASSWORD}", "RETURN 1"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 30s    # Neo4j needs 20-40s on first boot
```

Why `cypher-shell`: It verifies both that the database is accepting connections AND that authentication is working. A simple TCP check would pass before Neo4j is actually ready to serve queries.

### Meilisearch

```yaml
meilisearch:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
    interval: 10s
    timeout: 3s
    retries: 3
    start_period: 5s     # Meilisearch starts fast
```

Meilisearch provides a `/health` endpoint that returns `{"status":"available"}` when ready. Faster startup than Neo4j — 5s start_period is sufficient.

### Redis

```yaml
redis:
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 3
    # No start_period needed — Redis starts in <1 second
```

Redis starts almost instantly. The `PING` command returns `PONG` when the server is ready.

### PostgreSQL

```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
    interval: 5s
    timeout: 3s
    retries: 5
    start_period: 10s
```

### Nginx

```yaml
nginx:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost/health"]
    interval: 10s
    timeout: 3s
    retries: 3
```

Note: Requires a `/health` location in your nginx config:
```nginx
location /health {
    access_log off;
    return 200 "healthy
";
}
```

### Custom application (NestJS)

```yaml
api:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 15s
    timeout: 5s
    retries: 3
    start_period: 10s    # NestJS needs a few seconds to bootstrap
```

Requires a health endpoint in your NestJS app:
```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

## depends_on with conditions

### condition: service_healthy

The dependent service waits until the dependency passes its health check.

```yaml
services:
  api:
    depends_on:
      neo4j:
        condition: service_healthy      # Wait for Neo4j health check to pass
      meilisearch:
        condition: service_healthy      # Wait for Meilisearch /health to return 200
      redis:
        condition: service_healthy      # Wait for Redis PING/PONG

  nginx:
    depends_on:
      api:
        condition: service_healthy      # Wait for API /health endpoint
```

### condition: service_started

Default behavior — only waits for the container to start (not be ready):

```yaml
depends_on:
  neo4j:
    condition: service_started    # Same as depends_on: [neo4j]
```

### condition: service_completed_successfully

For one-shot containers (migrations, seeders):

```yaml
services:
  migrate:
    image: myapp/api:latest
    command: ["npm", "run", "migrate"]
    depends_on:
      neo4j:
        condition: service_healthy

  api:
    depends_on:
      migrate:
        condition: service_completed_successfully  # Wait for migration to finish
      neo4j:
        condition: service_healthy
```

## Startup order guarantees

What `depends_on` with `service_healthy` guarantees:
1. Dependency container is running
2. Dependency health check has passed at least once
3. Only then does the dependent container start

What it does NOT guarantee:
- The dependency stays healthy (it could fail after startup)
- Connection will succeed on first attempt (brief window between healthy and dependent starting)
- Recovery from dependency restart (use retry logic in your application)

## Wait-for-it patterns

Sometimes health checks are not granular enough. Use an entrypoint wrapper to actively wait for a specific endpoint:

### Using dockerize

```yaml
services:
  api:
    entrypoint: >
      dockerize
      -wait tcp://neo4j:7687
      -wait http://meilisearch:7700/health
      -wait tcp://redis:6379
      -timeout 60s
      node dist/main.js
```

### Using wait-for-it.sh

```yaml
services:
  api:
    entrypoint: >
      /app/scripts/wait-for-it.sh neo4j:7687 --timeout=60 --
      /app/scripts/wait-for-it.sh redis:6379 --timeout=30 --
      node dist/main.js
```

### Application-level retry (preferred)

The best approach is making your application resilient to transient connection failures:

```typescript
// NestJS with retry logic
async connectToNeo4j(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await this.driver.verifyConnectivity();
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

This is preferred because:
- Works regardless of Docker Compose features
- Handles runtime failures (not just startup)
- No additional tools needed in the image

## Service initialization times (from production experience)

| Service | Typical init time | start_period recommendation |
|---------|------------------|-----------------------------|
| Redis | < 1s | Not needed |
| Meilisearch | 2-5s | 5s |
| PostgreSQL | 3-10s | 10s |
| Neo4j | 20-40s | 30s |
| Elasticsearch | 30-60s | 45s |
| NestJS API | 3-8s | 10s |
| Nginx | < 1s | Not needed |

## Monitoring health status

```bash
# Check health status of all services
docker compose ps

# Detailed health info for a service
docker inspect --format='{{json .State.Health}}' personal-ai-neo4j-1 | jq

# Watch health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' personal-ai-neo4j-1

# Trigger immediate health check
docker compose exec neo4j cypher-shell -u neo4j -p password "RETURN 1"
```

## Disabling health checks

For debugging or when upstream images have broken health checks:

```yaml
services:
  neo4j:
    healthcheck:
      disable: true    # Disables any healthcheck defined in the image
```

Only use this for debugging — never in production configurations.
