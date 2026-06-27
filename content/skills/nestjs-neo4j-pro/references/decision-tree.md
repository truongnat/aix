# Decision Tree

## When graph vs relational database

### Choose Neo4j (graph) when:

- **Relationships ARE the data** — you query paths, connections, patterns between entities
- **Variable-depth traversal** — "find all related items within 3 hops" is a natural query
- **Many-to-many relationships** are the norm, not the exception
- **Schema flexibility** — entity types and relationship types evolve frequently
- **Recommendation engines** — "people who liked X also liked Y"
- **Knowledge graphs** — interconnected concepts with typed relationships
- **Access control** — "can user A reach resource B through permission chain?"

### Choose relational (PostgreSQL/MySQL) when:

- **Tabular data** — rows and columns, regular structure
- **Strong aggregate queries** — SUM, AVG, GROUP BY across millions of rows
- **ACID transactions** are primary concern with complex multi-table consistency
- **Existing ecosystem** — ORM support, reporting tools, team expertise
- **Write-heavy workloads** with simple key-value access patterns
- **Full-text search is primary** — PostgreSQL's tsvector may suffice

### Choose both when:

- Primary data is relational but you have a recommendation/graph component
- Transaction processing in PostgreSQL, graph analytics in Neo4j
- Sync via CDC (Change Data Capture) or event-driven updates

## Decision: When to denormalize in Neo4j

### Denormalize (duplicate data as property) when:

- The value is read with the node 99% of the time
- You never need to query "all nodes with this value" independently
- The value doesn't change (or changes are rare and can be batch-updated)
- It saves a mandatory relationship traversal on every read

```cypher
// Denormalized — author name on solution for display
(:Solution {id, title, authorName})

// vs. Normalized — separate node
(:Solution {id, title})-[:AUTHORED_BY]->(:Author {name})
```

### Keep normalized (separate node) when:

- The entity has its own lifecycle (created, updated, deleted independently)
- Multiple nodes reference it (tags, technologies, categories)
- You need to query from that entity inward ("all solutions by this author")
- The value changes and must be consistent everywhere

### Rule of thumb:
> If you'd put a foreign key in SQL, put a relationship in Neo4j.
> If you'd put it inline in a column, put it as a property.

## Community vs Enterprise edition

| Feature | Community | Enterprise |
|---------|-----------|------------|
| Cost | Free | Licensed |
| Clustering | Single instance only | Causal clustering |
| Hot backup | No (offline only) | Online backup |
| Role-based access | Basic | Fine-grained |
| Property existence constraints | No | Yes |
| Node key constraints | No | Yes |
| Performance | Same query engine | Same + advanced memory config |
| Max database size | Unlimited | Unlimited |
| Multiple databases | Limited (Neo4j 5.x) | Full multi-tenancy |

### Decision guidance:

- **Start with Community** for development and small-to-medium production
- **Move to Enterprise** when you need: HA clustering, online backups, fine-grained security, or property existence constraints
- **Aura (managed)** when you don't want to manage infrastructure

### Impact on NestJS code:

```typescript
// Community: CREATE CONSTRAINT ... REQUIRE s.id IS UNIQUE (works)
// Enterprise: CREATE CONSTRAINT ... REQUIRE s.id IS NOT NULL (property existence — Enterprise only)
// Enterprise: CREATE CONSTRAINT ... REQUIRE (s.id, s.tenant) IS NODE KEY (composite — Enterprise only)
```

Your constraint creation code should be aware of which edition you're targeting.

## bolt:// vs neo4j:// protocol

| Protocol | Use when |
|----------|----------|
| `bolt://host:7687` | Direct connection to a single known instance |
| `neo4j://host:7687` | Cluster-aware routing (Enterprise/Aura) |
| `bolt+s://` / `neo4j+s://` | TLS-encrypted versions |
| `bolt+ssc://` / `neo4j+ssc://` | Self-signed certificate (development) |

### Recommendations:

```typescript
// Development (local Docker, no TLS)
NEO4J_URI=bolt://localhost:7687

// Production single instance (TLS)
NEO4J_URI=bolt+s://neo4j.myapp.com:7687

// Production cluster (Aura or Enterprise)
NEO4J_URI=neo4j+s://abc123.databases.neo4j.io:7687
```

### In NestJS config:
```typescript
// neo4j.config.ts
export const neo4jConfig = () => ({
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
  },
});
```

## Embedded vs server mode

Neo4j no longer supports embedded mode in modern versions (5.x). Always use server mode (standalone process or Docker container).

```yaml
# docker-compose.yml
services:
  neo4j:
    image: neo4j:5.15.0
    ports:
      - "7474:7474"  # HTTP (Browser)
      - "7687:7687"  # Bolt (Driver)
    environment:
      NEO4J_AUTH: neo4j/your-password
      NEO4J_PLUGINS: '["apoc"]'  # Optional plugins
    volumes:
      - neo4j_data:/data
```

## When to add APOC plugin

Add APOC when you need:
- `apoc.periodic.iterate` — batch processing millions of nodes
- `apoc.merge.node` — dynamic label/property merging
- `apoc.export.*` — data export to JSON/CSV
- `apoc.load.*` — bulk data import
- `apoc.path.*` — advanced path finding algorithms
- Date/time utilities beyond built-in Cypher functions

**Don't add APOC** if built-in Cypher covers your needs. Extra plugins = extra attack surface and version pinning complexity.
