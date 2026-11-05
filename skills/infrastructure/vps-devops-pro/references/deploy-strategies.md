# Deploy Strategies

## Git-pull deployment (single VPS pattern)

The simplest and most practical for single-server deployments.

### Setup

```bash
# On the VPS, clone the repo into /opt/personal-ai
cd /opt
git clone https://github.com/yourusername/personal-ai.git
cd personal-ai

# Ensure docker-compose.yml is versioned
git status | grep docker-compose.yml  # Should show nothing (it's tracked)
```

### Deploy script

Create `/opt/personal-ai/scripts/deploy.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Deploy script for Personal KB + Skill Hub
# Usage: ./scripts/deploy.sh [branch]

BRANCH=${1:-main}
PROJECT_DIR="/opt/personal-ai"
cd "$PROJECT_DIR"

echo "=== Deploy starting at $(date) ==="

# 1. Pre-deploy checks
echo "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Uncommitted changes in repo. Stash or commit first."
    git status
    exit 1
fi

echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
echo "Latest commit: $(git log -1 --oneline)"

# 2. Fetch latest code
echo "Fetching latest code from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 3. Backup current state (before rebuild)
echo "Creating backup..."
/opt/personal-ai/scripts/backup.sh

# 4. Build and deploy
echo "Building services..."
docker compose build api

echo "Starting services..."
docker compose up -d --no-deps api  # Restart only API, keep databases running

# 5. Wait for API to be ready
echo "Waiting for API to be healthy..."
for i in {1..30}; do
    if curl -sf http://localhost:3456/health > /dev/null; then
        echo "API is healthy!"
        break
    fi
    echo "Attempt $i/30 — waiting for API..."
    sleep 2
done

if [ $? -ne 0 ]; then
    echo "ERROR: API failed to become healthy. Checking logs..."
    docker compose logs --tail=50 api
    exit 1
fi

# 6. Verify other services
echo "Verifying dependencies..."
curl -sf http://localhost:7700/health > /dev/null && echo "✓ Meilisearch healthy"
docker compose exec redis redis-cli ping && echo "✓ Redis healthy"

echo "=== Deploy completed successfully at $(date) ==="
echo "Deployed commit: $(git log -1 --oneline)"
```

### Making it executable and cronable

```bash
chmod +x /opt/personal-ai/scripts/deploy.sh

# Test it
/opt/personal-ai/scripts/deploy.sh main

# Or add to crontab for automated deploys
# (only if you trust CI/CD)
# 0 3 * * * /opt/personal-ai/scripts/deploy.sh main >> /var/log/deploy.log 2>&1
```

## Health check endpoint

Ensure your NestJS API has a health endpoint:

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

The deploy script checks this endpoint to verify the API is working after restart.

## Rollback strategy

If a deploy goes wrong, revert to the previous version:

```bash
#!/bin/bash
# /opt/personal-ai/scripts/rollback.sh

cd /opt/personal-ai

# Show recent commits
echo "Recent commits:"
git log --oneline -10

# Revert to previous commit
PREVIOUS=$(git log --oneline -2 | tail -1 | cut -d' ' -f1)
echo "Rolling back to: $PREVIOUS"

git checkout $PREVIOUS

# Rebuild and restart
docker compose down
docker compose up -d

# Verify
sleep 10
curl -sf http://localhost:3456/health && echo "✓ Rollback successful"
```

Usage:
```bash
chmod +x /opt/personal-ai/scripts/rollback.sh
/opt/personal-ai/scripts/rollback.sh
```

## Blue-green deployment (if two VPS available)

For zero-downtime deployment with two VPS instances:

### Setup

- **Blue server** (prod): 62.146.238.102 — current production
- **Green server** (staging): 62.146.238.103 — where you deploy first
- **Load balancer** or **DNS toggle** routes traffic

### Deploy sequence

```bash
# 1. Deploy to green
ssh deploy@green-server.com
cd /opt/personal-ai
git pull origin main
docker compose up -d

# 2. Smoke test green
curl https://green.example.com/health

# 3. Toggle load balancer or DNS A record to green
# (Update your reverse proxy or DNS to point to green-server IP)

# 4. Monitor green for 10 minutes
# If all good, blue becomes staging and green becomes production

# 5. If disaster, quickly switch back to blue
```

Benefits:
- Zero downtime for users
- Easy rollback if issues arise
- Time to validate before users see the change

Drawbacks:
- Requires two VPS (more cost)
- Network/database migrations are complex
- Overkill for single-developer projects

## Database migration strategy

For schema changes that must coordinate with code:

### Backward-compatible migrations (preferred)

1. Deploy code that reads/writes BOTH old and new fields
2. Migrate data in Neo4j using background jobs
3. Deploy code that only reads/writes new field

```bash
# Example: renaming solution.title -> solution.problem_title

# Phase 1: Deploy code that accepts both
@Post('/solutions')
create(@Body() dto: CreateSolutionDto) {
  // Accept both title and problem_title; write both
  const title = dto.problem_title || dto.title;
  return this.neo4jService.createSolution({ title });
}

# Phase 2: Run migration (outside deploy window)
docker compose exec neo4j neo4j-admin shell
MATCH (s:Solution) SET s.problem_title = s.title RETURN count(s)

# Phase 3: Deploy code that only reads problem_title
@Post('/solutions')
create(@Body() dto: CreateSolutionDto) {
  // Now only use problem_title
  return this.neo4jService.createSolution({ problem_title: dto.problem_title });
}
```

### Breaking migrations (requires downtime)

If you MUST make a breaking change:

```bash
# 1. Schedule maintenance window
# 2. Stop API
docker compose stop api

# 3. Run migration
docker compose exec neo4j <migration-command>

# 4. Deploy new code and restart
git pull origin main
docker compose build api
docker compose up -d api

# 5. Monitor for errors
docker compose logs -f api
```

Minimize downtime by:
- Having migration scripts pre-written and tested
- Running on low-traffic hours
- Having a known rollback plan

## Monitoring after deploy

```bash
# Immediate post-deploy (first 5 minutes)
watch -n 2 'curl -s http://localhost:3456/health | jq'
docker compose logs --tail=20 -f api

# Next 30 minutes
# Monitor disk space, memory, error rates from logs

# Over the next 24 hours
# Check Caddy logs for any HTTPS/routing issues
tail -f /var/log/caddy/kb-access.log

# Check for any Neo4j constraint violations
docker compose logs neo4j | grep -i error
```

## Secrets management during deploy

Never commit `.env` to git. Load it from a secure location:

```bash
# Option 1: Encrypted file in git (git-crypt)
git-crypt unlock ~/secrets/key
# .env is now decrypted

# Option 2: Load from a secrets manager
aws secretsmanager get-secret-value --secret-id personal-ai/.env \
  --query SecretString --output text > .env

# Option 3: Manually on each VPS (tedious)
# Store .env separately, never in git
```

For this project, use **Option 3** (manual). Before deploy:

```bash
# Ensure .env exists on the VPS
ls -la /opt/personal-ai/.env

# If missing, recreate from template (should be documented elsewhere)
cp /opt/personal-ai/.env.example /opt/personal-ai/.env
# Edit with real values
```

## Canarying (gradual rollout)

If you have multiple instances behind a load balancer:

```bash
# 1. Deploy to one instance
ssh instance-1
cd /opt/personal-ai && git pull && docker compose restart api

# 2. Monitor that instance's error rate for 10 minutes
# (Check logs and health endpoint)

# 3. If healthy, deploy to the rest
for instance in instance-2 instance-3 instance-4; do
  ssh $instance "cd /opt/personal-ai && git pull && docker compose restart api"
done
```

Single VPS? Not applicable — you only have one instance.

## Deployment checklist

Before every deploy, verify:
- [ ] `git status` is clean (no uncommitted changes)
- [ ] You're on the right branch
- [ ] All tests pass locally (if CI/CD not running)
- [ ] `.env` file is in place and has correct values
- [ ] Recent backup exists: `ls -lh /opt/backups/personal-ai/ | head -1`
- [ ] No urgent security patches pending: `apt list --upgradable`
- [ ] Disk space available: `df -h / | tail -1` (>20% free recommended)
- [ ] Neo4j is healthy: `docker compose exec neo4j cypher-shell "RETURN 1"`

Post-deploy:
- [ ] API responds: `curl http://localhost:3456/health`
- [ ] Health endpoint returns 200: `curl http://localhost:3456/health`
- [ ] Caddy is routing: `curl https://dev.truongsoftware.com/health`
- [ ] Check logs for errors: `docker compose logs --tail=50`
- [ ] Monitor for 10 minutes before declaring success
