# Architecture Guidelines (Planner)

<!-- Injected into the planner agent's system prompt. -->
<!-- Define architectural patterns, constraints, and principles for this project. -->

## Design Principles

- Prefer simple, proven solutions over novel/complex ones
- Design for observability: logging, metrics, and error tracing from day one
- Separate concerns: business logic must not depend on infrastructure (DB, HTTP, CLI)
- Define clear module boundaries — avoid circular dependencies

## Output Format

When writing the architecture plan:
- Start with a one-paragraph summary of the approach
- List components as a tree, with a one-line description of each
- Include a data flow section showing how data moves between components
- List open questions or decisions deferred to the Rules phase
