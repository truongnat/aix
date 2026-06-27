# Backup & Recovery

Automated backup system for the Personal KB + Skill Hub data.

## Backup Schedule

A daily cron job runs at 2:00 AM UTC:

```
# /etc/cron.d/personal-ai-backup
0 2 * * * root /opt/personal-ai/scripts/backup.sh >> /var/log/personal-ai-backup.log 2>&1
```

## What Gets Backed Up

| Data | Location | Method |
|------|----------|--------|
| Neo4j database | Docker volume `personal-ai_neo4j_data` | Volume snapshot via `docker cp` |
| Meilisearch data | Docker volume `personal-ai_meili_data` | Volume snapshot via `docker cp` |
| Environment config | `/opt/personal-ai/.env` | File copy |
| Docker Compose config | `/opt/personal-ai/docker-compose.yml` | File copy (also in git) |

### What is NOT backed up

- Redis data (cache only, regenerated on startup)
- Docker images (rebuilt from source)
- Caddy certificates (auto-renewed)
- Application logs (rotated separately)

## Backup Script

Location: `/opt/personal-ai/scripts/backup.sh`

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/backups/personal-ai"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${DATE}"
RETENTION_DAYS=7

echo "=== Backup starting at $(date) ==="

# Create backup directory
mkdir -p "${BACKUP_PATH}"

# Stop API to ensure consistent state (Neo4j stays running)
cd /opt/personal-ai
docker compose stop api

# Backup Neo4j data
echo "Backing up Neo4j..."
docker compose exec -T neo4j neo4j-admin database dump neo4j --to-stdout > "${BACKUP_PATH}/neo4j-dump.backup" 2>/dev/null || {
    # Fallback: copy data directory
    echo "Dump failed, falling back to volume copy..."
    docker cp personal-ai-neo4j:/data "${BACKUP_PATH}/neo4j-data"
}

# Backup Meilisearch data
echo "Backing up Meilisearch..."
# Create a snapshot via API
curl -s -X POST http://localhost:7700/snapshots -H "Authorization: Bearer ${MEILI_MASTER_KEY}" || true
sleep 5
docker cp personal-ai-meili:/meili_data/dumps "${BACKUP_PATH}/meili-dumps" 2>/dev/null || \
docker cp personal-ai-meili:/meili_data "${BACKUP_PATH}/meili-data"

# Backup config files
echo "Backing up config..."
cp /opt/personal-ai/.env "${BACKUP_PATH}/env.backup"
cp /opt/personal-ai/docker-compose.yml "${BACKUP_PATH}/docker-compose.yml.backup"

# Restart API
docker compose start api

# Compress backup
echo "Compressing..."
tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "${DATE}"
rm -rf "${BACKUP_PATH}"

# Remove old backups (retention policy)
echo "Cleaning old backups..."
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

# Report
BACKUP_SIZE=$(du -sh "${BACKUP_PATH}.tar.gz" | cut -f1)
echo "=== Backup complete: ${BACKUP_PATH}.tar.gz (${BACKUP_SIZE}) ==="
echo "Backups retained: $(ls ${BACKUP_DIR}/*.tar.gz 2>/dev/null | wc -l)"
```

## Retention Policy

- **Retention period:** 7 days
- **Backup location:** `/opt/backups/personal-ai/`
- **Naming format:** `YYYYMMDD_HHMMSS.tar.gz`
- **Typical size:** 50-200MB depending on knowledge base size

### Checking backup status

```bash
# List recent backups
ls -lh /opt/backups/personal-ai/*.tar.gz

# Check last backup log
tail -30 /var/log/personal-ai-backup.log

# Check cron is scheduled
crontab -l | grep personal-ai
# or
cat /etc/cron.d/personal-ai-backup

# Verify backup integrity
tar -tzf /opt/backups/personal-ai/$(ls -t /opt/backups/personal-ai/ | head -1) | head -20
```

## Restore Procedures

### Full restore from backup

```bash
#!/bin/bash
# Usage: ./restore.sh /opt/backups/personal-ai/20260517_020000.tar.gz

BACKUP_FILE=$1
RESTORE_DIR="/tmp/personal-ai-restore"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

echo "WARNING: This will replace all current data!"
read -p "Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

# Extract backup
mkdir -p "${RESTORE_DIR}"
tar -xzf "${BACKUP_FILE}" -C "${RESTORE_DIR}"
BACKUP_NAME=$(ls "${RESTORE_DIR}")

cd /opt/personal-ai

# Stop all services
docker compose down

# Restore Neo4j
echo "Restoring Neo4j..."
docker volume rm personal-ai_neo4j_data 2>/dev/null || true
docker compose up -d neo4j
sleep 10  # Wait for Neo4j to initialize

if [ -f "${RESTORE_DIR}/${BACKUP_NAME}/neo4j-dump.backup" ]; then
    # Restore from dump
    docker compose exec -T neo4j neo4j-admin database load neo4j --from-stdin < "${RESTORE_DIR}/${BACKUP_NAME}/neo4j-dump.backup"
else
    # Restore from volume copy
    docker cp "${RESTORE_DIR}/${BACKUP_NAME}/neo4j-data/." personal-ai-neo4j:/data/
fi

docker compose restart neo4j
sleep 10

# Restore Meilisearch
echo "Restoring Meilisearch..."
docker compose up -d meilisearch
sleep 5
if [ -d "${RESTORE_DIR}/${BACKUP_NAME}/meili-data" ]; then
    docker compose stop meilisearch
    docker cp "${RESTORE_DIR}/${BACKUP_NAME}/meili-data/." personal-ai-meili:/meili_data/
    docker compose start meilisearch
fi

# Restore config (if needed)
echo "Restoring config..."
cp "${RESTORE_DIR}/${BACKUP_NAME}/env.backup" /opt/personal-ai/.env

# Start everything
docker compose up -d
sleep 15

# Verify
echo "Verifying restore..."
curl -s -o /dev/null -w "API: HTTP %{http_code}
" http://localhost:3456/auth/keys -H "x-master-password: ${MASTER_PASSWORD}"
curl -s -o /dev/null -w "Meilisearch: HTTP %{http_code}
" http://localhost:7700/health

# Cleanup
rm -rf "${RESTORE_DIR}"
echo "Restore complete!"
```

### Restore Neo4j only

```bash
cd /opt/personal-ai
docker compose stop api

# Find the backup
LATEST=$(ls -t /opt/backups/personal-ai/*.tar.gz | head -1)
mkdir -p /tmp/restore && tar -xzf "$LATEST" -C /tmp/restore

# Restore
docker compose restart neo4j
sleep 10
docker compose exec -T neo4j neo4j-admin database load neo4j --from-stdin < /tmp/restore/*/neo4j-dump.backup
docker compose restart neo4j
sleep 10

docker compose start api
rm -rf /tmp/restore
```

### Restore Meilisearch only

If Meilisearch data is corrupted, it's often faster to reindex from Neo4j:

```bash
# Option 1: Reindex from source (preferred)
curl -X POST http://localhost:3456/admin/reindex -H "x-master-password: ${MASTER_PASSWORD}"

# Option 2: Restore from backup
cd /opt/personal-ai
docker compose stop meilisearch
LATEST=$(ls -t /opt/backups/personal-ai/*.tar.gz | head -1)
mkdir -p /tmp/restore && tar -xzf "$LATEST" -C /tmp/restore
docker cp /tmp/restore/*/meili-data/. personal-ai-meili:/meili_data/
docker compose start meilisearch
rm -rf /tmp/restore
```

## Manual Backup (Before Risky Operations)

Before any major change, take a manual backup:

```bash
/opt/personal-ai/scripts/backup.sh
# Verify it completed
ls -lh /opt/backups/personal-ai/ | tail -3
```

## Offsite Backup (Optional)

To copy backups offsite:

```bash
# Sync latest backup to another server
LATEST=$(ls -t /opt/backups/personal-ai/*.tar.gz | head -1)
scp "$LATEST" user@backup-server:/backups/personal-ai/

# Or use rclone for cloud storage
rclone copy /opt/backups/personal-ai/ remote:personal-ai-backups/ --max-age 24h
```

## Disaster Recovery Checklist

If the VPS is completely lost:

1. Provision new VPS (Ubuntu 22.04+, 2GB+ RAM)
2. Install Docker and Docker Compose
3. Install Caddy
4. Clone repo: `git clone <repo-url> /opt/personal-ai`
5. Copy `.env` from backup or recreate from template
6. Set up Caddy config in `/etc/caddy/conf.d/kb.caddy`
7. `docker compose up -d`
8. Restore data from latest backup
9. Update DNS if IP changed
10. Verify health checks pass
