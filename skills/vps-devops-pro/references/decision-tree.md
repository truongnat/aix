# Decision Tree

Navigate VPS DevOps decisions with this practical decision tree.

## Should I use Caddy or Nginx?

```
Do you need zero-config SSL?
├─ YES → Use Caddy
│       - Automatic Let's Encrypt certificates
│       - Auto-renewal, no certbot cron needed
│       - Simpler configuration syntax
│       - Perfect for single VPS
│
└─ NO (or need advanced features)
    Do you need >10k req/s?
    ├─ YES → Use Nginx
    │       - Slightly better performance at high scale
    │       - Massive community/modules
    │       - Accept manual SSL setup with certbot
    │
    └─ NO → Still use Caddy
            Simplicity wins for single VPS
```

**For this project:** Caddy. Single VPS, zero-config SSL, cleaner config.

## Should I use systemd timer or cron?

```
Is this a background task (backup, health check)?
├─ YES → Cron is fine
│       /etc/cron.d/personal-ai-backup
│       0 2 * * * /opt/personal-ai/scripts/backup.sh
│
└─ NO (or want better control)
    Do you need to coordinate with other timers?
    ├─ YES → Use systemd timer
    │       - Ordered startup
    │       - Better logging (journalctl)
    │       - Can depend on other units
    │
    └─ NO → Cron is simpler
            Less boilerplate, easier to read
```

**For this project:** Cron for backups, health checks. Systemd for long-running services (Caddy, Docker).

## Should I use named volumes or bind mounts?

```
Is this a database?
├─ YES → Named volume
│       - Docker manages ownership
│       - Better performance on macOS/Windows
│       - survives docker compose down (unless -v)
│
└─ NO
    Do you need to edit it from the host (hot reload)?
    ├─ YES → Bind mount
    │       - Changes visible immediately
    │       - Development: ./src:/app/src
    │
    └─ NO → Named volume
            Portable, no permission issues
```

**For this project:**
- `neo4j_data`, `meili_data`, `redis_data` → Named volumes
- `./src:/app/src` (if dev mode) → Bind mount
- Config files → Bind mount (read-only)

## Should I run Neo4j in Docker or native?

```
Do you need to manage multiple services together?
├─ YES → Docker Compose
│       - One command: docker compose up -d
│       - Version pinning
│       - Reproducible across machines
│
└─ NO (Neo4j only)
    Do you need to scale horizontally?
    ├─ YES → Native Neo4j Causal Cluster
    │       - Better cluster management
    │       - Built-in replication
    │
    └─ NO → Docker
            Single VPS, all-in-one
```

**For this project:** Docker Compose. Neo4j + Meilisearch + Redis + API together.

## Should I use Community or Enterprise Neo4j?

```
Do you need:
- Clustering (HA/failover)?
- LDAP/Active Directory auth?
- Advanced monitoring/profiling?
- Formal support from Neo4j?
├─ YES to any → Enterprise
│             (requires license/subscription)
│
└─ NO → Community edition
        - Free
        - Single instance
        - All Cypher features
        - Perfect for single VPS
```

**For this project:** Community edition. Single VPS, no clustering needed.

## Should I use APOC plugin?

```
Do you need stored procedures for:
- Text/regex functions?
- Mathematical functions?
- Date/time utilities?
- Periodic background jobs?
├─ YES → Install APOC
│       docker run -e NEO4JLABS_PLUGINS='["apoc"]' neo4j:5.15-community
│
└─ NO → Don't install APOC
        Adds complexity and attack surface
        Pure Cypher is usually sufficient
```

**For this project:** Not needed initially. Add if you hit limitations.

## Should I back up to cloud (S3/rsync) or local only?

```
What's your disaster tolerance?
├─ "If VPS is destroyed, it's a total loss"
│  └─ Local backups only (cheaper)
│     - 7-day retention on the VPS
│     - Recover from accidental deletes
│     - But: total VPS failure = data loss
│
└─ "I need to recover if the VPS is destroyed"
   └─ Offsite backup (S3, rsync, etc.)
      - Copy latest backup off-VPS
      - Cost: $1-5/month for S3
      - Peace of mind: priceless
      - Recommended
```

**For this project:** Local only (initial), add offsite later if data becomes critical.

## Should I use auto-scaling or fixed capacity?

```
Do you expect traffic spikes?
├─ YES → Load balancer + multiple VPS
│       - Scale horizontally
│       - Higher cost
│       - More complexity
│
└─ NO → Single VPS with generous overhead
        - Start with 4GB RAM
        - Monitor, upgrade if needed
        - Simpler operations
```

**For this project:** Single VPS. Monitor and upgrade if load increases.

## Should I enable swap?

```
How much RAM does your VPS have?
├─ <= 1GB → YES, enable swap (2GB)
│           Low RAM VPS needs breathing room
│           Swap prevents OOM kills
│
└─ > 2GB → Optional
           Monitor memory usage
           If consistently <80% used, no need
           If spiking, enable swap as safety valve
```

**For this project:** 2GB+ RAM assumed. Enable swap as precaution.

## Should I use separate domains for each service?

```
Do you want:
- api.example.com → API
- search.example.com → Meilisearch
- kb.example.com → UI
├─ YES → Subdomains
│       - Cleaner URLs
│       - Each gets its own Caddy config + cert
│       - More complex DNS
│
└─ NO (single domain)
    └─ example.com/* with path-based routing
       - Simpler DNS
       - Single certificate
       - Path routing in Caddy
       example.com/api/* → api:3000
       example.com/search/* → meilisearch:7700
```

**For this project:** Single domain with path routing (initially).
- dev.truongsoftware.com/ → API
- dev.truongsoftware.com/search/* → Meilisearch (if exposed)

## Should I store .env in git or separately?

```
Does .env contain secrets?
├─ YES → NEVER in git
│       - Store separately on VPS
│       - Copy manually or via secrets manager
│       - git-crypt or encrypted vault for team
│
└─ NO (just config, no passwords)
   └─ Optional to commit .env.example
      - Developers know what vars are needed
      - Never commit actual values
```

**For this project:** Never commit `.env`. Store manually on VPS. Provide `.env.example` in git.

## Should I log to files, syslog, or cloud?

```
How much logging do you need?
├─ Minimal (just errors) → Docker logs (journalctl)
│                          No extra setup
│
├─ Moderate (access logs, app logs) → Files + rotation
│                                     /var/log/caddy/
│                                     /var/log/personal-ai/
│                                     logrotate for cleanup
│
└─ Advanced (distributed tracing, metrics) → Cloud
                                             Datadog, New Relic, ELK
                                             Overkill for single VPS
```

**For this project:** Docker logs + Caddy access logs. No centralized logging needed yet.

## Should I automate deployments or deploy manually?

```
How often do you deploy?
├─ < 1x per week → Manual is fine
│                  /opt/personal-ai/scripts/deploy.sh
│
├─ 1-5x per week → Automate with CI/CD (GitHub Actions)
│                  Push to main → auto-deploy
│
└─ > 5x per day → Full CI/CD pipeline
                  Tests → deploy to staging → prod
                  Canary deployments
```

**For this project:** Manual deploy script (for now). Add GitHub Actions if frequency increases.

## When should I scale beyond one VPS?

```
Is your single VPS maxed out on:
- CPU? (consistently >80%)
├─ YES → Load balancer + scale API (keep DB single for now)
│
- Memory? (constantly swapping)
├─ YES → Upgrade RAM first
│        If already maxed (64GB+), scale to multiple VPS
│
- Disk? (>80% used)
├─ YES → Archive old backups, clean Docker volumes
│        If still full, upgrade disk or split data
│
- Network? (bandwidth capped)
├─ YES → CDN for static assets, geographic distribution
│
└─ NO → Stay on one VPS
        Monitor and upgrade as needed
```

**For this project:** Monitor metrics. Scale when a single metric hits 80% consistent utilization.
"