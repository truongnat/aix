# Monitoring & Logging

## System metrics

### Disk space

```bash
# Overall disk usage
df -h /

# Per-directory usage
du -sh /opt/* /var/log/* /var/lib/docker/

# Alert threshold
AVAILABLE=$(df / | tail -1 | awk '{print $4}')
TOTAL=$(df / | tail -1 | awk '{print $2}')
USED_PERCENT=$((100 * (TOTAL - AVAILABLE) / TOTAL))
if [ $USED_PERCENT -gt 80 ]; then
    echo "ALERT: Disk usage at ${USED_PERCENT}%"
fi
```

### Memory

```bash
# Current memory state
free -h

# Per-container
docker stats --no-stream

# Alert if any container is using >50% of available memory
docker stats --no-stream --format "table {{.Container}}	{{.MemPerc}}"
```

### CPU

```bash
# System CPU
top -b -n 1 | head -20

# Container CPU (running average)
docker stats --no-stream

# If consistently >80%, consider:
# - Database indexes (Neo4j query performance)
# - Number of concurrent operations
# - Memory pressure causing swapping
```

## Docker logging

### Real-time logs

```bash
# Follow API logs
docker compose logs -f api

# Last 100 lines
docker compose logs --tail=100 api

# All services
docker compose logs -f

# Specific timeframe
docker compose logs --since 30m api
```

### Log levels and filtering

```bash
# Filter for ERROR only
docker compose logs api 2>&1 | grep -i error

# Filter for ERROR or WARN
docker compose logs api 2>&1 | grep -iE "error|warn"

# Last N lines containing a pattern
docker compose logs api 2>&1 | grep "Neo4j" | tail -20
```

### Service-specific logging

```bash
# Neo4j logs (container output)
docker compose logs --tail=50 neo4j

# Neo4j internal logs (more detailed)
docker compose exec neo4j cat /var/log/neo4j/neo4j.log | tail -50

# Meilisearch logs
docker compose logs meilisearch

# Redis logs (usually minimal)
docker compose logs redis
```

## Systemd journalctl

For system-level services (Caddy, Cron):

```bash
# Caddy logs (reverse proxy)
journalctl -u caddy -n 50 --no-pager
journalctl -u caddy -f                    # Follow
journalctl -u caddy --since "2 hours ago" # Time range
journalctl -u caddy --until "1 hour ago"

# Filter for errors
journalctl -u caddy -p err

# Cron logs
journalctl -u cron -n 20
grep CRON /var/log/auth.log | tail -10
```

## Application-level health checks

### Endpoint-based monitoring

```bash
#!/bin/bash
# /opt/personal-ai/scripts/health-check.sh

echo "=== Health check at $(date) ==="

# API
if curl -sf http://localhost:3456/health > /dev/null; then
    echo "✓ API healthy"
else
    echo "✗ API unhealthy — restarting"
    docker compose restart api
    sleep 10
    curl -s http://localhost:3456/health | jq
fi

# Neo4j
if docker compose exec -T neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" "RETURN 1" &>/dev/null; then
    echo "✓ Neo4j healthy"
else
    echo "✗ Neo4j unhealthy — check memory and restart if needed"
fi

# Meilisearch
if curl -sf http://localhost:7700/health > /dev/null; then
    echo "✓ Meilisearch healthy"
else
    echo "✗ Meilisearch unhealthy — restart"
    docker compose restart meilisearch
fi

# Redis
if docker compose exec -T redis redis-cli ping | grep -q PONG; then
    echo "✓ Redis healthy"
else
    echo "✗ Redis unhealthy — restart"
    docker compose restart redis
fi

echo "=== End health check ==="
```

Run this every 5 minutes via cron:

```bash
# /etc/cron.d/personal-ai-health
*/5 * * * * root /opt/personal-ai/scripts/health-check.sh >> /var/log/personal-ai-health.log 2>&1
```

## Log aggregation (optional)

For production with multiple VPS instances:

### Centralized logging with rsyslog

```bash
# On each VPS — send logs to a central syslog server
echo "*.*  @syslog-server.example.com:514" >> /etc/rsyslog.d/30-forward.conf
systemctl restart rsyslog

# Then query centrally
ssh syslog-server
tail -f /var/log/remote/personal-ai-*.log
```

### Docker driver for centralized logs

```yaml
# docker-compose.yml
services:
  api:
    logging:
      driver: syslog
      options:
        syslog-address: "udp://syslog-server:514"
        syslog-facility: "local0"
        tag: "api"
```

## Alerting thresholds

Create a monitoring script to catch problems before they escalate:

```bash
#!/bin/bash
# /opt/personal-ai/scripts/monitor.sh

set -euo pipefail

ALERT_EMAIL="truongdq.dev@gmail.com"
ALERT_FILE="/tmp/personal-ai-alerts.txt"
echo "" > "$ALERT_FILE"

# Disk space > 80%
DISK_USAGE=$(df / | tail -1 | awk '{print int(100 * ($3) / ($2))}')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERT: Disk usage at ${DISK_USAGE}%" >> "$ALERT_FILE"
fi

# Memory available < 20%
MEM_AVAIL=$(free | grep Mem | awk '{print int(100 * $7 / $2)}')
if [ $MEM_AVAIL -lt 20 ]; then
    echo "ALERT: Only ${MEM_AVAIL}% memory available" >> "$ALERT_FILE"
fi

# Swap in use > 50%
SWAP_USED=$(free | grep Swap | awk '{if ($2 > 0) print int(100 * $3 / $2); else print 0}')
if [ $SWAP_USED -gt 50 ]; then
    echo "ALERT: Swap at ${SWAP_USED}% (system under memory pressure)" >> "$ALERT_FILE"
fi

# Load average > 4 (on single core)
LOAD=$(uptime | awk '{print $(NF-2)}' | sed 's/,//')
if (( $(echo "$LOAD > 4" | bc -l) )); then
    echo "ALERT: Load average at ${LOAD}" >> "$ALERT_FILE"
fi

# API not responding
if ! curl -sf http://localhost:3456/health > /dev/null 2>&1; then
    echo "ALERT: API health check failed" >> "$ALERT_FILE"
fi

# Neo4j not responding
if ! docker compose exec -T neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" "RETURN 1" &>/dev/null; then
    echo "ALERT: Neo4j not responding" >> "$ALERT_FILE"
fi

# Check if any alerts were generated
if [ -s "$ALERT_FILE" ]; then
    echo "Alerts generated at $(date):"
    cat "$ALERT_FILE"
    
    # Email alerts (requires mail/postfix configured)
    # mail -s "Personal AI alerts" "$ALERT_EMAIL" < "$ALERT_FILE"
fi
```

Schedule it to run every 10 minutes:

```bash
# /etc/cron.d/personal-ai-monitor
*/10 * * * * root /opt/personal-ai/scripts/monitor.sh
```

## Rotating logs

Prevent logs from consuming all disk space:

```bash
# /etc/logrotate.d/personal-ai
/var/log/personal-ai*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}

# Test rotation
logrotate -f /etc/logrotate.d/personal-ai
ls -la /var/log/personal-ai*
```

## Database monitoring

### Neo4j

```bash
# Database size
docker compose exec -T neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" \
  "CALL dbms.store.info() YIELD storeName, location, size RETURN storeName, location, size"

# Number of nodes and relationships
docker compose exec -T neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" \
  "MATCH (n) RETURN labels(n)[0], count(*) RETURN labels, count(*)"

# Slow queries
docker compose exec -T neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD}" \
  "CALL dbms.queryData.topQueries('ELAPSED', 10)"
```

### Meilisearch

```bash
# Index stats
curl -s http://localhost:7700/indexes/knowledge/stats -H "Authorization: Bearer ${MEILI_MASTER_KEY}" | jq

# Task queue (indexing progress)
curl -s "http://localhost:7700/tasks?limit=5&statuses=enqueued,processing" \
  -H "Authorization: Bearer ${MEILI_MASTER_KEY}" | jq
```

## Caddy monitoring

```bash
# Check certificate validity
echo | openssl s_client -connect dev.truongsoftware.com:443 -servername dev.truongsoftware.com 2>/dev/null | \
  openssl x509 -noout -dates

# Check Caddy access logs for 4xx/5xx
tail -1000 /var/log/caddy/kb-access.log | grep -E '"status":[45]' | jq -r '.status' | sort | uniq -c

# Monitor for certificate renewal errors
journalctl -u caddy | grep -i "acme\\|certificate\\|renewal"
```

## Monitoring dashboard (optional)

For a simple web-based dashboard, use **Portainer** or **Watchtower**:

```yaml
# In your docker-compose.yml
services:
  portainer:
    image: portainer/portainer-ce:latest
    ports:
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - portainer_data:/data

volumes:
  portainer_data:
```

Access at `http://localhost:9000` (secure it with Caddy).
"