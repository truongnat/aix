# Anti-patterns

## 1. Running everything as root

### Bad
```bash
# /opt/personal-ai/docker-compose.yml
services:
  api:
    build: .
    # No user specified — runs as root (UID 0) inside container
    # If container is compromised, attacker has root access
```

### Good
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci

# Create non-root user
RUN addgroup -g 1001 nodejs
RUN adduser -D -u 1001 -G nodejs nodejs
USER nodejs

CMD ["node", "dist/main.js"]
```

### Why it matters
- Compromised container running as root can modify the host
- Can access sensitive files outside its intended directories
- No process isolation from the host
- Against Docker security best practices

## 2. No firewall (all ports exposed)

### Bad
```bash
# /etc/ufw/before.rules — empty, firewall disabled
ufw disable

# Result: Anyone on the internet can access:
# - Neo4j admin UI (port 7474)
# - Meilisearch (port 7700)
# - Redis (port 6379)
# - SSH (port 22) — brute force attack surface
```

### Good
```bash
# Setup UFW
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Essential rules only
ufw allow ssh
ufw limit ssh                # Rate limit
ufw allow 80/tcp             # Caddy ACME
ufw allow 443/tcp            # HTTPS

ufw --force enable
```

### Why it matters
- Default deny + explicit rules (principle of least privilege)
- Databases are admin-only tools, never exposed to internet
- SSH rate limiting prevents brute force
- Port 80/443 only because Caddy needs them for ACME

## 3. No SSH key, password-only authentication

### Bad
```bash
# On VPS — anyone who guesses your password gains access
PasswordAuthentication yes
PubkeyAuthentication no
```

### Good
```bash
# /etc/ssh/sshd_config
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password  # Root can only use keys
MaxAuthTries 3
LoginGraceTime 30
```

### Why it matters
- Passwords are guessable (brute force, dictionary attacks)
- SSH keys are cryptographically secure
- Rate limiting + key-only login makes SSH safe
- No password = no password to leak

## 4. No unattended-upgrades (security patches pile up)

### Bad
```bash
# VPS hasn't been updated in 6 months
apt update
apt list --upgradable
# Output: 150+ packages need security updates
# Running unpatched OpenSSL, Linux kernel, etc.
```

### Good
```bash
# Set up automatic security updates
apt-get install unattended-upgrades

# Enable
echo 'APT::Periodic::Update-Package-Lists "1";' >> /etc/apt/apt.conf.d/20auto-upgrades
echo 'APT::Periodic::Unattended-Upgrade "1";' >> /etc/apt/apt.conf.d/20auto-upgrades

# Verify
systemctl enable apt-daily.timer apt-daily-upgrade.timer
systemctl status apt-daily.timer
```

### Why it matters
- Critical CVEs are patched within days of disclosure
- Manual updates are forgotten or delayed
- Automatic updates run during low-traffic hours
- If a patch breaks something, you have backups to recover

## 5. Untested backups

### Bad
```bash
# Backup cron runs every night
0 2 * * * /opt/personal-ai/scripts/backup.sh >> /dev/null 2>&1

# But nobody ever tested if restore works
# Disaster happens, restore fails, data lost
```

### Good
```bash
# Backup + monthly restore test
0 2 * * * /opt/personal-ai/scripts/backup.sh >> /var/log/backup.log 2>&1
0 3 1 * * /opt/personal-ai/scripts/restore-test.sh >> /var/log/restore-test.log 2>&1

# Restore test script
#!/bin/bash
# Extract latest backup
# Restore to /tmp on a separate Neo4j instance
# Verify data is present
# Clean up
echo "Test restore succeeded" | mail -s "Monthly restore test" ops@example.com
```

### Why it matters
- Backups are only useful if they can be restored
- Corrupted backups discovered too late
- Restore procedure may have changed since last test
- Monthly test gives confidence in disaster recovery

## 6. Manual deployments (drift, human error)

### Bad
```bash
# Deploy process:
# 1. ssh to VPS
# 2. git pull
# 3. npm install
# 4. npm run build
# 5. Manually edit docker-compose.yml
# 6. docker compose restart api
# 7. Hope everything works

# On next deploy, you forget step 5, deployment fails
# Or you accidentally changed something and forgot to commit
```

### Good
```bash
# Automated deploy script
#!/bin/bash
set -euo pipefail
git pull
git status --porcelain | grep -q . && { echo "ERROR: uncommitted changes"; exit 1; }
docker compose build api
docker compose up -d --no-deps api
sleep 10
curl -sf http://localhost:3456/health || { echo "ERROR: health check failed"; exit 1; }
echo "Deploy successful"

# Deploy:
/opt/personal-ai/scripts/deploy.sh
```

### Why it matters
- Scripted process is repeatable and auditable
- Catches errors before they hit production
- Health checks verify the deploy succeeded
- Git status ensures code is committed (no surprise local changes)

## 7. No health checks (deploy completes but service is down)

### Bad
```bash
# Deploy finishes, API container starts
docker compose restart api
echo "Deploy complete"

# But API crashed on startup due to missing env var
# Container keeps restarting, health check fails
# You don't realize this until users complain
```

### Good
```bash
#!/bin/bash
set -euo pipefail

echo "Waiting for API to be healthy..."
for i in {1..30}; do
    if curl -sf http://localhost:3456/health > /dev/null; then
        echo "✓ API is healthy"
        exit 0
    fi
    echo "Attempt $i/30 — waiting for API..."
    sleep 2
done

echo "ERROR: API failed to become healthy after 60 seconds"
docker compose logs --tail=50 api
exit 1
```

### Why it matters
- Deploy is only complete when the service is actually working
- Health check catches startup errors immediately
- Fail fast — don't declare victory prematurely
- Logs are available if the check fails

## 8. Exposing sensitive ports to the internet

### Bad
```yaml
services:
  neo4j:
    ports:
      - "7474:7474"      # Neo4j Browser (admin UI) — accessible to anyone
      - "7687:7687"      # Bolt protocol — accessible to anyone

  meilisearch:
    ports:
      - "7700:7700"      # No authentication by default

  redis:
    ports:
      - "6379:6379"      # No encryption, weak password
```

### Good
```yaml
services:
  neo4j:
    # NO ports exposed
    expose:
      - "7687"           # Internal only — documented but not exposed

  meilisearch:
    expose:
      - "7700"           # Internal only

  redis:
    expose:
      - "6379"           # Internal only

  # All accessed through reverse proxy (Caddy) with auth
```

### Why it matters
- Neo4j admin UI has no authentication — anyone can browse/modify the graph
- Redis has weak authentication — password-only, no encryption
- Databases should NEVER be accessible from the internet
- Access through a reverse proxy with proper auth

## 9. Large volumes without pruning

### Bad
```bash
# Docker volumes accumulate over months
docker volume ls | wc -l
# 250+ orphaned volumes

# Disk space fills up
df -h | grep /var
# 98% full

# No backups because disk is full
```

### Good
```bash
# Monthly cleanup
# 1. Remove dangling volumes (not attached to any container)
docker volume prune -f

# 2. Remove old images
docker image prune -a --filter "until=720h"

# 3. Check disk space regularly
df -h / | tail -1

# 4. Alert if >80%
USED=$(df / | tail -1 | awk '{print int($5)}')
if [ $USED -gt 80 ]; then
    echo "ALERT: Disk at ${USED}%"
fi
```

### Why it matters
- Docker artifacts accumulate (images, volumes, build caches)
- Disk full breaks backups, builds, and Docker operations
- Pruning is safe (recreates what's needed)
- Monitoring prevents surprises

## 10. No rate limiting on SSH

### Bad
```bash
# SSH allows unlimited login attempts
ufw allow ssh
# Result: Brute force attacks, logs filled with failed attempts
```

### Good
```bash
# Rate limit to 6 connections in 30 seconds
ufw limit ssh

# Fail2ban for additional protection
apt-get install fail2ban
# Configure to block IPs after 5 failed attempts
```

### Why it matters
- Without rate limiting, attackers can try thousands of passwords
- With rate limiting, they're locked out after 6 attempts
- Fail2ban auto-bans IPs with repeated failed attempts
- SSH becomes an acceptable risk
"