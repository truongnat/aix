# Search Strategies

## CLI Commands

```bash
# Basic search
skill kb search "docker port conflict"

# With limit
skill kb search "nestjs" --limit 10

# List with filters
skill kb list --tag docker
skill kb list --project personal-ai
skill kb list --tag nestjs --project personal-ai

# Get full content by ID
skill kb get <uuid>
```

## Query Tips

### Be Specific
- "neo4j MERGE ON CREATE SET order" > "neo4j syntax"
- "docker compose port conflict VPS" > "docker problem"
- "NestJS ThrottlerGuard APP_GUARD" > "rate limiting"

### Use Technology Names
The search index weights titles and technology names. Include the specific tool:
- "Caddy reverse proxy SSL" (finds Caddy-specific solutions)
- "bun build --target node" (finds Bun compilation solutions)
- "bcrypt compare NestJS" (finds auth-specific solutions)

### Combine Problem + Context
- "race condition onModuleInit" (problem + symptom)
- "port 3000 already in use Docker" (error + context)
- "package-lock.json missing Dockerfile" (issue + location)

## Caching Behavior

- First search: hits Meilisearch, stores result in Redis (5-min TTL)
- Repeat search: returns from Redis cache (`cached: true` in response)
- After any `kb push`: ALL search cache is invalidated (`delByPattern('search:*')`)
- Cache key: `search:{md5(query + limit)}`

## Graph Traversal

Solutions auto-link via shared tags:
- Solution A tagged `docker, port-conflict`
- Solution B tagged `docker, caddy`
- They connect via shared `docker` tag as RELATED_TO

To find related solutions:
1. `skill kb get <id>` — shows `related` array
2. Browse by tag: `skill kb list --tag docker` — see all docker-related

## When Search Returns Nothing

1. Try broader terms (remove specific version numbers)
2. Try the technology name alone ("neo4j", "redis", "caddy")
3. Try the error message keywords
4. Try synonyms (deploy/deployment, cache/caching)
5. If truly nothing: the solution doesn't exist yet — time to create it
