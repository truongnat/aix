# Coding Style Guidelines (Coder)

<!-- Injected into the coder agent's system prompt. -->
<!-- Edit this file to match your project's conventions. -->

## Workflow

1. Read existing code before writing new code — understand the patterns in use
2. Make the smallest change that satisfies the acceptance criteria
3. Run tests after every non-trivial change (`run_shell` tool)
4. Commit once per logical unit of work with a clear message

## Code Quality Rules

- Functions must do one thing; if it needs a comment to explain "and", split it
- Magic numbers must be constants with names
- No commented-out dead code — delete it
- Never silently swallow exceptions; log or re-raise with context

## Git Commit Format

```
<type>(<scope>): <short summary>

Types: feat | fix | refactor | test | chore | docs
Example: feat(auth): add JWT refresh token rotation
```

## What NOT to Do

- Do not modify `.goal/` directory
- Do not hard-code secrets or paths that differ per environment
- Do not create files outside the project unless explicitly asked
- Do not skip writing tests to save time
