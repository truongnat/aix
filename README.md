<div align="center">
  
# 🧠 Personal KB + Skill Hub

**A graph-backed knowledge base and versioned AI skill platform for Claude Code and Cursor**

[![API Status](https://img.shields.io/website?label=API&url=https%3A%2F%2Fdev.truongsoftware.com%2Fhealth)](https://dev.truongsoftware.com/health)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)](https://nestjs.com)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.26-0EA5E9?logo=neo4j)](https://neo4j.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Website](https://dev.truongsoftware.com) • [API Docs](https://dev.truongsoftware.com/docs) • [Skill Hub](./skills/) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [CLI Usage](#-cli-usage)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

**Personal KB + Skill Hub** is a self-hosted developer knowledge platform that combines:

- **📚 Knowledge Base** — Store, search, and auto-link your development solutions
- **🎓 Skill Hub** — Publish, version, and share AI skills for Claude Code and Cursor
- **⚡ CLI Tool** — Command-line interface for KB and skill management
- **🔗 Graph Database** — Neo4j-backed relationships for intelligent linking
- **🔍 Full-Text Search** — Meilisearch for fast, relevant results
- **🚀 Self-Hosted** — Docker Compose stack, VPS-ready, complete control

Perfect for:
- ✅ Storing solutions to bugs you've solved
- ✅ Building a personal knowledge library
- ✅ Publishing reusable AI skills
- ✅ Integrating with Claude Code or Cursor for AI-assisted workflows

---

## ✨ Features

### Knowledge Base
- **Push solutions** — Save markdown documentation to your graph-backed KB
- **Smart search** — Full-text search with semantic ranking via Meilisearch
- **Auto-linking** — Solutions automatically linked by shared tags
- **Solution versioning** — Immutable revision history with content hashing
- **Tag suggestions** — AI-powered tag recommendations based on content analysis

### Skill Hub
- **Professional skills** — Define skills with 6-layer architecture (Metadata → Contract → Decision → Knowledge → Execution → Quality)
- **Skill validation** — Enforce structure, frontmatter, section ordering, reference links
- **Semantic versioning** — Version skills independently; install specific versions
- **Skill composition** — Merge multiple skills into a single KB phase
- **IDE Integration** — Compatible with Claude Code and Cursor via `.claude/skills/`

### Developer Experience
- **CLI tool** — `skill` command for KB, skills, and configuration management
- **Auto-tag suggestions** — Confidence-scored suggestions as you push solutions
- **Git hooks** — Pre-commit searches, post-merge reminders for solution discipline
- **Shell completions** — Bash/Zsh auto-completion for commands and flags
- **API documentation** — OpenAPI/Swagger endpoint at `/docs`

### Infrastructure
- **Docker Compose** — Multi-service orchestration (NestJS, Neo4j, Meilisearch, Redis, Caddy)
- **Auto-SSL** — Caddy reverse proxy with Let's Encrypt
- **Backup automation** — Daily incremental backups with 7-day retention
- **VPS provisioning** — Scripts for Ubuntu 22.04+ hardening and setup

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Claude Code / Cursor                │
│                   .claude/skills/                    │
└────────────────────────┬────────────────────────────┘
                         │
            CLI (skill) ──┤ HTTPS
                         │
        ┌────────────────▼────────────────┐
        │        Caddy (:443)             │
        │      (Reverse Proxy)            │
        │      (Auto-SSL)                 │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │    NestJS API (:3456)           │
        │  • Auth (API keys)              │
        │  • Knowledge Base CRUD          │
        │  • Skill management             │
        │  • Search coordination          │
        └───┬────────────┬────────────┬───┘
            │            │            │
      ┌─────▼──┐    ┌────▼───┐  ┌───▼─────┐
      │ Neo4j  │    │ Meili  │  │  Redis  │
      │ (5.26) │    │ search │  │ (cache) │
      └────────┘    └────────┘  └─────────┘

Graph Nodes: Solution, SolutionRevision, Skill, SkillVersion, Tag, Project, Technology
Relationships: TAGGED_WITH, RELATED_TO, HAS_VERSION, COMPATIBLE_WITH, USES
```

**Data Flow:**
1. User pushes solution via CLI → API validates & stores in Neo4j
2. Meilisearch indexes document for full-text search
3. Redis caches search results (5-min TTL)
4. Graph auto-links solutions by shared tags (RELATED_TO edges)
5. Solution revision captured for immutable audit trail

---

## 🚀 Quick Start

### Prerequisites

- **Bun** 1.0+ or **Node.js** 18+
- **Docker** & **Docker Compose** (for API)
- **Git**

### 1. Install CLI

```bash
# Clone repository
git clone https://github.com/truongnat/personal-ai.git
cd personal-ai

# Install dependencies
cd packages/cli
bun install

# Build (optional, for global install)
bun build src/index.ts --outfile dist/skill --target node
npm link  # Make 'skill' globally available
```

**Verify:**
```bash
skill --version  # Should print version
skill --help     # Show all commands
```

### 2. Generate API Key

If you have access to an API instance, generate a key:

```bash
curl -X POST https://dev.truongsoftware.com/auth/generate-key \
  -H "x-master-password: YOUR_MASTER_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "my-machine",
    "expiresIn": "365d"
  }'

# Response:
# {
#   "id": "...",
#   "key": "kb_live_...",  <- Save this securely
#   "label": "my-machine",
#   "created_at": "2026-05-18T..."
# }
```

### 3. Configure CLI

```bash
skill config set hub_url https://dev.truongsoftware.com
skill config set api_key kb_live_YOUR_KEY_HERE
skill config set default_project my-project
skill config list  # Verify

# Config is stored at ~/.skill-cli/config.json
```

---

### 4. Prompt usage

```text
You are working inside my engineering workflow.

Always follow these rules:

1. Before solving a problem:
   - Search the knowledge base first
   - Reuse existing solutions if relevant

2. After solving a new issue:
   - Create concise markdown documentation
   - Include:
     - Problem
     - Root cause
     - Solution
     - Commands
     - Edge cases

3. Push important knowledge into the KB using:
   skill kb push

4. Reuse installed skills whenever possible

5. Prefer:
   - production-ready solutions
   - scalable architecture
   - automation
   - clean documentation

6. When updating docs:
   - keep them concise
   - avoid duplicate knowledge
   - link related concepts

7. Always think like a senior engineer:
   - analyze root causes
   - consider trade-offs
   - optimize for maintainability

```


## 📖 CLI Usage

### Knowledge Base Commands

**Search**
```bash
skill kb search "docker compose network"
skill kb search "authentication" --limit 10

# Output: Results ranked by relevance with related solutions
```

**Push a Solution**
```bash
# Create solution file
cat > my-solution.md << 'EOF'
# Fixed Docker Port Conflict

## Problem
Docker Compose failed to start because port 5432 was already in use.

## Solution
Kill the existing process:
\`\`\`bash
lsof -i :5432
kill -9 <PID>
\`\`\`

Then restart: `docker compose up`
EOF

# Push with auto-tag suggestions
skill kb push my-solution.md --tags "docker,networking" --project my-project

# Or skip suggestions
skill kb push my-solution.md --tags "docker" --skip-suggestions
```

**List & Get**
```bash
skill kb list                           # All solutions
skill kb list --tag docker              # Filter by tag
skill kb list --project my-project      # Filter by project
skill kb get <solution-id>              # View full content
skill kb get <solution-id>/history      # View revision history
```

**Update**
```bash
skill kb update <solution-id> \
  --title "Updated Title" \
  --content "./updated.md"
```

### Skill Commands

**Install Skills**
```bash
skill list                                    # Browse available skills
skill info nestjs-neo4j-pro                   # Details about a skill
skill install nestjs-neo4j-pro                # Install to ~/.claude/skills
skill install nestjs-neo4j-pro@1.2.0          # Install specific version
```

**Publish Skills**
```bash
skill publish ./skills/my-skill \
  --compatible "Claude Code,Cursor" \
  --version 1.0.0 \
  --tags "devops,docker" \
  --changelog "Initial release"
```

**Compose Skills** (Merge multiple into one)
```bash
skill compose \
  --name "Full Stack Dev" \
  --use kb-workflow \
  --use nestjs-neo4j-pro \
  --use docker-compose-pro \
  --kb                           # Include KB search/push phases
  --out ./composed-skill.md
```

### Configuration

```bash
skill config get hub_url               # Current hub URL
skill config set api_key kb_live_...   # Update API key
skill config list                      # All settings
skill config get                       # Show location of config file
```

---

## 🔌 API Reference

**Base URL:** `https://dev.truongsoftware.com`  
**Docs:** `https://dev.truongsoftware.com/docs` (OpenAPI/Swagger)

### Authentication

| Type | Header | Example |
|------|--------|---------|
| User | `x-api-key` | `kb_live_...` |
| Admin | `x-master-password` | (for key generation only) |

### Endpoints

#### Health Check
```bash
GET /health

# Response:
{
  "status": "ok",
  "uptime": 3600.5,
  "timestamp": "2026-05-18T10:00:00Z"
}
```

#### Knowledge Base

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/kb/push` | Create new solution |
| `GET` | `/kb/search?q=...` | Search KB (cached) |
| `GET` | `/kb/list` | List solutions (paginated) |
| `GET` | `/kb/:id` | Get solution details |
| `GET` | `/kb/:id/history` | Solution revision history |
| `PATCH` | `/kb/:id` | Update solution |
| `DELETE` | `/kb/:id` | Delete solution |
| `POST` | `/kb/suggest-tags` | Get tag suggestions |

**Example: Push a Solution**
```bash
curl -X POST https://dev.truongsoftware.com/kb/push \
  -H "x-api-key: kb_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fixed Neo4j Connection Pool",
    "content": "## Problem\n\n...",
    "tags": ["neo4j", "performance"],
    "project": "personal-ai",
    "ticket_ref": "TICKET-123"
  }'

# Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Pushed successfully",
  "related_found": 3
}
```

**Example: Search**
```bash
curl "https://dev.truongsoftware.com/kb/search?q=docker+compose&limit=5" \
  -H "x-api-key: kb_live_..."

# Response:
{
  "results": [
    {
      "id": "...",
      "title": "Fixed Docker Port Conflict",
      "summary": "Killed existing process on port...",
      "tags": ["docker", "networking"],
      "score": 0.95,
      "related": [...],
      "created_at": "2026-05-17T..."
    }
  ],
  "total": 12,
  "cached": false
}
```

#### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/skill/publish` | Publish new skill version |
| `GET` | `/skill/list` | List all skills |
| `GET` | `/skill/:name` | Get skill details |
| `GET` | `/skill/install/:name` | Get skill files for install |
| `POST` | `/skill/compose` | Merge multiple skills |

#### Authentication (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/generate-key` | Create API key |
| `GET` | `/auth/keys` | List active keys |
| `DELETE` | `/auth/revoke-key/:id` | Revoke a key |

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/kb/search` | 2 requests/second |
| `/*` (default) | 5 requests/second |

---

## 🚀 Deployment

### Self-Host on VPS

**Requirements:**
- Ubuntu 22.04+ LTS
- 2GB+ RAM (4GB recommended)
- Docker & Docker Compose
- DNS A record pointing to your server

**Setup (5 minutes):**

```bash
# 1. Clone to VPS
ssh root@your-domain.com
git clone https://github.com/truongnat/personal-ai.git /opt/personal-ai
cd /opt/personal-ai

# 2. Configure environment
cp .env.example .env
# Edit .env with your secrets:
# - NEO4J_PASSWORD
# - REDIS_PASSWORD
# - CADDY_ADMIN_EMAIL
# - etc.

# 3. Run provisioning script
bash scripts/setup-vps.sh
# This will:
# - Update system packages
# - Install Docker/Compose
# - Set up UFW firewall
# - Create backups directory
# - Start all services

# 4. Verify
curl https://your-domain.com/health
```

**Caddy Configuration** (auto-generated):
```caddy
your-domain.com {
    reverse_proxy localhost:3456
    encode gzip zstd
    header / X-Frame-Options "DENY"
    header / X-Content-Type-Options "nosniff"
}
```

**Deploy Updates:**
```bash
# From repo root:
make deploy

# Or directly on VPS:
bash /opt/personal-ai/scripts/deploy.sh
```

**Backups:**
- Daily backups run at 2 AM UTC via cron
- 7-day retention in `/opt/personal-ai/backups/`
- Includes Neo4j data, Meilisearch index, solutions
- Restore: `bash scripts/restore.sh /opt/personal-ai/backups/2026-05-17_backup.tar.gz`

---

## 🛠️ Development

### Local Setup

```bash
# Start services
make up

# Start API in dev mode
cd apps/api
bun install
bun run start:dev

# In another terminal, test CLI
cd ../../packages/cli
bun run src/index.ts kb search "test"
```

### Makefile Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all Docker services |
| `make down` | Stop containers |
| `make logs` | Follow API logs |
| `make build` | Build API Docker image |
| `make deploy` | Deploy to VPS (requires SSH config) |
| `make validate-skills` | Validate all skills |
| `make publish-skills` | Publish validated skills |
| `make test` | Run unit tests |

### Testing

```bash
# Unit tests (NestJS services)
cd apps/api
bun run test

# Test coverage
bun run test:cov

# Test specific file
bun run test kb.service
```

### Code Quality

```bash
# Type check
npx tsc --noEmit

# Linting (if configured)
npm run lint

# Skill validation
make validate-skills
skill validate ./skills/my-skill --fix
```

### Database Inspection

```bash
# Neo4j Browser (local)
open http://localhost:7474/browser/

# Meilisearch Admin (local)
open http://localhost:7700/
```

---

## 🔧 Troubleshooting

### API Connection Issues

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:3456`

**Solution:**
```bash
# Check if services are running
docker ps | grep -E "neo4j|redis|meilisearch|api"

# If not, start them
make up

# Check API logs
make logs
```

### Authentication Errors

**Problem:** `Error: Invalid API key`

**Solution:**
```bash
# Verify key format (should start with 'kb_live_')
skill config get api_key

# Regenerate if expired
curl -X POST https://dev.truongsoftware.com/auth/generate-key \
  -H "x-master-password: YOUR_MASTER_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"label":"my-machine"}'

# Update config
skill config set api_key kb_live_NEW_KEY
```

### Search Not Working

**Problem:** `Search returns no results`

**Solution:**
```bash
# Check Meilisearch index status
curl http://localhost:7700/stats \
  -H "Authorization: Bearer $MEILI_MASTER_KEY"

# Reindex all solutions
curl -X POST http://localhost:7700/indexes/solutions/documents \
  -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  -d '[{"id":"...","title":"..."}]'
```

### Neo4j Connection Pool Exhausted

**Problem:** `Timeout waiting for connection from pool`

**Solution:**
```bash
# Restart Neo4j
docker compose restart neo4j

# Or check logs
docker logs personal-ai-neo4j-1

# Increase connection pool in docker-compose.yml:
# NEO4J_INITIAL_DBMS_DEFAULT_DATABASE_SETTING_dbms_max_connection_pool_size=100
```

---

## 📚 Resources

| Topic | Link |
|-------|------|
| Skill Authoring Guide | [`SKILL_AUTHORING_RULES.md`](SKILL_AUTHORING_RULES.md) |
| Project Guide (Claude Code) | [`CLAUDE.md`](CLAUDE.md) |
| Cursor Rules | [`.cursor/rules/`](.cursor/rules/) |
| API Docs (Live) | https://dev.truongsoftware.com/docs |
| Neo4j Docs | https://neo4j.com/docs/ |
| NestJS Docs | https://docs.nestjs.com/ |

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, features, or documentation:

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/amazing-feature`)
3. **Make changes** and test thoroughly
4. **Commit** with clear messages (`git commit -m "feat: add amazing feature"`)
5. **Push** to your fork (`git push origin feature/amazing-feature`)
6. **Open a PR** with a description

### Guidelines

- **Code style:** Follow NestJS/TypeScript conventions
- **Tests:** Add tests for new features
- **Commits:** Conventional commits format (`feat:`, `fix:`, `docs:`, etc.)
- **Skills:** Validate with `make validate-skills` before submitting

---

## 📄 License

MIT © 2026 [@truongnat](https://github.com/truongnat)

**Built with:**
- NestJS · Neo4j · Meilisearch · Redis · Docker · Bun · TypeScript

---

<div align="center">

**[Back to top](#-personal-kb--skill-hub)**

Made with ❤️ for developers who learn by building.

</div>
