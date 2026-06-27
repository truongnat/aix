# Backup Automation

## Daily Backup Cron Script

Create `/opt/personal-ai/scripts/backup.sh` (executable):

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/personal-ai/backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup Neo4j
docker compose exec neo4j neo4j-admin database dump neo4j --to-path=/var/lib/neo4j/backups
docker cp neo4j:/var/lib/neo4j/backups "$BACKUP_DIR/neo4j_$TIMESTAMP"

# Backup Meilisearch data
docker cp meilisearch:/meili_data "$BACKUP_DIR/meilisearch_$TIMESTAMP"

# Create archive
cd "$BACKUP_DIR"
tar -czf "backup_$TIMESTAMP.tar.gz" neo4j_$TIMESTAMP meilisearch_$TIMESTAMP
rm -rf neo4j_$TIMESTAMP meilisearch_$TIMESTAMP

# Retention: keep last N days
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $TIMESTAMP"
```

## Cron Job

Add to root's crontab (`crontab -e`):

```
0 2 * * * /opt/personal-ai/scripts/backup.sh >> /var/log/kb-backup.log 2>&1
```

This runs daily at 2 AM, logging output to `/var/log/kb-backup.log`.

## Offsite Backup

Copy to S3:

```bash
# Add to backup.sh after tar creation
aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" s3://my-backup-bucket/personal-ai/

# Or rsync to another server
rsync -avz "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" backup-server:/backups/
```

## Restore Procedure

```bash
# List backups
ls -lh /opt/personal-ai/backups/

# Extract specific backup
cd /tmp
tar -xzf /opt/personal-ai/backups/backup_20240517_020000.tar.gz

# Stop containers
docker compose down

# Restore Neo4j
docker cp neo4j_20240517_020000 neo4j:/var/lib/neo4j/backups
docker compose up -d neo4j
docker compose exec neo4j neo4j-admin database load neo4j --from-path=/var/lib/neo4j/backups

# Restore Meilisearch
docker cp meilisearch_20240517_020000 meilisearch:/meili_data
docker compose up -d meilisearch

# Restart other services
docker compose up -d
```

## Verification

Test a restore periodically to ensure backups are valid:

```bash
# Monthly restore test
bash /opt/personal-ai/scripts/backup.sh
cd /tmp && tar -tzf /opt/personal-ai/backups/backup_latest.tar.gz | head -20

# Verify backup size (should be > 100MB for Neo4j + Meilisearch)
du -h /opt/personal-ai/backups/
```
