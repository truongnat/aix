# Solution Format Guide

## Canonical Structure

Every KB solution uses this markdown format:

```markdown
# Title of the Solution

## Problem
Specific problem with error messages, context, and reproduction steps.

## Solution
The fix with code examples, commands, or configuration.

## Key Insight
1-2 sentences: the non-obvious learning. What you would tell past-self.

## Tags
tag1, tag2, tag3

## Technologies
Tech1, Tech2
```

## Rules

1. **H1 Title** becomes the KB entry title — make it searchable and specific
2. **Problem** section: include actual error messages, stack traces, or symptoms
3. **Solution** section: must include working code or commands
4. **Key Insight**: the "aha" moment — this is what makes the entry valuable beyond Stack Overflow
5. **Tags**: English, lowercase, comma-separated — drives graph auto-linking
6. **Technologies**: proper case names of tools/frameworks involved

## Title Guidelines

Good titles are specific and searchable:
- "NestJS onModuleInit Race Condition Fix" (specific)
- "Docker Compose Port Conflict on Multi-Project VPS" (contextual)
- "Neo4j Cypher MERGE ON CREATE SET Order" (precise)

Bad titles:
- "Bug fix" (too generic)
- "Docker issue" (too vague)
- "How to do stuff" (not a solution)

## Real Examples

### Example 1: Bug Fix

```markdown
# Meilisearch SDK v0.40+ Named Export Fix

## Problem
Import MeiliSearch from meilisearch fails in v0.40+ because the SDK changed from default export to named export.

## Solution
Use named import: import { MeiliSearch } from 'meilisearch'

## Key Insight
The Meilisearch JS SDK changed from default to named export around v0.38-0.40. Many tutorials use the old import which silently breaks.

## Tags
meilisearch, typescript, import, breaking-change

## Technologies
Meilisearch, TypeScript, Node.js
```

### Example 2: Infrastructure

```markdown
# Caddy Auto-SSL Reverse Proxy Setup

## Problem
Need HTTPS for a Docker service on VPS without manual certbot management.

## Solution
Use Caddy v2 with conf.d pattern:
1. Main Caddyfile imports conf.d directory
2. Each site: domain { reverse_proxy localhost:PORT; encode gzip zstd }
3. Reload: systemctl reload caddy

## Key Insight
Caddy handles SSL entirely automatically — no cron, no certbot, no renewal scripts. Just point DNS and reload.

## Tags
caddy, ssl, reverse-proxy, letsencrypt, devops

## Technologies
Caddy, Let's Encrypt, Linux
```

### Example 3: Pattern

```markdown
# Redis Cache-Aside Pattern with Invalidation

## Problem
Search queries take 50-200ms. Need caching with proper invalidation on writes.

## Solution
Check cache first, on miss query and store, invalidate on writes:
- Key: search:{hash(query+limit)}
- TTL: 300s safety net
- On write: delByPattern('search:*')

## Key Insight
Pattern-based invalidation (delByPattern) is simple but effective for search caches. The TTL is a safety net, not the primary invalidation mechanism.

## Tags
redis, caching, cache-invalidation, performance, nestjs

## Technologies
Redis, ioredis, NestJS
```

## Content Length Guidelines

- **Minimum**: Problem + Solution + Tags (at least)
- **Ideal**: 50-200 lines including code examples
- **Maximum**: If exceeding 300 lines, split into multiple solutions
- **Code**: Include enough to be copy-pasteable, not entire files
