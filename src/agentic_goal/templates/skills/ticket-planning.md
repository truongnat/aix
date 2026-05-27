# Ticket Planning Guidelines

<!-- Injected into the ticket_planner agent's system prompt. -->

## Implementation Plan Format

For each ticket, output:

```
## Implementation Plan: <ticket title>

### Files to create / modify
- `path/to/file.ext` — what changes and why

### Step-by-step approach
1. Step one
2. Step two

### Edge cases to handle
- Case 1
- Case 2

### Testing
- Unit test: <what to test>
- Integration test: <what to test> (if applicable)
```

## Planning Rules

- Read existing code before deciding file structure — do not invent paths
- If a dependency is missing, add its installation as step 1
- Prefer modifying existing files over creating new ones when possible
- Keep the plan tight: if a step can be merged, merge it
