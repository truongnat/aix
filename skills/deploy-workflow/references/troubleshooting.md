# Troubleshooting

Common issues and resolution guides for the Personal KB + Skill Hub production environment.

## Neo4j Out of Memory (OOM)

**Symptoms:**
- Neo4j container shows "Exit 137" (killed by OOM)
- API logs show "Connection refused" to Neo4j
- `docker compose logs neo4j` shows heap errors

**Diagnosis:**

```bash
# Check if Neo4j was OOM-killed
docker inspect personal-ai-neo4j --format='{{.State.OOMKilled}}'

# Check system memory at time of crash
dmesg | grep -i "oom\|killed" | tail -10

# Current memory state
free -h
docker stats --no-stream
```

**Resolution:**

1. Adjust memory settings in `docker-compose.yml`:

```yaml
neo4j:
  environment:
    - NEO4J_server_memory_heap_initial__size=256m
    - NEO4J_server_memory_heap_max__size=512m
    - NEO4J_server_memory_pagecache_size=128m
  deploy:
    resources:
      limits:
        memory: 1g
```

2. Apply changes:
```bash
docker compose up -d neo4j
```

3. If the VPS has insufficient RAM overall, consider reducing other services or upgrading the VPS.

**Prevention:** Monitor memory with `docker stats`. Keep total allocated memory across all containers under 80% of VPS RAM.

## Meilisearch Needs Reindex

**Symptoms:**
- Search returns stale or missing results
- Meilisearch health is OK but queries return empty
- After restore, search data is outdated

**Diagnosis:**

```bash
# Check Meilisearch health
curl -s http://localhost:7700/health

# Check index document count
curl -s http://localhost:7700/indexes/knowledge/stats -H "Authorization: Bearer ${MEILI_MASTER_KEY}"

# Check for failed tasks
curl -s "http://localhost:7700/tasks?statuses=failed&limit=5" -H "Authorization: Bearer ${MEILI_MASTER_KEY}"
```

**Resolution:**

```bash
# Trigger full reindex from the API
curl -X POST http://localhost:3456/admin/reindex \
  -H "x-master-password: ${MASTER_PASSWORD}"

# Monitor reindex progress
watch -n 5 'curl -s "http://localhost:7700/tasks?limit=3" -H "Authorization: Bearer ${MEILI_MASTER_KEY}" | python3 -m json.tool | head -30'
```

If reindex endpoint doesn't exist, restart the API (it may reindex on startup):
```bash
docker compose restart api
```

## Redis Connection Refused

**Symptoms:**
- API logs: `ECONNREFUSED 127.0.0.1:6379` or `redis://redis:6379`
- API fails to start or cache operations fail

**Diagnosis:**

```bash
# Check Redis container
docker compose ps redis
docker compose logs --tail=20 redis

# Test Redis directly
docker compose exec redis redis-cli ping

# Check if port is bound
docker compose exec redis ss -tlnp | grep 6379
```

**Resolution:**

1. If container is stopped:
```bash
docker compose up -d redis
sleep 3
docker compose restart api
```

2. If container is in restart loop:
```bash
docker compose logs --tail=50 redis
# Common cause: corrupt append-only file
docker compose stop redis
# Remove corrupted data (Redis is cache-only, safe to delete)
docker volume rm personal-ai_redis_data
docker compose up -d redis
sleep 3
docker compose restart api
```

3. If network issue between containers:
```bash
# Verify containers are on same network
docker network inspect personal-ai_default

# Restart the network
docker compose down
docker compose up -d
```

## Port Conflicts

**Symptoms:**
- Container fails to start with "port already in use"
- Another project on the VPS is using the same port

**Diagnosis:**

```bash
# Find what's using a port
ss -tlnp | grep :3456
ss -tlnp | grep :7700
ss -tlnp | grep :7687

# Or with lsof
lsof -i :3456
```

**Resolution:**

1. If another project is using the port, change the port mapping in `docker-compose.yml`:
```yaml
api:
  ports:
    - "3456:3456"  # Change the left side if host port is taken
```

2. If a zombie container is holding the port:
```bash
docker ps -a | grep 3456
docker rm -f <container-id>
docker compose up -d
```

3. If the portfolio project (port 3000) conflicts, the API was already moved to 3456 for this reason. Verify with:
```bash
grep -r "3456" /opt/personal-ai/docker-compose.yml
```

## API Not Starting

**Symptoms:**
- Container starts but exits immediately
- Health check fails
- `docker compose ps` shows API as "Restarting"

**Diagnosis:**

```bash
# Check exit code
docker compose ps api

# Read startup logs
docker compose logs --tail=100 api

# Common patterns to look for:
docker compose logs api 2>&1 | grep -iE "error|cannot find|module not found|enoent|permission denied"
```

**Common causes and fixes:**

### Missing environment variables
```bash
# Check .env file exists and has required vars
cat /opt/personal-ai/.env | grep -v "^#" | grep -v "^$"
# Must have: MASTER_PASSWORD, NEO4J_PASSWORD, MEILI_MASTER_KEY, REDIS_URL
```

### Node modules issue
```bash
# Rebuild from scratch
docker compose build api --no-cache
docker compose up -d api
```

### TypeScript compilation error
```bash
# Check for build errors in logs
docker compose logs api 2>&1 | grep -A5 "error TS"
# Fix: check the code on the branch, may need to revert
```

### Dependencies not ready
```bash
# Neo4j takes 10-15s to start. API may fail if it connects too early.
# Check if Neo4j is ready:
docker compose exec neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" "RETURN 1"
# If not ready, wait and restart API:
sleep 15
docker compose restart api
```

## Caddy Not Routing

**Symptoms:**
- External HTTPS requests return 502 or timeout
- Internal `curl localhost:3456` works but `curl https://dev.truongsoftware.com` doesn't

**Diagnosis:**

```bash
# Check Caddy is running
systemctl status caddy

# Check Caddy config is valid
caddy validate --config /etc/caddy/Caddyfile

# Check Caddy can reach the API
curl -v http://localhost:3456/auth/keys -H "x-master-password: ${MASTER_PASSWORD}"

# Check Caddy logs for errors
journalctl -u caddy --since="30 minutes ago" | grep -i error

# Check DNS
dig +short dev.truongsoftware.com
# Must return: 62.146.238.102
```

**Resolution:**

1. If Caddy is stopped:
```bash
systemctl start caddy
```

2. If config is invalid:
```bash
caddy validate --config /etc/caddy/Caddyfile
# Fix errors in /etc/caddy/conf.d/kb.caddy
systemctl reload caddy
```

3. If DNS is wrong:
- Update A record at domain registrar to point to 62.146.238.102
- Wait for propagation (check with `dig +short dev.truongsoftware.com @8.8.8.8`)

4. If firewall is blocking:
```bash
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
systemctl reload caddy
```

## Disk Space Full

**Symptoms:**
- Builds fail with "no space left on device"
- Containers crash unexpectedly
- Backup script fails

**Diagnosis:**

```bash
df -h /
du -sh /var/lib/docker/
du -sh /opt/backups/
du -sh /var/log/
```

**Resolution:**

```bash
# Clean Docker (safe operations first)
docker image prune -f
docker builder prune -f
docker container prune -f

# If still tight, remove unused volumes (CAREFUL)
docker volume ls -f dangling=true
docker volume prune -f  # Only removes volumes not attached to containers

# Clean old logs
journalctl --vacuum-time=3d
find /var/log -name "*.gz" -mtime +7 -delete

# Clean old backups beyond retention
find /opt/backups/personal-ai -name "*.tar.gz" -mtime +7 -delete

# Nuclear option for Docker (will need rebuild)
docker system prune -a -f --volumes  # DANGER: removes all unused data
```

## High CPU Usage

**Symptoms:**
- VPS is slow/unresponsive
- API response times are high

**Diagnosis:**

```bash
# Find the culprit
docker stats --no-stream
top -b -n 1 | head -20

# If Neo4j is the issue
docker compose logs --tail=50 neo4j | grep -i "slow\|long running"
```

**Resolution:**

- If Neo4j: check for expensive queries, add indexes, reduce concurrent operations
- If API: check for infinite loops in recent code changes, restart
- If Meilisearch: likely indexing; wait for it to complete

```bash
# Quick fix: restart the high-CPU container
docker compose restart <service-name>
```

## General Recovery Procedure

When you don't know what's wrong:

```bash
# 1. Check everything
cd /opt/personal-ai
docker compose ps
docker compose logs --tail=10
df -h /
free -h

# 2. If containers are down, bring them up
docker compose up -d
sleep 15

# 3. Verify
curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/auth/keys -H "x-master-password: ${MASTER_PASSWORD}"

# 4. If still broken, full restart
docker compose down
docker compose up -d
sleep 20

# 5. If STILL broken, check git for bad commit
git log --oneline -5
git diff HEAD~1 --stat  # What changed?
# Consider rollback if recent commit is the issue
```
