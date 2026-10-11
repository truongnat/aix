---
name: clean-architecture
description: >-
  Design and review the shape of a system: layers and the dependency rule, ports and adapters,
  bounded contexts and feature boundaries, modular monolith vs microservices vs event-driven vs
  CQRS vs serverless, choosing design patterns without over-engineering, and enforcing all of it
  in CI with import checks. Use when the user asks "how should I structure this", "where does this
  code belong", "monolith or microservices", "should we use events/CQRS", "which pattern fits",
  "our modules are coupled", "enforce architecture", "clean architecture / hexagonal / DDD
  boundaries", or before splitting a service, adding a framework, or opening a module boundary.
metadata:
  version: "1.1.0"
  pairs-with: "clean-code (module-level quality) — this skill is the system-level half"
  sources: "Robert C. Martin – Clean Architecture; Alistair Cockburn – Hexagonal Architecture; Eric Evans / Vaughn Vernon – DDD; Simon Brown – Software Architecture for Developers; Chris Richardson – Microservices Patterns"
---


## Boundary

This skill provides implementation patterns for Clean Architecture, Domain-Driven Design (DDD), and Hexagonal Architecture in NestJS/TypeScript applications. It focuses on architectural layering, domain modeling, and dependency inversion. It does NOT cover basic NestJS setup, database migrations, or deployment (those have dedicated skills).

## When to use

Use this skill when:
- Architecting complex NestJS applications requiring long-term maintainability
- Refactoring from tightly-coupled MVC to layered architecture
- Implementing rich domain models with encapsulated business logic
- Designing testable systems with swappable infrastructure
- Creating microservices with clear bounded contexts
- Separating business rules from framework code
- Implementing event-driven architectures with domain events

DO NOT use this skill for:
- Basic NestJS CRUD operations (use nestjs-pro skill)
- Database schema design (use database-specific skills)
- API endpoint design (use api-design-pro skill)
- Simple applications where Clean Architecture would be over-engineering

## Workflow

1. **Analyze the application complexity** - determine if Clean Architecture is warranted
2. **Define the domain model** - identify entities, value objects, aggregates
3. **Design the layer structure** - domain, application, infrastructure, adapters
4. **Implement the domain layer** - entities, value objects, repository ports
5. **Implement the application layer** - use cases, input/output DTOs
6. **Implement adapters** - controllers, repository implementations
7. **Configure dependency injection** - wire everything together in NestJS modules
8. **Write tests** - domain layer tests should be pure unit tests

### Operating principles

- **Dependency Rule**: Dependencies only point inward - domain knows nothing about NestJS, TypeORM, or HTTP
- **Rich Domain Models**: Put business logic in entities, not services - avoid anemic domain models
- **Immutability**: Value objects must be immutable - use private constructors with static factory methods
- **Interface Segregation**: Keep repository interfaces small and focused - one repository per aggregate
- **Constructor Injection**: Use NestJS DI in outer layers only - domain entities use plain constructors
- **Validation at Boundaries**: Validate DTOs at API boundary and enforce invariants in domain entities
- **Pure Domain Tests**: Domain layer tests require no NestJS testing module - fast pure unit tests
- **Transactions in Application**: Keep transaction management in application layer, not domain
- **Symbol Tokens**: Use Symbol() for DI tokens to avoid string coupling in NestJS modules
- **Aggregate Roots**: Protect invariants through aggregate roots - access entities only through aggregates

## Suggested response format

```
Architecture Pattern: [Clean Architecture / DDD / Hexagonal]
Layer: [Domain / Application / Infrastructure / Adapter]
Component: [Entity / Use Case / Repository / Controller]
Status: [success/failed]
Details: [implementation details, code snippets, file paths]
Next steps: [follow-up actions if any]
```

## Resources in this skill

- **Architecture Patterns**: Clean Architecture, DDD, Hexagonal Architecture
- **Code Examples**: Value objects, entities, aggregates, use cases, adapters
- **Best Practices**: Dependency inversion, immutability, interface segregation
- **Reference Documentation**: TypeScript-specific patterns, NestJS integration details

## Quick example

**Implement a Value Object:**

```
1. Create domain/value-objects/email.vo.ts
2. Implement private constructor with static factory method
3. Add validation in the factory method
4. Implement equals() and getValue() methods
5. Use in entities instead of raw strings
```

## Checklist before calling the skill done

- [ ] Application complexity warrants Clean Architecture overhead
- [ ] Team understands DDD concepts (entities, value objects, aggregates)
- [ ] NestJS project structure is established
- [ ] Domain model can be clearly defined
- [ ] Time is available for initial architecture setup
- [ ] Team is committed to maintaining architectural boundaries
- [ ] Testing strategy includes pure domain unit tests
- [ ] Dependency injection strategy is defined

---

# Clean Architecture, DDD & Hexagonal Architecture for NestJS

## Overview

This skill provides comprehensive guidance for implementing Clean Architecture, Domain-Driven Design (DDD), and Hexagonal Architecture patterns in NestJS/TypeScript applications. It covers the architectural layers, tactical patterns, and practical implementation examples for building maintainable, testable, and loosely-coupled backend systems.

## When to Use

- Architecting complex NestJS applications with long-term maintainability
- Refactoring from tightly-coupled MVC to layered architecture
- Implementing rich domain models with business logic encapsulation
- Designing testable systems with swappable infrastructure
- Creating microservices with clear bounded contexts
- Separating business rules from framework code
- Implementing event-driven architectures with domain events

## Implementation walkthrough

Layer-by-layer implementation guide (entities, use cases, ports/adapters, NestJS wiring, examples):
see [references/implementation-walkthrough.md](references/implementation-walkthrough.md).

## Best Practices

1. **Dependency Rule**: Dependencies only point inward - domain knows nothing about NestJS, TypeORM, or HTTP
2. **Rich Domain Models**: Put business logic in entities, not services - avoid anemic domain models
3. **Immutability**: Value objects must be immutable - use private constructors with static factory methods
4. **Interface Segregation**: Keep repository interfaces small and focused - one repository per aggregate
5. **Constructor Injection**: Use NestJS DI in outer layers only - domain entities use plain constructors
6. **Validation at Boundaries**: Validate DTOs at API boundary and enforce invariants in domain entities
7. **Pure Domain Tests**: Domain layer tests require no NestJS testing module - fast pure unit tests
8. **Transactions in Application**: Keep transaction management in application layer, not domain
9. **Symbol Tokens**: Use Symbol() for DI tokens to avoid string coupling in NestJS modules
10. **Aggregate Roots**: Protect invariants through aggregate roots - access entities only through aggregates

## Constraints and Warnings

### Architecture Constraints

- **Dependency Rule**: Never allow inner layers to depend on outer layers
- **Domain Purity**: Domain layer must have zero dependencies on frameworks (NestJS, TypeORM, etc.)
- **Interface Location**: Repository interfaces belong in the domain layer, implementations in adapters
- **Immutability**: Value objects must be immutable - no setters allowed

### Common Pitfalls to Avoid

- **Leaky Abstractions**: ORM entities leaking into domain layer
- **Anemic Domain**: Entities with only getters/setters, logic in services
- **Wrong Layer**: Framework decorators in domain entities
- **Missing Ports**: Direct dependency on concrete implementations instead of interfaces
- **Over-Engineering**: Clean Architecture for simple CRUD operations is unnecessary overhead

### Implementation Warnings

- **Mapping Overhead**: Repository adapters require mapping between domain and ORM entities
- **Learning Curve**: Team must understand DDD concepts before implementation
- **Boilerplate**: More files and interfaces compared to traditional layered architecture
- **Transaction Boundaries**: Transactions must be managed at the application layer, not domain

## References

- `references/typescript-clean-architecture.md` - TypeScript-specific patterns
- `references/nestjs-implementation.md` - NestJS integration details
- `references/dependency-rule-system-model.md` - inward stability, ports/adapters, dependency vs control flow
- `references/decision-framework-and-tradeoffs.md` - strict vs pragmatic layering, monolith vs services
- `references/decision-tree.md` - how much architecture ceremony a codebase earns
- `references/failure-modes-detection-mitigation.md` - leaky domain, cycles, anemic model, god modules
- `references/anti-patterns.md` - boundary violations and utils-dumping-ground growth
- `references/bounded-context-and-strangler-patterns.md` - anti-corruption layers, incremental migration
- `references/edge-cases.md`, `references/tips-and-tricks.md`, `references/versions-and-stack-dialects.md`, `references/quality-validation-and-guardrails.md`, `references/integration-map.md`
