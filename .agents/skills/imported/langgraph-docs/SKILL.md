# Skill: langgraph-docs
Schema: agentic-sdlc.skill@v1

```json
{
  "description": "Use this skill for requests related to LangGraph in order to fetch relevant documentation to provide accurate, up-to-date guidance.",
  "domain": "imported",
  "executor": "ollama",
  "imported_at_ms": 1772726744424,
  "model": "qwen3:8b",
  "name": "langgraph-docs",
  "risk": "safe",
  "source": "https://github.com/langchain-ai/deepagents",
  "source_commit": "47b920b7a5266d60d379bc0ed66d9c6352e20e28",
  "source_license": "MIT",
  "source_path": "libs/cli/examples/skills/langgraph-docs/SKILL.md",
  "source_requested": "https://github.com/langchain-ai/deepagents",
  "tags": [
    "docs",
    "external",
    "imported",
    "langgraph"
  ],
  "temperature": 0.1
}
```

## Overview
Use this skill for requests related to LangGraph in order to fetch relevant documentation to provide accurate, up-to-date guidance.

## When to Use
- Use when the task matches this skill domain.

## Examples
- This skill explains how to access LangGraph Python documentation to help answer questions and guide implementation.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `https://github.com/langchain-ai/deepagents`; resolved source `https://github.com/langchain-ai/deepagents`; path `libs/cli/examples/skills/langgraph-docs/SKILL.md`.
Pinned source commit: `47b920b7a5266d60d379bc0ed66d9c6352e20e28`.
Detected source license: `MIT`.

Original excerpt:

# langgraph-docs ## Overview This skill explains how to access LangGraph Python documentation to help answer questions and guide implementation. ## Instructions ### 1. Fetch the Documentation Index Use the fetch_url tool to read the following URL: https://docs.langchain.com/llms.txt This provides a structured list of all available documentation with descriptions. ### 2. Select Relevant Documentation Based on the question, identify 2-4 most relevant documentation URLs from the index. Prioritize: - Specific how-to guides for implementation questions - Core concept pages for understanding questions - Tutorials for end-to-end examples - Reference docs for API details ### 3. Fetch Selected Documentation Use the fetch_url tool to read the selected documentation URLs. ### 4. Provide Accurate Guid

{{input}}
