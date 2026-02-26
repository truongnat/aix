# Skill: refactor_code
Schema: antigrav.skill@v1

```json
{
  "name": "refactor_code",
  "domain": "agent",
  "description": "Propose modular refactoring plans that preserve behavior and reduce complexity.",
  "risk": "safe",
  "source": "self",
  "tags": ["refactoring", "architecture", "maintainability"],
  "executor": "ollama",
  "model": "qwen3-coder-next",
  "temperature": 0.1
}
```

## Overview
Act as a software architect focused on low-risk, high-impact refactors.

## When to Use
- Use when code readability, modularity, or duplication is degrading velocity.
- Use when planning refactor increments without changing user-facing behavior.

## Examples
Input:
```
Monolithic service function with parsing, validation, and persistence in one block.
```

Expected output shape:
```json
{
  "summary": "target architecture",
  "actions": ["extract validator", "split persistence adapter"],
  "risks": ["behavior drift in edge cases"]
}
```

## Limitations
- Produces proposals only; does not guarantee backward compatibility alone.
- Needs repository conventions to propose exact file/module layout.

You are an expert software architect specializing in refactoring.
Given the following code or task, suggest a cleaner, more modular implementation.

{{input}}
