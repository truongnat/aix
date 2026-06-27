# Edge Cases

## neo4j.int() — JavaScript integer precision

### The problem

JavaScript numbers are 64-bit floats. Neo4j integers are 64-bit signed integers. Any integer > 2^53 (Number.MAX_SAFE_INTEGER = 9007199254740991) loses precision silently when passed as a JS number.

### When you MUST use neo4j.int()

```typescript
import neo4j from 'neo4j-driver';

// SKIP and LIMIT — always
const result = await session.run(
  'MATCH (s:Solution) RETURN s ORDER BY s.createdAt SKIP $skip LIMIT $limit',
  { skip: neo4j.int(offset), limit: neo4j.int(pageSize) },
);

// Any integer property you're writing
await session.run(
  'MERGE (s:Solution {id: $id}) SET s.viewCount = $count',
  { id: 'abc', count: neo4j.int(42) },
);
```

### Reading integers back

```typescript
// Neo4j returns Integer objects, not JS numbers
const record = result.records[0];
const count = record.get('count'); // This is a neo4j.Integer, not a number!

// Convert safely
const jsNumber = count.toNumber(); // Throws if > MAX_SAFE_INTEGER
const jsString = count.toString(); // Always safe

// For pagination totals (always safe range)
const total = record.get('total').toNumber();
```

### Configure driver to return native numbers (when safe)

```typescript
// Only do this if you KNOW all your integers fit in JS safe range
const driver = neo4j.driver(uri, auth, {
  disableLosslessIntegers: true, // Returns JS numbers directly
});
```

**Warning:** Only enable `disableLosslessIntegers` if your domain never has large integers (e.g., no Neo4j internal IDs exposed, no timestamps as epoch millis in integer form).

## Null property handling

### Neo4j null behavior

- Setting a property to null removes it from the node
- MATCH conditions with null never match (null = null is false in Cypher)
- OPTIONAL MATCH returns null for non-existent patterns

```cypher
// This REMOVES the description property entirely
SET s.description = null

// This keeps existing value if param is null — use COALESCE
SET s.description = COALESCE($description, s.description)
```

### Handling optional updates in NestJS

```typescript
async update(id: string, dto: UpdateSolutionDto): Promise<Solution> {
  const session = this.neo4j.getSession();
  try {
    // Build SET clause dynamically to avoid null-removal
    const setClauses: string[] = ['s.updatedAt = datetime()'];
    const params: Record<string, any> = { id };

    if (dto.title !== undefined) {
      setClauses.push('s.title = $title');
      params.title = dto.title;
    }
    if (dto.content !== undefined) {
      setClauses.push('s.content = $content');
      params.content = dto.content;
    }

    const result = await session.run(
      `MATCH (s:Solution {id: $id})
       SET ${setClauses.join(', ')}
       RETURN s`,
      params,
    );
    return this.mapRecord(result.records[0]);
  } finally {
    await session.close();
  }
}
```

## Concurrent writes and MERGE conflicts

### The problem

Two concurrent MERGE operations for the same non-existent node can both attempt CREATE, causing a constraint violation on one.

### Solution: Retry logic

The neo4j-driver's managed transactions (`executeWrite`) handle this automatically with retries. For auto-commit queries:

```typescript
async upsertWithRetry(dto: CreateSolutionDto, retries = 3): Promise<Solution> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const session = this.neo4j.getSession();
    try {
      const result = await session.run(
        `MERGE (s:Solution {id: $id})
         ON CREATE SET s.createdAt = datetime()
         SET s.title = $title, s.updatedAt = datetime()
         RETURN s`,
        { id: dto.id, title: dto.title },
      );
      return this.mapRecord(result.records[0]);
    } catch (error) {
      if (
        error.code === 'Neo.TransientError.Transaction.DeadlockDetected' &&
        attempt < retries
      ) {
        await new Promise(r => setTimeout(r, attempt * 100)); // backoff
        continue;
      }
      throw error;
    } finally {
      await session.close();
    }
  }
}
```

### Better: Use managed transactions

```typescript
// executeWrite already retries transient errors including deadlocks
const session = this.neo4j.getSession();
try {
  await session.executeWrite(async (tx) => {
    return tx.run(mergeQuery, params);
  });
} finally {
  await session.close();
}
```

## Large result sets and streaming

### Problem: Loading millions of records into memory

```typescript
// BAD — loads all records into memory
const result = await session.run('MATCH (s:Solution) RETURN s');
// result.records could be millions of items

// BETTER — paginate
async function* paginatedRead(session: Session, pageSize = 1000) {
  let offset = 0;
  while (true) {
    const result = await session.run(
      'MATCH (s:Solution) RETURN s ORDER BY s.id SKIP $skip LIMIT $limit',
      { skip: neo4j.int(offset), limit: neo4j.int(pageSize) },
    );
    if (result.records.length === 0) break;
    yield result.records;
    offset += pageSize;
  }
}
```

### Reactive streaming (advanced)

```typescript
// For very large result sets, use the reactive API
const rxSession = this.driver.rxSession();
const records$ = rxSession.executeRead((tx) =>
  tx.run('MATCH (s:Solution) RETURN s.id, s.title').records(),
);
// Process records as a stream
```

## Connection pool exhaustion

### Symptoms
- Queries hang for exactly `connectionAcquisitionTimeout` then throw
- Error: "Unable to acquire connection from the pool"
- Application becomes unresponsive under load

### Causes
1. Session not closed (leaked sessions hold connections)
2. Too many concurrent operations for pool size
3. Long-running queries holding connections

### Prevention

```typescript
// 1. ALWAYS close sessions in finally
const session = this.neo4j.getSession();
try {
  // ... queries
} finally {
  await session.close(); // NEVER skip this
}

// 2. Configure pool size appropriately
const driver = neo4j.driver(uri, auth, {
  maxConnectionPoolSize: 100, // default is 100
  connectionAcquisitionTimeout: 60000, // ms to wait for connection
});

// 3. Monitor pool metrics
const serverInfo = await this.driver.getServerInfo();
```

### Debugging pool issues

```typescript
// Add logging to session lifecycle
getSession(mode: 'READ' | 'WRITE' = 'WRITE'): Session {
  const session = this.driver.session({
    defaultAccessMode: mode === 'READ' ? neo4j.session.READ : neo4j.session.WRITE,
  });
  this.logger.debug(`Session opened (mode: ${mode})`);
  // In development, track open sessions
  if (process.env.NODE_ENV === 'development') {
    this.openSessions++;
    this.logger.debug(`Open sessions: ${this.openSessions}`);
  }
  return session;
}
```

## Record mapping pitfalls

### Neo4j records are not plain objects

```typescript
// record.get('s') returns a Neo4j Node object, not a POJO
const node = record.get('s');

// Access properties through .properties
const title = node.properties.title;
const id = node.properties.id;

// Or destructure
const { id, title, content } = node.properties;

// Integer properties need conversion
const viewCount = node.properties.viewCount.toNumber();
```

### Safe mapper utility

```typescript
function mapNode<T>(record: Record, key: string): T {
  const node = record.get(key);
  const props = { ...node.properties };
  // Convert all Integer values to numbers
  for (const [k, v] of Object.entries(props)) {
    if (neo4j.isInt(v)) {
      props[k] = v.toNumber();
    }
  }
  return props as T;
}
```
