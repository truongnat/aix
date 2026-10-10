# Anti-patterns

## 1. Using :latest tags

**Problem:** `image: neo4j:latest` pulls whatever version is newest at the time. Different machines or different days get different versions.

**Consequences:**
- Builds are not reproducible
- A breaking change in a new version can silently break production
- Cannot roll back to a known-good state
- Team members may have different versions locally

**Fix:**
```yaml
# Bad
image: neo4j:latest
image: redis

# Good — pin to specific version
image: neo4j:5.15-community
image: redis:7.2-alpine
image: getmeili/meilisearch:v1.6.2
```

**Exception:** Development environments where you explicitly want the latest. Even then, pin at least the major version: `neo4j:5` instead of `neo4j:latest`.

## 2. Exposing database ports to host in production

**Problem:** `ports: "7687:7687"` makes Neo4j accessible from any IP that can reach the server.

**Consequences:**
- Database accessible to the entire internet on a VPS
- Brute-force attacks on credentials
- Data exfiltration if password is weak
- Compliance violations (PCI, HIPAA)

**Fix:**
```yaml
# Bad — exposes to 0.0.0.0 (all interfaces)
services:
  neo4j:
    ports:
      - "7474:7474"
      - "7687:7687"

# Good — production: no port exposure
services:
  neo4j:
    # No ports directive. Only reachable from within Docker network.
    expose:
      - "7687"

# Acceptable — bind to localhost only (for admin access via SSH tunnel)
services:
  neo4j:
    ports:
      - "127.0.0.1:7687:7687"
```

**If you need remote access to the database:** Use SSH tunnel from your local machine:
```bash
ssh -L 7687:localhost:7687 user@vps
# Now connect to localhost:7687 from your local Neo4j Desktop
```

## 3. No health checks on stateful services

**Problem:** Without health checks, `depends_on` only waits for the container to start, not for the service inside to be ready.

**Consequences:**
- API starts before Neo4j accepts connections (30s init time)
- Application crashes on startup with "connection refused"
- Requires manual restart or fragile sleep-based workarounds
- Intermittent CI failures

**Fix:**
```yaml
# Bad — no health check, depends_on is useless
services:
  neo4j:
    image: neo4j:5.15-community

  api:
    depends_on:
      - neo4j    # Only waits for container start, not readiness

# Good — health check + conditional dependency
services:
  neo4j:
    image: neo4j:5.15-community
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "neo4j", "-p", "${NEO4J_PASSWORD}", "RETURN 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  api:
    depends_on:
      neo4j:
        condition: service_healthy
```

## 4. Host networking mode

**Problem:** `network_mode: host` removes all network isolation. The container shares the host's network namespace.

**Consequences:**
- Container can bind to any port on the host
- No DNS-based service discovery (can't use service names)
- Port conflicts with host services
- No network isolation between containers
- Security boundary eliminated

**Fix:**
```yaml
# Bad
services:
  api:
    network_mode: host

# Good — use port mapping
services:
  api:
    ports:
      - "3456:3000"
    # Service discovery works: api can reach neo4j:7687
```

**Exception:** Very rare cases where port mapping overhead matters (high-frequency UDP, for example). In web application stacks, there is never a valid reason.

## 5. Storing secrets in docker-compose.yml

**Problem:** Hardcoded passwords and keys in the compose file get committed to git.

**Consequences:**
- Secrets in git history (forever, even if you delete them later)
- Anyone with repo access sees production credentials
- Cannot rotate secrets without changing the compose file
- Different environments need different compose files

**Fix:**
```yaml
# Bad — secrets visible in compose file (and git history)
services:
  neo4j:
    environment:
      - NEO4J_AUTH=neo4j/super_secret_password_123

# Good — reference variables from .env (gitignored)
services:
  neo4j:
    environment:
      - NEO4J_AUTH=${NEO4J_USER}/${NEO4J_PASSWORD}

# Better — use env_file
services:
  neo4j:
    env_file: .env
```

**If secrets are already in git history:**
```bash
# They're compromised. Rotate them immediately.
# Then use git-filter-repo or BFG to purge history (complex, requires force-push)
# Prevention is far easier than cure.
```

## 6. No restart policy

**Problem:** Without `restart:`, a crashed container stays dead until manually restarted.

**Consequences:**
- Service outage after any crash (OOM, uncaught exception)
- Outage after host reboot (Docker restarts but containers don't)
- Requires monitoring + manual intervention
- 3 AM alerts for a simple restart

**Fix:**
```yaml
# Bad — no restart policy
services:
  api:
    image: myapp/api:latest

# Good — auto-restart on failure
services:
  api:
    image: myapp/api:v1.2.3
    restart: unless-stopped

# For one-shot tasks (migrations, backups)
services:
  migrate:
    restart: "no"    # Run once and exit
```

`unless-stopped` is ideal for production: it restarts on crash and after host reboot, but respects `docker compose stop` for intentional maintenance.

## 7. Massive images without multi-stage builds

**Problem:** Using full OS base images or including build tools in production images.

**Consequences:**
- 1GB+ images instead of 100MB
- Slow deployments (pulling takes minutes)
- Larger attack surface (more packages = more CVEs)
- Wasted disk and bandwidth

**Fix:** (Defer to docker-pro skill for Dockerfile details, but in compose context:)
```yaml
# Prefer Alpine-based official images
services:
  redis:
    image: redis:7-alpine          # 30MB vs 130MB for redis:7
  nginx:
    image: nginx:alpine            # 40MB vs 190MB for nginx:latest
  api:
    image: node:20-alpine          # 180MB vs 1.1GB for node:20
```

## 8. Using `docker compose down -v` carelessly

**Problem:** The `-v` flag destroys named volumes. Data loss is immediate and unrecoverable.

**Consequences:**
- All database data destroyed
- Search indices deleted
- Cache contents lost
- No warning, no confirmation

**Fix:**
```bash
# Safe — stops and removes containers, keeps volumes
docker compose down

# DANGEROUS — also removes volumes (ALL DATA LOST)
docker compose down -v    # Only for fresh start / CI environments

# Check what volumes exist before destroying
docker volume ls | grep personal-ai
```

## 9. Bind-mounting the entire project root

**Problem:** Mounting `.:/app` exposes everything to the container, including `.env`, `.git`, and `node_modules`.

**Consequences:**
- `.env` with secrets accessible from within the container
- `.git` history exposed (potential secret leaks)
- Host `node_modules` (wrong platform) overwrites container's
- Performance issues (millions of files synced)

**Fix:**
```yaml
# Bad
volumes:
  - .:/app

# Good — mount only what's needed
volumes:
  - ./src:/app/src
  - ./package.json:/app/package.json:ro
  - /app/node_modules    # Protect container's node_modules
```

## 10. Not using .dockerignore

**Problem:** Without `.dockerignore`, the build context includes everything — `.git`, `node_modules`, `.env`, test fixtures, docs.

**Consequences:**
- Slow builds (copying gigabytes of unnecessary files)
- Secrets (`.env`) baked into image layers
- `node_modules` from host overrides `npm install` in container
- Cache invalidation on irrelevant file changes

**Fix:**
```
# .dockerignore
.git
.env
.env.*
node_modules
dist
*.log
.DS_Store
backups/
```

## Summary table

| Anti-pattern | Severity | Environment | Fix difficulty |
|-------------|----------|-------------|----------------|
| :latest tags | Medium | All | Easy — pin versions |
| Exposed DB ports | Critical | Production | Easy — remove ports |
| No health checks | High | All | Medium — add checks |
| Host networking | High | All | Easy — use port mapping |
| Secrets in compose | Critical | All | Easy — use .env |
| No restart policy | High | Production | Easy — add restart |
| Massive images | Medium | All | Medium — use alpine |
| Careless `down -v` | Critical | All | Discipline — never use without thinking |
| Mount entire root | Medium | Development | Easy — mount specific dirs |
| No .dockerignore | Medium | All | Easy — create file |
