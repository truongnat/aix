# Skill: mcp-builder
Schema: antigrav.skill@v1

```json
{
  "description": "Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate exte...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154392,
  "model": "qwen3:8b",
  "name": "mcp-builder",
  "risk": "safe",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "mcp-builder/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "builder",
    "external",
    "imported",
    "mcp"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate exte...

## When to Use
- Use when the task matches this skill domain.

## Examples
- <evaluation>
  <qa_pair>
    <question>Find discussions about AI model launches with animal codenames. One model needed a specific safety designation that uses the format ASL-X. What number X was being determined for the model named after a spotted wild cat?</question>
    <answer>3</answer>
  </qa_pair>
<!-- More qa_pairs... -->
</evaluation>

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `mcp-builder/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# MCP Server Development Guide ## Overview Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks. --- # Process ## 🚀 High-Level Workflow Creating a high-quality MCP server involves four main phases: ### Phase 1: Deep Research and Planning #### 1.1 Understand Modern MCP Design **API Coverage vs. Workflow Tools:** Balance comprehensive API endpoint coverage with specialized workflow tools. Workflow tools can be more convenient for specific tasks, while comprehensive coverage gives agents flexibility to compose operations. Performance varies by client—some clients benefit from code execution that combines basic tools, while

{{input}}
