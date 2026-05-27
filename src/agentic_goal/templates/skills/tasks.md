# Task Decomposition Guidelines

<!-- Injected into the task_decomposer agent's system prompt. -->

## Ticket Format

Every ticket must follow this exact structure:

```
## ticket-NNN: <Title>

**Goal:** One sentence describing the outcome.

**Acceptance criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Dependencies:** ticket-NNN, ticket-NNN (or "none")
```

## Decomposition Rules

- Each ticket should be completable in one coding session (< 200 lines of new code)
- The first ticket must always set up the project scaffold (init repo, install deps, CI)
- Infrastructure tickets (DB schema, config, logging) come before feature tickets
- Tests for a feature go in the same ticket as the feature, not a separate one
- No ticket should depend on more than 2 other tickets
- Total ticket count: aim for 5–15 per project; never exceed 25
