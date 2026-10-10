# Graph Modeling Patterns

## When to use nodes vs properties

### Use a node when:
- The concept has its own identity and could be referenced independently
- Multiple entities share the same value (tags, categories, technologies)
- You need to query "all things connected to X"
- The concept has its own properties beyond just a name

### Use a property when:
- The value is scalar and belongs to one entity (title, createdAt, description)
- You never need to traverse from that value to find related entities
- The value is unique to that specific node instance

### Decision examples

| Data | Node or Property? | Reason |
|------|-------------------|--------|
| Solution title | Property | Unique to that solution, never traversed |
| Tag name | Node | Shared across solutions, queried independently |
| Created timestamp | Property | Metadata, never a traversal target |
| Author | Node | Has own identity, connects to multiple solutions |
| Priority level | Property (usually) | Unless you query "all high-priority items" frequently |
| Technology (React, Neo4j) | Node | Shared, queried independently, has own metadata |

## Relationship design patterns

### Direct relationship
```cypher
(solution:Solution)-[:TAGGED_WITH]->(tag:Tag)
```
Use when: The connection is simple and needs no metadata.

### Relationship with properties
```cypher
(user:User)-[:CONTRIBUTED {role: "author", since: date()}]->(project:Project)
```
Use when: The connection itself has metadata (dates, roles, weights).

### Intermediate node (reified relationship)
```cypher
(user:User)-[:PERFORMED]->(action:Review)-[:ON]->(solution:Solution)
```
Use when: The relationship has complex data, its own lifecycle, or connects to other nodes.

### Hierarchy pattern
```cypher
(child:Category)-[:CHILD_OF]->(parent:Category)
```
Use when: Tree structures. Query ancestors with variable-length paths: `(c)-[:CHILD_OF*1..5]->(root)`

## Knowledge Base domain model

This is the proven model from the personal KB API:

```
(:Solution {id, title, content, createdAt, updatedAt})
  -[:TAGGED_WITH]->(:Tag {name, createdAt})
  -[:USES_TECHNOLOGY]->(:Technology {name, category, createdAt})
  -[:BELONGS_TO]->(:Project {id, name, description, createdAt})

(:Tag)-[:RELATED_TO]->(:Tag)
(:Technology)-[:RELATED_TO]->(:Technology)
(:Project)-[:USES_TECHNOLOGY]->(:Technology)
```

### Why this model works:
- **Solution** is the primary content node — unique by id
- **Tag** enables cross-cutting categorization — unique by name
- **Technology** captures the tech stack — unique by name
- **Project** groups solutions — unique by id
- Relationships are verb-phrases read left-to-right: "Solution TAGGED_WITH Tag"

## Index strategy

### When to create indexes

| Situation | Index type |
|-----------|-----------|
| Unique identifier (id, name used as key) | Uniqueness constraint (implies index) |
| Frequent WHERE clause filter | Composite or single-property index |
| Full-text search on content | Full-text index |
| Range queries (dates, scores) | Range index (Neo4j 5.x) |

### Constraint = index + uniqueness
```cypher
CREATE CONSTRAINT solution_id IF NOT EXISTS
  FOR (s:Solution) REQUIRE s.id IS UNIQUE
-- This automatically creates a btree index on Solution.id
```

### Composite index (no uniqueness needed)
```cypher
CREATE INDEX solution_status_date IF NOT EXISTS
  FOR (s:Solution) ON (s.status, s.createdAt)
```

### Full-text index
```cypher
CREATE FULLTEXT INDEX solution_search IF NOT EXISTS
  FOR (s:Solution) ON EACH [s.title, s.content]
```

## Modeling rules of thumb

1. **Name relationships as verbs** — TAGGED_WITH, BELONGS_TO, USES_TECHNOLOGY (not "has_tag")
2. **Direction matters for semantics** — even though Neo4j can traverse both ways, pick the natural reading direction
3. **Avoid super-nodes** — if one node connects to millions, consider bucketing or intermediate nodes
4. **Labels are types, not states** — use properties for status/state, labels for entity classification
5. **Start minimal** — add relationships and properties as query patterns demand them, not speculatively
