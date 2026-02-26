# Skill: web-artifacts-builder
Schema: antigrav.skill@v1

```json
{
  "description": "Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state manag",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153442,
  "model": "qwen3:8b",
  "name": "web-artifacts-builder",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "web-artifacts-builder/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/anthropic-skills",
  "tags": [
    "anthropic",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.

## When to Use
- Use when the task matches this skill domain.

## Examples
- bash scripts/init-artifact.sh <project-name>
cd <project-name>
- bash scripts/bundle-artifact.sh

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `web-artifacts-builder/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

# Web Artifacts Builder To build powerful frontend claude.ai artifacts, follow these steps: 1. Initialize the frontend repo using `scripts/init-artifact.sh` 2. Develop your artifact by editing the generated code 3. Bundle all code into a single HTML file using `scripts/bundle-artifact.sh` 4. Display artifact to user 5. (Optional) Test the artifact **Stack**: React 18 + TypeScript + Vite + Parcel (bundling) + Tailwind CSS + shadcn/ui ## Design & Style Guidelines VERY IMPORTANT: To avoid what is often referred to as "AI slop", avoid using excessive centered layouts, purple gradients, uniform rounded corners, and Inter font. ## Quick Start ### Step 1: Initialize Project Run the initialization script to create a new React project: ```bash bash scripts/init-artifact.sh <project-name> cd <projec

{{input}}
