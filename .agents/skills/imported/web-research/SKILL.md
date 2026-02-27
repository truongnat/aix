# Skill: web-research
Schema: antigrav.skill@v1

```json
{
  "description": "Use this skill for requests related to web research; it provides a structured approach to conducting comprehensive web research",
  "domain": "imported",
  "executor": "ollama",
  "imported_at_ms": 1772154877813,
  "model": "qwen3:8b",
  "name": "web-research",
  "risk": "unknown",
  "source": "https://github.com/langchain-ai/deepagents",
  "source_commit": "47b920b7a5266d60d379bc0ed66d9c6352e20e28",
  "source_license": "MIT",
  "source_path": "libs/cli/examples/skills/web-research/SKILL.md",
  "source_requested": "https://github.com/langchain-ai/deepagents",
  "tags": [
    "external",
    "imported",
    "skillpack"
  ],
  "temperature": 0.1
}
```

## Overview
Use this skill for requests related to web research; it provides a structured approach to conducting comprehensive web research

## When to Use
- Research complex topics requiring multiple information sources
- Gather and synthesize current information from the web
- Conduct comparative analysis across multiple subjects
- Produce well-sourced research reports with clear citations

## Examples
- mkdir research_[topic_name]
- Research [SPECIFIC TOPIC]. Use the web_search tool to gather information.
After completing your research, use write_file to save your findings to research_[topic_name]/findings_[subtopic].md.
Include key facts, relevant quotes, and source URLs.
Use 3-5 web searches maximum.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `https://github.com/langchain-ai/deepagents`; resolved source `https://github.com/langchain-ai/deepagents`; path `libs/cli/examples/skills/web-research/SKILL.md`.
Pinned source commit: `47b920b7a5266d60d379bc0ed66d9c6352e20e28`.
Detected source license: `MIT`.

Original excerpt:

# Web Research Skill This skill provides a structured approach to conducting comprehensive web research using the `task` tool to spawn research subagents. It emphasizes planning, efficient delegation, and systematic synthesis of findings. ## When to Use This Skill Use this skill when you need to: - Research complex topics requiring multiple information sources - Gather and synthesize current information from the web - Conduct comparative analysis across multiple subjects - Produce well-sourced research reports with clear citations ## Research Process ### Step 1: Create and Save Research Plan Before delegating to subagents, you MUST: 1. **Create a research folder** - Organize all research files in a dedicated folder relative to the current working directory: ``` mkdir research_[topic_name]

{{input}}
