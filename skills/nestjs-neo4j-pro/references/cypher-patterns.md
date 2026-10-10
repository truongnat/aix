# Cypher Patterns

## Core query patterns

### MATCH — read existing data
```cypher
// Find a solution by id
MATCH (s:Solution {id: $id})
RETURN s.id, s.title, s.content, s.createdAt

// Find with relationship
MATCH (s:Solution {id: $id})-[:TAGGED_WITH]->(t:Tag)
RETURN s.title, collect(t.name) AS tags

// Variable-length path
MATCH (t:Tag {name: $name})-[:RELATED_TO*1..3]-(related:Tag)
RETURN DISTINCT related.name
```

### MERGE — idempotent upsert
```cypher
// Upsert a solution
MERGE (s:Solution {id: $id})
ON CREATE SET s.createdAt = datetime()
SET s.title = $title, s.content = $content, s.updatedAt = datetime()
RETURN s

// Upsert a relationship
MATCH (s:Solution {id: $solutionId})
MERGE (t:Tag {name: $tagName})
MERGE (s)-[:TAGGED_WITH]->(t)
RETURN s, t
```

**Critical order:** ON CREATE SET must come before SET. SET runs on every match (create or existing). ON CREATE SET runs only on new nodes.

### CREATE — when you know it's new
```cypher
// Only use CREATE when duplicates are impossible or desired
CREATE (log:AuditLog {action: $action, timestamp: datetime(), userId: $userId})
RETURN log
```

## OPTIONAL MATCH — left-join equivalent
```cypher
// Get solution even if it has no tags
MATCH (s:Solution {id: $id})
OPTIONAL MATCH (s)-[:TAGGED_WITH]->(t:Tag)
RETURN s.title, collect(t.name) AS tags
// tags will be [] if no TAGGED_WITH relationships exist
```

## Pagination with SKIP/LIMIT

**Critical:** Always use neo4j.int() for SKIP and LIMIT values in the driver.

```cypher
MATCH (s:Solution)
WHERE s.status = $status
RETURN s.id, s.title, s.createdAt
ORDER BY s.createdAt DESC
SKIP $offset
LIMIT $limit
```

```typescript
const result = await session.run(query, {
  status: 'published',
  offset: neo4j.int(page * pageSize),
  limit: neo4j.int(pageSize),
});
```

## Aggregation patterns

### Count
```cypher
MATCH (s:Solution)-[:TAGGED_WITH]->(t:Tag)
RETURN t.name, count(s) AS solutionCount
ORDER BY solutionCount DESC
```

### Collect (array aggregation)
```cypher
MATCH (s:Solution {id: $id})-[:TAGGED_WITH]->(t:Tag)
MATCH (s)-[:USES_TECHNOLOGY]->(tech:Technology)
RETURN s.title,
       collect(DISTINCT t.name) AS tags,
       collect(DISTINCT tech.name) AS technologies
```

### WITH for intermediate aggregation
```cypher
MATCH (s:Solution)-[:TAGGED_WITH]->(t:Tag)
WITH t, count(s) AS usage
WHERE usage > 5
RETURN t.name, usage
ORDER BY usage DESC
```

## DETACH DELETE — remove nodes safely
```cypher
// Delete a solution and all its relationships
MATCH (s:Solution {id: $id})
DETACH DELETE s

// Delete only a relationship
MATCH (s:Solution {id: $solutionId})-[r:TAGGED_WITH]->(t:Tag {name: $tagName})
DELETE r
```

**Never use DELETE on a node with relationships** — it will error. Always DETACH DELETE or delete relationships first.

## UNWIND for batch operations
```cypher
// Batch create tags and link to solution
MATCH (s:Solution {id: $solutionId})
UNWIND $tags AS tagName
MERGE (t:Tag {name: tagName})
ON CREATE SET t.createdAt = datetime()
MERGE (s)-[:TAGGED_WITH]->(t)
RETURN s, collect(t.name) AS tags
```

```typescript
await session.run(query, {
  solutionId: dto.id,
  tags: ['nestjs', 'neo4j', 'graph'],
});
```

## Conditional logic with CASE
```cypher
MATCH (s:Solution)
RETURN s.title,
  CASE
    WHEN s.updatedAt > datetime() - duration('P7D') THEN 'recent'
    WHEN s.updatedAt > datetime() - duration('P30D') THEN 'this-month'
    ELSE 'older'
  END AS freshness
```

## Pattern for replacing relationships
```cypher
// Replace all tags for a solution (delete old, create new)
MATCH (s:Solution {id: $id})
OPTIONAL MATCH (s)-[r:TAGGED_WITH]->(:Tag)
DELETE r
WITH s
UNWIND $tags AS tagName
MERGE (t:Tag {name: tagName})
MERGE (s)-[:TAGGED_WITH]->(t)
RETURN s, collect(t.name) AS tags
```

## Existence checks
```cypher
// Check if a relationship exists without fetching data
MATCH (s:Solution {id: $id})
RETURN s.title,
       EXISTS { (s)-[:TAGGED_WITH]->(:Tag {name: 'important'}) } AS isImportant
```

## Full-text search (requires full-text index)
```cypher
CALL db.index.fulltext.queryNodes('solution_search', $searchTerm)
YIELD node, score
RETURN node.id, node.title, score
ORDER BY score DESC
LIMIT $limit
```
