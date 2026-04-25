# Applying Karpathy Principles in Practice

How to apply the 4 Karpathy principles in different coding contexts.

## Frontend (React/Vue/Angular)

### Think Before Coding
- Ask: Component purpose? Props interface? State management needs?
- Clarify: New component or modify existing? Design system constraints?

### Simplicity First
- Start with presentational component (props in, UI out)
- Add state only when necessary
- Add effects/hooks only when justified

### Surgical Changes
- Only touch the component and its direct consumers
- Don't refactor sibling components
- Match existing component structure and naming

### Goal-Driven Execution
- Verify: Component renders with mock props
- Verify: Interactions work as expected
- Verify: No console errors

## Backend (API/Database)

### Think Before Coding
- Ask: Auth requirements? Rate limiting? Data validation?
- Clarify: New endpoint or modify existing? Migration needed?

### Simplicity First
- Start with basic CRUD endpoint
- Add caching only when performance measured
- Add complexity (queuing, events) only when justified

### Surgical Changes
- Only touch the route/handler and its tests
- Don't refactor unrelated middleware
- Match existing route structure

### Goal-Driven Execution
- Verify: Endpoint accepts valid requests
- Verify: Endpoint rejects invalid requests
- Verify: Database state correct after operation

## DevOps/Infrastructure

### Think Before Coding
- Ask: Environment? Existing tooling? Rollback requirements?
- Clarify: New service or modify existing? Monitoring needs?

### Simplicity First
- Start with manual deployment
- Add automation only when pain justified
- Add complexity (canary, feature flags) incrementally

### Surgical Changes
- Only touch the specific service/deployment
- Don't refactor unrelated infrastructure
- Match existing IaC patterns

### Goal-Driven Execution
- Verify: Deployment succeeds
- Verify: Health checks pass
- Verify: Rollback works if needed

## Testing

### Think Before Coding
- Ask: What behavior to verify? Unit vs integration? Mock strategy?

### Simplicity First
- Start with happy path test
- Add edge cases incrementally

### Surgical Changes
- Only add tests for modified code
- Don't expand test scope beyond the change

### Goal-Driven Execution
- Verify: Test passes
- Verify: Test fails when code broken
- Verify: Coverage meets team standards
