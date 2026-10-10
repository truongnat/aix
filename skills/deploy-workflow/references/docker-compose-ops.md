# Docker Compose Operations

Operations guide for the Personal KB + Skill Hub Docker Compose stack at `/opt/personal-ai`.

## Service Architecture

```
┌─────────────────────────────────────────────────┐
│  Caddy (host, port 80/443)                      │
│  reverse_proxy localhost:3456                    │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│  API (NestJS, port 3456)                        │
│  depends_on: neo4j, redis, meilisearch          │
└──────┬──────────────┬──────────────┬────────────┘
       │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│ Neo4j       │ │ Redis    │ │Meilisearch │
│ 7474, 7687  │ │ 6379     │ │ 7700       │
└─────────────┘ └──────────┘ └────────────┘
```

## Common Operations

### Start all services

```bash
cd /opt/personal-ai
docker compose up -d
```

Services start in dependency order: Neo4j and Redis first, then Meilisearch, then API.

### Stop all services

```bash
docker compose down
```

This stops and removes containers but preserves volumes (data intact).

**DANGER:** `docker compose down -v` removes volumes and ALL DATA. Never use without a verified backup.

### Restart a single service

```bash
# Restart API only (fastest for code-only changes with prebuilt image)
docker compose restart api

# Restart with recreation (picks up env/config changes)
docker compose up -d api

# Restart Neo4j (connections will drop briefly)
docker compose restart neo4j
```

### Rebuild the API image

```bash
# Standard rebuild (uses cache)
docker compose build api

# Full rebuild (no cache, for dependency changes)
docker compose build api --no-cache

# Build and restart in one command
docker compose up -d --build api
```

### View logs

```bash
# Follow all logs
docker compose logs -f

# Follow API logs only
docker compose logs -f api

# Last 50 lines from API
docker compose logs --tail=50 api

# Logs from last hour
docker compose logs --since=1h api

# Logs from all services, last 20 lines each
docker compose logs --tail=20
```

## Service-Specific Operations

### Neo4j

```bash
# Check Neo4j is accepting connections
docker compose exec neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" "RETURN 1 AS healthy"

# Run a Cypher query
docker compose exec neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" "MATCH (n) RETURN count(n)"

# Check Neo4j memory usage
docker compose exec neo4j cat /var/lib/neo4j/logs/neo4j.log | tail -20

# Access Neo4j Browser (if port exposed)
# http://localhost:7474

# Dump database for backup
docker compose exec neo4j neo4j-admin database dump neo4j --to-path=/backups/
```

**Memory settings** in docker-compose.yml:
```yaml
neo4j:
  environment:
    - NEO4J_server_memory_heap_initial__size=256m
    - NEO4J_server_memory_heap_max__size=512m
    - NEO4J_server_memory_pagecache_size=256m
  deploy:
    resources:
      limits:
        memory: 1g
```

### Meilisearch

```bash
# Check health
curl -s http://localhost:7700/health

# Check indexes
curl -s http://localhost:7700/indexes -H "Authorization: Bearer ${MEILI_MASTER_KEY}"

# Check index stats
curl -s http://localhost:7700/indexes/knowledge/stats -H "Authorization: Bearer ${MEILI_MASTER_KEY}"

# Trigger reindex (from API)
curl -X POST http://localhost:3456/admin/reindex -H "x-master-password: ${MASTER_PASSWORD}"

# Check Meilisearch tasks (for stuck indexing)
curl -s "http://localhost:7700/tasks?limit=5" -H "Authorization: Bearer ${MEILI_MASTER_KEY}"
```

### Redis

```bash
# Ping
docker compose exec redis redis-cli ping

# Check memory usage
docker compose exec redis redis-cli info memory | grep used_memory_human

# Check connected clients
docker compose exec redis redis-cli info clients | grep connected_clients

# Flush cache (if needed, non-destructive for this app)
docker compose exec redis redis-cli FLUSHDB

# Monitor commands in real-time (Ctrl+C to stop)
docker compose exec redis redis-cli monitor
```

### API (NestJS)

```bash
# Check if process is running inside container
docker compose exec api ps aux

# Check Node.js memory usage
docker compose exec api node -e "console.log(process.memoryUsage())"

# Enter container shell for debugging
docker compose exec api sh

# Check environment variables (redacted)
docker compose exec api env | grep -v PASSWORD | grep -v SECRET | grep -v KEY | sort
```

## Deployment Sequences

### Standard code deploy

```bash
cd /opt/personal-ai
git pull origin main
docker compose build api
docker compose up -d api
sleep 10
curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/auth/keys -H "x-master-password: ${MASTER_PASSWORD}"
```

### Full stack restart

```bash
cd /opt/personal-ai
docker compose down
docker compose up -d
sleep 15  # Neo4j needs time to start
docker compose ps
```

### Emergency rollback

```bash
cd /opt/personal-ai
git log --oneline -10  # Find the last good commit
git checkout <commit-hash>
docker compose build api
docker compose up -d api
sleep 10
# Verify health
curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/auth/keys -H "x-master-password: ${MASTER_PASSWORD}"
```

## Maintenance Commands

### Disk cleanup

```bash
# Remove unused images (safe)
docker image prune -f

# Remove build cache
docker builder prune -f

# Full cleanup (removes all unused images, not just dangling)
# WARNING: Will need to rebuild on next deploy
docker system prune -a -f

# Check what's using space
docker system df -v
```

### Update base images

```bash
cd /opt/personal-ai
docker compose pull neo4j meilisearch redis
docker compose up -d
```

### Check for container resource limits

```bash
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

## Environment Variables

The stack uses a `.env` file at `/opt/personal-ai/.env`. Key variables:

| Variable | Service | Purpose |
|----------|---------|---------|
| `MASTER_PASSWORD` | API | Admin authentication |
| `NEO4J_PASSWORD` | Neo4j, API | Database authentication |
| `MEILI_MASTER_KEY` | Meilisearch, API | Search engine auth |
| `REDIS_URL` | API | Redis connection string |
| `GITHUB_TOKEN` | Deploy scripts | Private repo access |
| `NODE_ENV` | API | Should be "production" |

After changing `.env`, recreate affected services:

```bash
docker compose up -d api  # Recreates with new env
```

## Docker Compose File Location

Main file: `/opt/personal-ai/docker-compose.yml`

If override is needed: `/opt/personal-ai/docker-compose.override.yml` (not committed to git)
