# Global Project Context

<!-- This file is injected into EVERY agent's system prompt. -->
<!-- Add conventions, domain knowledge, or constraints that apply to the whole project. -->

## General Conventions

- Use clear, descriptive names for variables, functions, and files
- Keep functions small and single-purpose
- Prefer explicit over implicit — avoid magic numbers, use named constants
- All user-facing error messages should be actionable (tell the user what to do next)

## Repository Structure

- Source code lives in `src/`
- Tests live in `tests/`
- Do not commit secrets, API keys, or credentials
- Do not modify files inside `.goal/` — that directory is reserved for agent metadata
