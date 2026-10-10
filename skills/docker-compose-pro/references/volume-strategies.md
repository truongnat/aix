# Volume Strategies

## Named volumes vs bind mounts

### Named volumes

Managed by Docker. Data stored in `/var/lib/docker/volumes/` on the host. Portable, performant, and the correct choice for database data.

```yaml
services:
  neo4j:
    volumes:
      - neo4j_data:/data       # Named volume for graph data
      - neo4j_logs:/logs       # Separate volume for logs

volumes:
  neo4j_data:                  # Declared at top level
  neo4j_logs:
```

Properties:
- Survive `docker compose down` (only destroyed with `docker compose down -v`)
- Managed entirely by Docker — no host path conflicts
- Better performance on macOS/Windows (no filesystem translation)
- Portable across hosts (can be backed up with `docker run --volumes-from`)
- No permission issues — Docker manages ownership

### Bind mounts

Map a host directory directly into the container. The container sees the host filesystem.

```yaml
services:
  api:
    volumes:
      - ./src:/app/src           # Host path : container path
      - ./config:/app/config:ro  # Read-only bind mount

  nginx:
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/certs:/etc/nginx/certs:ro
```

Properties:
- Changes on host immediately visible in container (hot reload)
- Changes in container immediately visible on host
- Subject to permission mismatches (host UID vs container UID)
- Performance penalty on macOS Docker Desktop (mitigated with `:cached`)
- Path must exist on host before container starts

### Decision matrix

| Scenario | Choice | Reason |
|----------|--------|--------|
| Database data (Neo4j, PostgreSQL) | Named volume | Persistence, performance, no permission issues |
| Search index (Meilisearch) | Named volume | Same as database data |
| Redis persistence | Named volume | RDB/AOF files managed by Redis |
| Application source code (dev) | Bind mount | Hot reload during development |
| Nginx config | Bind mount (`:ro`) | Edit on host, nginx reloads |
| SSL certificates | Bind mount (`:ro`) | Managed by certbot on host |
| Build output / node_modules | Anonymous volume | Prevent host overwriting container's deps |

## Read-only mounts

Append `:ro` to prevent the container from modifying mounted content:

```yaml
volumes:
  - ./nginx/conf.d:/etc/nginx/conf.d:ro    # Config: read-only
  - ./nginx/certs:/etc/nginx/certs:ro      # Certs: read-only
  - ./.env:/app/.env:ro                    # Env file: read-only
```

Use `:ro` for:
- Configuration files
- SSL certificates
- Static assets
- Any file the container should read but never modify

## Backup strategies

### Named volume backup

```bash
# Backup a named volume to a tar file
docker run --rm \
  -v neo4j_data:/source:ro \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/neo4j_data_$(date +%Y%m%d).tar.gz -C /source .

# Restore from backup
docker run --rm \
  -v neo4j_data:/target \
  -v $(pwd)/backups:/backup:ro \
  alpine sh -c "rm -rf /target/* && tar xzf /backup/neo4j_data_20260517.tar.gz -C /target"
```

### Database-specific backup

```bash
# Neo4j dump (while running)
docker compose exec neo4j neo4j-admin database dump neo4j --to-path=/backups

# Redis snapshot
docker compose exec redis redis-cli BGSAVE
docker cp personal-ai-redis-1:/data/dump.rdb ./backups/

# Meilisearch dump
curl -X POST http://localhost:7700/dumps -H "Authorization: Bearer ${MEILI_MASTER_KEY}"
```

### Automated backup with a service

```yaml
services:
  backup:
    image: alpine
    profiles: ["backup"]
    volumes:
      - neo4j_data:/data/neo4j:ro
      - meili_data:/data/meili:ro
      - redis_data:/data/redis:ro
      - ./backups:/backups
    command: >
      sh -c "
        tar czf /backups/all_data_$$(date +%Y%m%d_%H%M%S).tar.gz
        -C /data .
      "
```

```bash
docker compose --profile backup run --rm backup
```

## Permission issues with bind mounts

The most common source of "permission denied" errors:

### Problem
Container runs as a specific UID (e.g., neo4j runs as UID 7474). Bind-mounted directory owned by your host user (UID 1000). Container cannot write.

### Solutions

```yaml
# Solution 1: Match UIDs (set in Dockerfile or at runtime)
services:
  api:
    user: "1000:1000"          # Run as host user's UID:GID

# Solution 2: Fix permissions on host before starting
# (run once)
# sudo chown -R 7474:7474 ./neo4j-data

# Solution 3: Use named volumes (Docker handles permissions)
services:
  neo4j:
    volumes:
      - neo4j_data:/data       # Docker sets correct ownership automatically
```

### Why named volumes avoid this

When Docker creates a named volume and a container first uses it, Docker copies the container's directory permissions to the volume. This means the volume automatically has the correct UID/GID for the service.

## Anonymous volumes

Protect container directories from being overwritten by bind mounts:

```yaml
services:
  api:
    volumes:
      - ./src:/app/src              # Bind source for hot reload
      - /app/node_modules           # Anonymous volume — preserves container's node_modules
      - /app/dist                   # Preserves built output
```

Without the anonymous volume for `node_modules`, the bind mount of `./src` at `/app/src` would work, but if you mount `.:/app`, the host's (potentially empty) `node_modules` directory would shadow the container's installed dependencies.

## Volume drivers

For production environments that need network-attached storage:

```yaml
volumes:
  neo4j_data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=10.0.0.5,rw
      device: ":/exports/neo4j_data"

  # Or with a third-party driver
  shared_data:
    driver: rexray/ebs       # AWS EBS volumes
    driver_opts:
      size: 50               # GB
```

## Volume lifecycle

```bash
# List all volumes
docker volume ls

# Inspect a volume (see mount point, creation date)
docker volume inspect personal-ai_neo4j_data

# Remove unused volumes (CAUTION: data loss)
docker volume prune

# Remove specific volume (must not be in use)
docker volume rm personal-ai_neo4j_data

# Remove all project volumes (CAUTION: destroys all data)
docker compose down -v
```

## tmpfs mounts

For ephemeral data that should never be written to disk (secrets in memory, temp files):

```yaml
services:
  api:
    tmpfs:
      - /tmp                  # Fast in-memory tmp
      - /run/secrets          # Secrets that shouldn't persist
    volumes:
      - type: tmpfs
        target: /app/cache
        tmpfs:
          size: 100000000     # 100MB limit
```

## Performance optimization on macOS

Docker Desktop on macOS uses a Linux VM. File system access between host and VM is slow for bind mounts.

```yaml
services:
  api:
    volumes:
      # Consistency flags (Docker Desktop specific)
      - ./src:/app/src:cached          # Host authoritative (reads may be stale)
      - ./uploads:/app/uploads:delegated  # Container authoritative
      
      # Better: only mount what you need for hot reload
      - ./src:/app/src:cached
      - /app/node_modules              # Don't sync node_modules
      - /app/.next                     # Don't sync build output
```

For best performance on macOS:
1. Use named volumes for anything you don't need to edit from the host
2. Mount only specific subdirectories, not the entire project
3. Use `:cached` consistency for source code bind mounts
4. Keep `node_modules` in an anonymous volume
