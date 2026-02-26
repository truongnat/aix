# Skill: architecture-decision-records
Schema: antigrav.skill@v1

```json
{
  "description": "Write and maintain Architecture Decision Records (ADRs) following best practices for technical decision documentation. Use when documenting significant technical decisions, reviewing past architect...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154360,
  "model": "qwen3:8b",
  "name": "architecture-decision-records",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "architecture-decision-records/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Write and maintain Architecture Decision Records (ADRs) following best practices for technical decision documentation. Use when documenting significant technical decisions, reviewing past architect...

## When to Use
- Making significant architectural decisions
- Documenting technology choices
- Recording design trade-offs
- Onboarding new team members
- Reviewing historical decisions
- Establishing decision-making processes

## Examples
- Proposed → Accepted → Deprecated → Superseded
              ↓
           Rejected
- # ADR-0001: Use PostgreSQL as Primary Database

## Status

Accepted

## Context

We need to select a primary database for our new e-commerce platform. The system
will handle:
- ~10,000 concurrent users
- Complex product catalog with hierarchical categories
- Transaction processing for orders and payments
- Full-text search for products
- Geospatial queries for store locator

The team has experience with MySQL, PostgreSQL, and MongoDB. We need ACID
compliance for financial transactions.

## Decision Drivers

* **Must have ACID compliance** for payment processing
* **Must support complex queries** for reporting
* **Should support full-text search** to reduce infrastructure complexity
* **Should have good JSON support** for flexible product attributes
* **Team familiarity** reduces onboarding time

## Considered Options

### Option 1: PostgreSQL
- **Pros**: ACID compliant, excellent JSON support (JSONB), built-in full-text
  search, PostGIS for geospatial, team has experience
- **Cons**: Slightly more complex replication setup than MySQL

### Option 2: MySQL
- **Pros**: Very familiar to team, simple replication, large community
- **Cons**: Weaker JSON support, no built-in full-text search (need
  Elasticsearch), no geospatial without extensions

### Option 3: MongoDB
- **Pros**: Flexible schema, native JSON, horizontal scaling
- **Cons**: No ACID for multi-document transactions (at decision time),
  team has limited experience, requires schema design discipline

## Decision

We will use **PostgreSQL 15** as our primary database.

## Rationale

PostgreSQL provides the best balance of:
1. **ACID compliance** essential for e-commerce transactions
2. **Built-in capabilities** (full-text search, JSONB, PostGIS) reduce
   infrastructure complexity
3. **Team familiarity** with SQL databases reduces learning curve
4. **Mature ecosystem** with excellent tooling and community support

The slight complexity in replication is outweighed by the reduction in
additional services (no separate Elasticsearch needed).

## Consequences

### Positive
- Single database handles transactions, search, and geospatial queries
- Reduced operational complexity (fewer services to manage)
- Strong consistency guarantees for financial data
- Team can leverage existing SQL expertise

### Negative
- Need to learn PostgreSQL-specific features (JSONB, full-text search syntax)
- Vertical scaling limits may require read replicas sooner
- Some team members need PostgreSQL-specific training

### Risks
- Full-text search may not scale as well as dedicated search engines
- Mitigation: Design for potential Elasticsearch addition if needed

## Implementation Notes

- Use JSONB for flexible product attributes
- Implement connection pooling with PgBouncer
- Set up streaming replication for read replicas
- Use pg_trgm extension for fuzzy search

## Related Decisions

- ADR-0002: Caching Strategy (Redis) - complements database choice
- ADR-0005: Search Architecture - may supersede if Elasticsearch needed

## References

- [PostgreSQL JSON Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [PostgreSQL Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- Internal: Performance benchmarks in `/docs/benchmarks/database-comparison.md`
- # ADR-0012: Adopt TypeScript for Frontend Development

**Status**: Accepted
**Date**: 2024-01-15
**Deciders**: @alice, @bob, @charlie

## Context

Our React codebase has grown to 50+ components with increasing bug reports
related to prop type mismatches and undefined errors. PropTypes provide
runtime-only checking.

## Decision

Adopt TypeScript for all new frontend code. Migrate existing code incrementally.

## Consequences

**Good**: Catch type errors at compile time, better IDE support, self-documenting
code.

**Bad**: Learning curve for team, initial slowdown, build complexity increase.

**Mitigations**: TypeScript training sessions, allow gradual adoption with
`allowJs: true`.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `architecture-decision-records/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Architecture Decision Records Comprehensive patterns for creating, maintaining, and managing Architecture Decision Records (ADRs) that capture the context and rationale behind significant technical decisions. ## Use this skill when - Making significant architectural decisions - Documenting technology choices - Recording design trade-offs - Onboarding new team members - Reviewing historical decisions - Establishing decision-making processes ## Do not use this skill when - You only need to document small implementation details - The change is a minor patch or routine maintenance - There is no architectural decision to capture ## Instructions 1. Capture the decision context, constraints, and drivers. 2. Document considered options with tradeoffs. 3. Record the decision, rationale, and conse

{{input}}
