# Transaction Patterns

## When to use which pattern

| Pattern | Use when |
|---------|----------|
| Auto-commit (session.run) | Single query, reads, simple writes |
| Explicit read transaction | Read consistency matters, retry on leader switch |
| Explicit write transaction | Multi-step writes that must be atomic |
| Managed transaction (recommended) | Any multi-query operation needing atomicity |

## Auto-commit transactions

The simplest pattern. Each `session.run()` is its own implicit transaction.

```typescript
async findById(id: string): Promise<Solution | null> {
  const session = this.neo4j.getSession('READ');
  try {
    const result = await session.run(
      'MATCH (s:Solution {id: $id}) RETURN s',
      { id },
    );
    if (result.records.length === 0) return null;
    return this.mapRecord(result.records[0]);
  } finally {
    await session.close();
  }
}
```

**Good for:** Single reads, simple upserts where MERGE handles idempotency.

**Not good for:** Multiple related writes that must succeed or fail together.

## Managed transactions (recommended for multi-step)

```typescript
async transferTag(solutionFromId: string, solutionToId: string, tagName: string): Promise<void> {
  const session = this.neo4j.getSession('WRITE');
  try {
    await session.executeWrite(async (tx) => {
      // Remove tag from source
      await tx.run(
        `MATCH (s:Solution {id: $fromId})-[r:TAGGED_WITH]->(t:Tag {name: $tag})
         DELETE r`,
        { fromId: solutionFromId, tag: tagName },
      );
      // Add tag to destination
      await tx.run(
        `MATCH (s:Solution {id: $toId})
         MERGE (t:Tag {name: $tag})
         MERGE (s)-[:TAGGED_WITH]->(t)`,
        { toId: solutionToId, tag: tagName },
      );
    });
  } finally {
    await session.close();
  }
}
```

### Why managed transactions?

- **Automatic retry** — on transient errors (leader switch, deadlock), the driver retries the entire function
- **Atomicity** — all queries in the function succeed or all roll back
- **Proper resource management** — transaction is committed on success, rolled back on throw

## Read transactions

```typescript
async searchByTags(tags: string[], limit: number): Promise<Solution[]> {
  const session = this.neo4j.getSession('READ');
  try {
    const result = await session.executeRead(async (tx) => {
      return tx.run(
        `MATCH (s:Solution)-[:TAGGED_WITH]->(t:Tag)
         WHERE t.name IN $tags
         WITH s, count(t) AS matchCount
         ORDER BY matchCount DESC
         LIMIT $limit
         RETURN s.id, s.title, matchCount`,
        { tags, limit: neo4j.int(limit) },
      );
    });
    return result.records.map(this.mapSearchResult);
  } finally {
    await session.close();
  }
}
```

**Note:** `executeRead` routes to followers in a cluster, reducing load on the leader.

## Error handling patterns

### Catch specific Neo4j errors

```typescript
import { Neo4jError } from 'neo4j-driver';

async create(dto: CreateSolutionDto): Promise<Solution> {
  const session = this.neo4j.getSession();
  try {
    const result = await session.run(
      `CREATE (s:Solution {id: $id, title: $title})
       RETURN s`,
      { id: dto.id, title: dto.title },
    );
    return this.mapRecord(result.records[0]);
  } catch (error) {
    if (error instanceof Neo4jError) {
      // Constraint violation — duplicate id
      if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
        throw new ConflictException(`Solution with id ${dto.id} already exists`);
      }
      // Transient error (should not happen with managed tx, but good to know)
      if (error.code.startsWith('Neo.TransientError')) {
        throw new ServiceUnavailableException('Database temporarily unavailable');
      }
    }
    throw error;
  } finally {
    await session.close();
  }
}
```

### Common Neo4j error codes

| Code | Meaning |
|------|---------|
| Neo.ClientError.Schema.ConstraintValidationFailed | Uniqueness violated |
| Neo.ClientError.Statement.SyntaxError | Bad Cypher |
| Neo.ClientError.Statement.ParameterMissing | Query expects param not provided |
| Neo.TransientError.Transaction.DeadlockDetected | Retry the transaction |
| Neo.TransientError.General.DatabaseUnavailable | Cluster leader switching |

## Transaction timeout

```typescript
const session = this.driver.session({
  defaultAccessMode: neo4j.session.WRITE,
  // Timeout individual transactions at 30 seconds
  fetchSize: 1000,
});

await session.executeWrite(async (tx) => {
  // Long-running query with timeout protection
  return tx.run(query, params);
}, {
  timeout: 30000, // ms
});
```

## Pattern: Unit of Work with transaction

```typescript
async importBatch(solutions: CreateSolutionDto[]): Promise<number> {
  const session = this.neo4j.getSession();
  try {
    const result = await session.executeWrite(async (tx) => {
      const res = await tx.run(
        `UNWIND $solutions AS sol
         MERGE (s:Solution {id: sol.id})
         ON CREATE SET s.createdAt = datetime()
         SET s.title = sol.title, s.content = sol.content, s.updatedAt = datetime()
         WITH s, sol
         UNWIND sol.tags AS tagName
         MERGE (t:Tag {name: tagName})
         MERGE (s)-[:TAGGED_WITH]->(t)
         RETURN count(DISTINCT s) AS imported`,
        { solutions },
      );
      return res.records[0].get('imported').toNumber();
    });
    return result;
  } finally {
    await session.close();
  }
}
```

## Anti-pattern: Nested sessions

```typescript
// BAD — opening session inside session leads to pool issues
async bad() {
  const session1 = this.neo4j.getSession();
  const result = await session1.run('MATCH (s:Solution) RETURN s.id');
  for (const record of result.records) {
    const session2 = this.neo4j.getSession(); // DON'T
    await session2.run('...', { id: record.get('s.id') });
    await session2.close();
  }
  await session1.close();
}

// GOOD — single session, batch operation
async good() {
  const session = this.neo4j.getSession();
  try {
    const result = await session.run('MATCH (s:Solution) RETURN s.id');
    const ids = result.records.map(r => r.get('s.id'));
    await session.run(
      'UNWIND $ids AS id MATCH (s:Solution {id: id}) SET s.processed = true',
      { ids },
    );
  } finally {
    await session.close();
  }
}
```
