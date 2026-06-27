# Graph Relationships

## Node Types

| Node | Purpose | Key Property |
|------|---------|-------------|
| Solution | A documented problem/fix | `id` (UUID), `title`, `content` |
| Tag | Categorization label | `name` (unique) |
| Project | Groups solutions by project | `name` (unique) |
| Technology | Tech stack reference | `name` (unique) |

## Relationships

```
(Solution)-[:TAGGED_WITH]->(Tag)
(Solution)-[:BELONGS_TO]->(Project)
(Solution)-[:USES]->(Technology)
(Solution)-[:RELATED_TO]->(Solution)
```

## Auto-Linking: RELATED_TO

When you push a new solution, the API automatically:
1. Finds existing solutions that share at least one tag
2. Creates `RELATED_TO` edges between them
3. Returns `related_found` count in the response

### Example

Push a solution tagged `docker, caddy, ssl`:
- Existing solution tagged `docker, port-conflict` → linked (shares `docker`)
- Existing solution tagged `caddy, reverse-proxy` → linked (shares `caddy`)
- Existing solution tagged `nestjs, typescript` → NOT linked (no shared tags)

## Why Tags Drive Discovery

Tags are the primary mechanism for building knowledge connections:

| Tags on Entry | Graph Effect |
|---------------|-------------|
| 1 tag | Isolated — connects only to that one topic |
| 3-5 tags | Well-connected — discoverable from multiple angles |
| 10+ tags | Over-connected — noise in related results |

**Sweet spot: 3-5 specific, relevant tags per solution.**

## Tag Strategy

### Good Tags (specific, reusable)
- Technology: `neo4j`, `redis`, `caddy`, `nestjs`, `docker`
- Problem type: `race-condition`, `port-conflict`, `cache-invalidation`
- Context: `vps`, `monorepo`, `initialization`

### Bad Tags (too generic or too specific)
- `fix` — every solution is a fix
- `code` — every solution has code
- `2024-05-17` — dates don't drive useful relationships
- `my-specific-function-name` — too narrow for reuse

## Querying the Graph (API internals)

The `kb:search` command uses Meilisearch for text matching, then enriches results with Neo4j graph data:
1. Meilisearch returns matching document IDs
2. Neo4j fetches full node + RELATED_TO edges for each ID
3. Related solutions appear in the `related` field of each result

The `kb:list` command queries Neo4j directly with optional tag/project filters using Cypher MATCH patterns.
