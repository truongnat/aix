# VPS Health Checks

Health check procedures for the Personal KB + Skill Hub at dev.truongsoftware.com.

## Primary Health Endpoint

The API exposes `/auth/keys` as the primary health check endpoint. It requires the master password header for authentication.

### Internal check (from VPS)

```bash
curl -s -w "
HTTP %{http_code} | Time: %{time_total}s
" \
  http://localhost:3456/auth/keys \
  -H "x-master-password: ${MASTER_PASSWORD}"
```

Expected response: HTTP 200 with JSON body containing key data.

### External check (from anywhere)

```bash
curl -s -w "
HTTP %{http_code} | Time: %{time_total}s
" \
  https://dev.truongsoftware.com/auth/keys \
  -H "x-master-password: ${MASTER_PASSWORD}"
```

Expected: HTTP 200, response time under 500ms. If over 1000ms, investigate.

### Quick status check (no auth)

```bash
# Just check if the port is responding
curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/
```

A 401 or 403 means the API is running but auth is required. A connection refused means the API is down.

## Docker Container Status

### Check all services

```bash
cd /opt/personal-ai
docker compose ps
```

Expected output:

```
NAME                IMAGE                      STATUS          PORTS
personal-ai-api    personal-ai-api:latest     Up 2 hours      0.0.0.0:3456->3456/tcp
personal-ai-neo4j  neo4j:5                    Up 2 hours      7474/tcp, 7687/tcp
personal-ai-meili  getmeili/meilisearch:v1    Up 2 hours      0.0.0.0:7700->7700/tcp
personal-ai-redis  redis:7-alpine             Up 2 hours      6379/tcp
```

All services must show "Up". If any show "Restarting" or "Exit", investigate immediately.

### Check container health individually

```bash
# Neo4j
docker compose exec neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" "RETURN 1"

# Meilisearch
curl -s http://localhost:7700/health
# Expected: {"status":"available"}

# Redis
docker compose exec redis redis-cli ping
# Expected: PONG

# API
curl -s http://localhost:3456/auth/keys -H "x-master-password: ${MASTER_PASSWORD}" | head -c 100
```

## Log Patterns to Watch

### Healthy startup logs (API)

```bash
docker compose logs --tail=30 api
```

Look for:
- `Nest application successfully started`
- `Listening on port 3456`
- No repeated error lines

### Warning patterns

| Pattern | Meaning | Action |
|---------|---------|--------|
| `ECONNREFUSED` to Neo4j | Database not ready yet | Wait 10s, retry; if persists, check Neo4j logs |
| `ECONNREFUSED` to Redis | Redis not started | Check Redis container |
| `heap out of memory` | Node.js OOM | Increase `NODE_OPTIONS=--max-old-space-size` |
| `Neo4j connection pool exhausted` | Too many concurrent queries | Restart API, check for connection leaks |
| `SIGTERM` then restart | Container crashed and restarted | Check logs before SIGTERM for root cause |

### Error log filtering

```bash
# Last 100 lines with errors only
docker compose logs --tail=100 api 2>&1 | grep -iE "error|exception|fatal|critical"

# Errors in the last hour
docker compose logs --since=1h api 2>&1 | grep -iE "error|exception"
```

## Caddy Status

```bash
# Check Caddy is running
systemctl status caddy

# Check Caddy can reach the API
curl -s -H "Host: dev.truongsoftware.com" http://localhost:80/auth/keys -H "x-master-password: ${MASTER_PASSWORD}"

# Check SSL certificate validity
echo | openssl s_client -connect dev.truongsoftware.com:443 -servername dev.truongsoftware.com 2>/dev/null | openssl x509 -noout -dates
```

## Resource Checks

```bash
# Disk space (alert at 85%)
df -h / | awk 'NR==2 {print "Disk usage: " $5}'

# Memory usage
free -h | awk '/^Mem:/ {print "Memory: " $3 " used / " $2 " total"}'

# Docker disk usage
docker system df

# Top resource-consuming containers
docker stats --no-stream --format "table {{.Name}}	{{.CPUPerc}}	{{.MemUsage}}"
```

## Automated Health Check Script

Location on VPS: `/opt/personal-ai/scripts/health-check.sh`

```bash
#!/bin/bash
# Quick health check - exits non-zero if unhealthy

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3456/auth/keys -H "x-master-password: ${MASTER_PASSWORD}")
MEILI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7700/health)
REDIS_STATUS=$(docker compose exec -T redis redis-cli ping 2>/dev/null)

HEALTHY=true

if [ "$API_STATUS" != "200" ]; then
  echo "FAIL: API returned $API_STATUS"
  HEALTHY=false
fi

if [ "$MEILI_STATUS" != "200" ]; then
  echo "FAIL: Meilisearch returned $MEILI_STATUS"
  HEALTHY=false
fi

if [ "$REDIS_STATUS" != "PONG" ]; then
  echo "FAIL: Redis not responding"
  HEALTHY=false
fi

if [ "$HEALTHY" = true ]; then
  echo "OK: All services healthy"
  exit 0
else
  exit 1
fi
```

## Monitoring Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| API response time | >500ms | >2000ms |
| Disk usage | >85% | >95% |
| Memory usage | >80% | >90% |
| Container restarts (24h) | >2 | >5 |
| Neo4j heap usage | >70% | >85% |
| Error rate (per minute) | >5 | >20 |
