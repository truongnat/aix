# Networking Patterns

## Default bridge network

When you run `docker compose up`, Compose automatically creates a default network for your project. All services join this network and can reach each other by service name.

```yaml
services:
  api:
    build: .
    # Can reach neo4j at hostname "neo4j", port 7687
    # Can reach redis at hostname "redis", port 6379
    environment:
      - NEO4J_URI=bolt://neo4j:7687
      - REDIS_URL=redis://redis:6379

  neo4j:
    image: neo4j:5.15-community
    # Internally listens on 7474 (HTTP) and 7687 (Bolt)
    # Reachable by other services at neo4j:7687

  redis:
    image: redis:7-alpine
    # Internally listens on 6379
    # Reachable by other services at redis:6379
```

Key facts about the default network:
- Network name: `{project_name}_default`
- All services are on it unless you specify otherwise
- Container-to-container communication uses service names as DNS
- No port mapping needed for inter-service communication
- Only `ports:` exposes services to the host machine

## DNS resolution

Docker's embedded DNS resolves service names to container IPs within the same network.

```yaml
services:
  api:
    environment:
      # Use service name as hostname — Docker DNS handles resolution
      - DATABASE_URL=bolt://neo4j:7687
      - MEILI_URL=http://meilisearch:7700
      - REDIS_URL=redis://redis:6379
      - NGINX_UPSTREAM=http://api:3000  # Services can reference themselves
```

DNS behavior:
- Resolution is automatic — no `/etc/hosts` editing
- Works across replicas (round-robin when scaled)
- Only works within the same Docker network
- Service aliases provide additional DNS names

```yaml
services:
  neo4j:
    image: neo4j:5.15-community
    networks:
      default:
        aliases:
          - database       # Also reachable as "database"
          - graph-db       # And as "graph-db"
```

## Port exposure strategies

### Development — expose everything for debugging

```yaml
services:
  neo4j:
    ports:
      - "7474:7474"    # Neo4j Browser UI
      - "7687:7687"    # Bolt protocol (for local Neo4j Desktop)

  meilisearch:
    ports:
      - "7700:7700"    # Meili dashboard + API

  redis:
    ports:
      - "6379:6379"    # redis-cli from host

  api:
    ports:
      - "3456:3000"    # API accessible from host browser
      - "9229:9229"    # Node.js debugger
```

### Production — minimal exposure through reverse proxy

```yaml
services:
  neo4j:
    # NO ports exposed to host — only accessible within Docker network
    expose:
      - "7687"         # Documents the internal port (informational only)

  meilisearch:
    expose:
      - "7700"

  redis:
    expose:
      - "6379"

  api:
    ports:
      - "127.0.0.1:3456:3000"  # Only localhost (Nginx connects here)
    # Or no ports at all if Nginx is also in Docker:
    expose:
      - "3000"

  nginx:
    ports:
      - "80:80"        # Only public entry point
      - "443:443"      # HTTPS
```

### Port mapping syntax

```yaml
ports:
  - "8080:80"              # host:container — standard mapping
  - "127.0.0.1:8080:80"   # Bind to localhost only (not 0.0.0.0)
  - "8080-8090:80-90"     # Port range
  - "80"                   # Random host port → container 80 (for scaling)
  - "8080:80/udp"         # UDP protocol
```

## Internal-only services

Services that should never be accessible from outside the Docker network:

```yaml
services:
  redis:
    image: redis:7-alpine
    # No `ports:` directive = invisible from host
    # Only other containers on the same network can reach it
    networks:
      - backend

  neo4j:
    image: neo4j:5.15-community
    networks:
      - backend
    # If you want to be extra explicit:
    # (expose is documentation-only, doesn't actually change behavior)
    expose:
      - "7687"
```

## Custom networks for isolation

Use custom networks when you need to isolate groups of services from each other.

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    networks:
      - frontend       # Can talk to API
      # Cannot reach neo4j, redis, meilisearch directly

  api:
    build: .
    networks:
      - frontend       # Nginx can reach it
      - backend        # It can reach databases

  neo4j:
    image: neo4j:5.15-community
    networks:
      - backend        # Only API can reach it

  redis:
    image: redis:7-alpine
    networks:
      - backend

  meilisearch:
    image: getmeili/meilisearch:v1.6
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true     # No outbound internet access for backend services
```

Benefits of network isolation:
- Nginx compromise cannot directly access databases
- Backend services cannot make outbound requests (with `internal: true`)
- Clear security boundary between public-facing and internal services

## External networks

Connect to networks created outside this compose file (useful for multi-project setups):

```yaml
services:
  api:
    networks:
      - shared

networks:
  shared:
    external: true
    name: infrastructure_shared    # Actual network name on the host
```

Create the external network first:
```bash
docker network create infrastructure_shared
```

## Network driver options

```yaml
networks:
  backend:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: br-backend
    ipam:
      config:
        - subnet: 172.28.0.0/16
          gateway: 172.28.0.1
```

## Debugging network issues

```bash
# List networks
docker network ls

# Inspect a network (see connected containers and IPs)
docker network inspect personal-ai_default

# Test connectivity from inside a container
docker compose exec api ping neo4j
docker compose exec api nslookup meilisearch
docker compose exec api curl http://meilisearch:7700/health

# Check which ports are actually exposed
docker compose ps
docker port personal-ai-api-1
```

## Common networking mistakes

1. **Using `localhost` in service URLs** — Inside a container, `localhost` is the container itself, not the host machine. Use service names: `neo4j`, `redis`, not `localhost`.

2. **Forgetting that `ports` exposes to 0.0.0.0 by default** — On a VPS, `ports: "7474:7474"` makes Neo4j Browser accessible to the entire internet. Use `127.0.0.1:7474:7474` to restrict to localhost.

3. **Mixing up expose and ports** — `expose` is purely documentation. `ports` actually creates the mapping. For inter-container communication, neither is needed — services on the same network can always reach each other.

4. **Host network mode breaking isolation** — `network_mode: host` removes all network isolation. The container shares the host's network stack. Avoid unless you have a very specific reason (performance-critical UDP, for example).
