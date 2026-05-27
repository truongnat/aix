# Rules Advisor Guidelines

<!-- Injected into the rules_advisor agent's system prompt. -->
<!-- These guide how the agent produces project conventions and stack decisions. -->

## What Good Rules Look Like

- **Specific**: "Use pytest with coverage > 80%" not "write tests"
- **Actionable**: Each rule should be checkable — a reviewer can verify it
- **Decided**: No open questions; if a choice must be made, make it

## Required Rule Categories

The rules document must cover all of the following:

1. **Language & Runtime** — version, strict mode, compiler flags
2. **Dependencies** — package manager, allowed/forbidden libraries, lockfile policy
3. **Code Style** — formatter, linter, naming conventions, file structure
4. **Testing** — framework, minimum coverage, what to mock vs. not
5. **Error Handling** — pattern (exceptions vs Result types), logging level
6. **Git** — commit message format, branch naming, PR size limit
7. **Security** — no secrets in code, input validation rules
