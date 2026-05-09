---
name: mongodb-pro
description: Expert MongoDB development covering document modeling, the Aggregation Framework, indexing strategies, and Atlas administration.
metadata:
  short-description: MongoDB — Document Modeling, Aggregation, Indexing, Atlas
  content-language: en
  domain: database
  level: professional
---

# MongoDB Pro

Expert-level orchestration of MongoDB databases. Focuses on efficient document modeling, complex aggregations, and high-performance indexing.

## Boundary

**`mongodb-pro`** covers NoSQL document modeling, the MongoDB Query Language (MQL), the Aggregation Framework, Indexing (Single, Compound, TTL, Text, Geospatial), and Atlas-specific features (Search, Triggers, Functions). It does NOT cover general SQL concepts (use `sql-data-access-pro` for that).

## When to use

- Designing flexible, high-scale document schemas for web/mobile apps.
- Implementing complex data processing pipelines using the Aggregation Framework.
- Optimizing slow queries through advanced indexing and profiling.
- Setting up and managing MongoDB Atlas clusters with serverless features.

## Workflow

1. **Schema Design**: Map domain entities to MongoDB documents (Embed vs Reference).
2. **Indexing**: Define indexes based on common query patterns.
3. **Query Implementation**: Write efficient MQL queries for CRUD operations.
4. **Aggregation**: Build pipelines for complex data transformations.
5. **Optimization**: Analyze execution plans with `.explain()` and optimize.
6. **Administration**: Configure security, backups, and monitoring in Atlas.

### Operating principles

- **Design for Queries**: Structure your documents based on how the application will access the data.
- **Aggregation over Application Logic**: Use the database's power for data transformations where possible.
- **Monitor and Profile**: Continuously analyze query performance and index usage.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior MongoDB Database Engineer.
</Role>

<Schema>
[Document structure/Schema description]
</Schema>

<Implementation>
[MQL Queries or Aggregation Pipeline Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan: mongo shell or Compass]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| MongoDB Roadmap | [roadmap.sh/mongodb](https://roadmap.sh/mongodb) |
| MongoDB University | [university.mongodb.com](https://university.mongodb.com) |
| Aggregation Pipeline | [mongodb.com/docs/manual/core/aggregation-pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/) |
| Data Modeling Guide | [mongodb.com/docs/manual/core/data-modeling-introduction](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/) |

## Quick example

**Feature:** Aggregation to count orders per customer with total value.

```javascript
db.orders.aggregate([
  { $match: { status: "shipped" } },
  { $group: {
      _id: "$customerId",
      totalOrders: { $sum: 1 },
      totalValue: { $sum: "$amount" }
  }},
  { $sort: { totalValue: -1 } }
]);
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Data access patterns and indexing strategy planned.
- [ ] **Simplicity First**: Simple queries used unless Aggregation is required for performance.
- [ ] **Surgical Changes**: Only modified relevant collections or aggregation stages.
- [ ] **Goal-Driven Execution**: Verified query performance with `.explain("executionStats")`.
- [ ] Proper indexes (Single/Compound) created for all common queries.
- [ ] Document validation rules defined where schema consistency is critical.
- [ ] Security (Role-Based Access Control) correctly configured in Atlas.
