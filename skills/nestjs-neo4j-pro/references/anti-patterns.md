# Anti-patterns

## 1. String concatenation in Cypher (INJECTION RISK)

### Bad
```typescript
// NEVER do this — Cypher injection vulnerability
async findByName(name: string) {
  const session = this.neo4j.getSession();
  const result = await session.run(
    `MATCH (s:Solution) WHERE s.title = '${name}' RETURN s`, // VULNERABLE
  );
}
// Input: "' OR 1=1 //" would match everything
```

### Good
```typescript
async findByName(name: string) {
  const session = this.neo4j.getSession();
  try {
    const result = await session.run(
      'MATCH (s:Solution) WHERE s.title = $name RETURN s',
      { name }, // Parameterized — safe from injection
    );
    return result.records.map(r => this.mapRecord(r));
  } finally {
    await session.close();
  }
}
```

### Why it matters
- Cypher injection can read/modify/delete any data in the database
- Unlike SQL injection, fewer developers are aware of it
- Parameters are the ONLY safe approach — no sanitization is reliable

## 2. Session leaks (not closing)

### Bad
```typescript
async findAll() {
  const session = this.neo4j.getSession();
  const result = await session.run('MATCH (s:Solution) RETURN s');
  return result.records; // Session never closed!
}

// Worse — early return before close
async findById(id: string) {
  const session = this.neo4j.getSession();
  const result = await session.run('MATCH (s:Solution {id: $id}) RETURN s', { id });
  if (result.records.length === 0) {
    return null; // Session leaked on this path!
  }
  await session.close();
  return this.mapRecord(result.records[0]);
}
```

### Good
```typescript
async findById(id: string) {
  const session = this.neo4j.getSession('READ');
  try {
    const result = await session.run(
      'MATCH (s:Solution {id: $id}) RETURN s',
      { id },
    );
    if (result.records.length === 0) return null;
    return this.mapRecord(result.records[0]);
  } finally {
    await session.close(); // ALWAYS closes, regardless of path
  }
}
```

### Impact
- Each leaked session holds a database connection
- Under load, pool exhausts and new queries hang/timeout
- Memory grows unbounded as sessions accumulate
- May take hours/days to manifest in production

## 3. Over-fetching with RETURN *

### Bad
```cypher
MATCH (s:Solution)-[:TAGGED_WITH]->(t:Tag)
RETURN *
```

### Good
```cypher
MATCH (s:Solution)-[:TAGGED_WITH]->(t:Tag)
RETURN s.id, s.title, collect(t.name) AS tags
```

### Why
- RETURN * includes internal properties and relationship data you don't need
- Breaks when schema changes (new properties appear unexpectedly)
- Transfers more data over the wire
- Makes the query's intent unclear to other developers
- Harder to type in TypeScript (what properties exist?)

## 4. ON CREATE SET after SET (syntax error)

### Bad
```cypher
MERGE (s:Solution {id: $id})
SET s.title = $title
ON CREATE SET s.createdAt = datetime()  -- SYNTAX ERROR: ON CREATE SET must come before SET
```

### Good
```cypher
MERGE (s:Solution {id: $id})
ON CREATE SET s.createdAt = datetime()
SET s.title = $title, s.updatedAt = datetime()
```

### Rule
The clause order after MERGE must be:
1. `ON CREATE SET` (runs only when node is created)
2. `ON MATCH SET` (runs only when node already existed)
3. `SET` (runs always, after either CREATE or MATCH)

## 5. Multiple services creating constraints (race condition)

### Bad
```typescript
// solution.service.ts
@Injectable()
export class SolutionService implements OnModuleInit {
  async onModuleInit() {
    const session = this.neo4j.getSession();
    await session.run('CREATE CONSTRAINT solution_id IF NOT EXISTS ...');
    await session.close();
  }
}

// tag.service.ts
@Injectable()
export class TagService implements OnModuleInit {
  async onModuleInit() {
    const session = this.neo4j.getSession();
    await session.run('CREATE CONSTRAINT tag_name IF NOT EXISTS ...');
    await session.close(); // Both run concurrently — potential deadlock
  }
}
```

### Good
```typescript
// neo4j.service.ts — SINGLE POINT of schema management
@Injectable()
export class Neo4jService implements OnModuleInit {
  async onModuleInit() {
    await this.driver.verifyConnectivity();
    await this.createAllConstraints(); // ALL constraints here
  }
}

// solution.service.ts — NO onModuleInit for DB
@Injectable()
export class SolutionService {
  constructor(private neo4j: Neo4jService) {}
  // Just uses the service, trusts constraints exist
}
```

## 6. Using Neo4j without pinning version

### Bad
```dockerfile
FROM neo4j:latest
```

```json
{
  "dependencies": {
    "neo4j-driver": "^5"
  }
}
```

### Good
```dockerfile
FROM neo4j:5.15.0
```

```json
{
  "dependencies": {
    "neo4j-driver": "5.17.0"
  }
}
```

### Why
- Neo4j 4.x to 5.x had breaking Cypher syntax changes
- Driver versions must be compatible with server version
- `IF NOT EXISTS` syntax for constraints was added in Neo4j 4.1
- Node key constraints differ between Community and Enterprise
- `latest` in Docker means different behavior after image updates

## 7. Treating Neo4j like a document store

### Bad
```typescript
// Storing JSON blobs as string properties
await session.run(
  'CREATE (s:Solution {id: $id, metadata: $metadata})',
  { id: '1', metadata: JSON.stringify({ tags: ['a', 'b'], author: { name: 'Joe' } }) },
);
```

### Good
```typescript
// Model as graph — entities become nodes, arrays become relationships
await session.run(
  `CREATE (s:Solution {id: $id})
   WITH s
   UNWIND $tags AS tagName
   MERGE (t:Tag {name: tagName})
   CREATE (s)-[:TAGGED_WITH]->(t)
   WITH s
   MERGE (a:Author {name: $authorName})
   CREATE (s)-[:AUTHORED_BY]->(a)`,
  { id: '1', tags: ['a', 'b'], authorName: 'Joe' },
);
```

### Why
- JSON strings cannot be queried with Cypher
- You lose all graph traversal benefits
- No indexes on nested JSON properties
- Defeats the entire purpose of using a graph database

## 8. Not handling empty results

### Bad
```typescript
const result = await session.run('MATCH (s:Solution {id: $id}) RETURN s', { id });
return result.records[0].get('s').properties; // Throws if not found!
```

### Good
```typescript
const result = await session.run('MATCH (s:Solution {id: $id}) RETURN s', { id });
if (result.records.length === 0) {
  throw new NotFoundException(`Solution ${id} not found`);
}
return this.mapRecord(result.records[0]);
```
