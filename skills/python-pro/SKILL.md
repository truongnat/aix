---
name: python-pro
description: Expert Python development covering modern Python 3.12+, type hinting, async, dependency management (Poetry/UV), and testing.
metadata:
  short-description: Python — Modern Python, Async, Type Hinting, Poetry, Testing
  content-language: en
  domain: data-ai
  level: professional
---

# Python Pro

Expert-level orchestration of modern Python applications. Focuses on performance, type safety, and maintainability in the 2026 ecosystem.

## Boundary

**`python-pro`** covers core language features (AsyncIO, Generators, Type Hints), dependency management (UV, Poetry), testing (Pytest), and common libraries for AI and Backend. It does NOT cover specific framework internal logic (use `django-pro` or `fastapi-pro` for that).

## When to use

- Building scalable backends or CLI tools in Python.
- Writing type-safe, maintainable AI/ML scripts.
- Refactoring legacy Python code to modern 3.12+ standards.
- Optimizing performance through async or C-extensions (Cython).

## Workflow

1. **Environment Setup**: Initialize project with `uv` or `poetry`.
2. **Schema Definition**: Use `Pydantic` for data validation and `Type Hints`.
3. **Core Logic**: Implement features using functional or OOP patterns.
4. **Async Implementation**: Use `AsyncIO` for I/O bound tasks.
5. **Testing**: Write comprehensive unit/integration tests with `Pytest`.
6. **Linting & Formatting**: Enforce standards with `Ruff`.

### Operating principles

- **Type Everything**: Use strict type hinting (`mypy`/`pyright`) everywhere.
- **Modern Standards**: Use Python 3.12+ features (f-strings, pattern matching).
- **Explicit over Implicit**: Follow PEP 20 (The Zen of Python).
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Python Engineer.
</Role>

<Feature>
[Python Component/Script Description]
</Feature>

<Implementation>
[Clean, type-hinted Python code Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan with Pytest examples]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Python Roadmap | [roadmap.sh/python](https://roadmap.sh/python) |
| PEP 8 — Style Guide | [python.org/dev/peps/pep-0008](https://www.python.org/dev/peps/pep-0008/) |
| Pydantic Docs | [docs.pydantic.dev](https://docs.pydantic.dev) |
| Ruff Linter | [docs.astral.sh/ruff](https://docs.astral.sh/ruff) |

## Quick example

**Feature:** Async API client with type safety.

```python
from typing import List
import asyncio
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str

async def fetch_users() -> List[User]:
    # ... async logic
    return [User(id=1, name="Alice")]

if __name__ == "__main__":
    users = asyncio.run(fetch_users())
    print(users)
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Data structures and async flow planned.
- [ ] **Simplicity First**: Built-in libraries used where possible; no over-engineering.
- [ ] **Surgical Changes**: Only touched relevant modules.
- [ ] **Goal-Driven Execution**: Verified with Pytest and type checks.
- [ ] Strict type hinting (Type hints + MyPy/Pyright) applied.
- [ ] AsyncIO used correctly without blocking the event loop.
- [ ] Dependency management (pyproject.toml) configured.
