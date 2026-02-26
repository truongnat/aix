# Skill: concise-planning
Schema: antigrav.skill@v1

```json
{
  "description": "Use when a user asks for a plan for a coding task, to generate a clear, actionable, and atomic checklist.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154367,
  "model": "qwen3:8b",
  "name": "concise-planning",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "concise-planning/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Use when a user asks for a plan for a coding task, to generate a clear, actionable, and atomic checklist.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Plan

<High-level approach>

## Scope

- In:
- Out:

## Action Items

[ ] <Step 1: Discovery>
[ ] <Step 2: Implementation>
[ ] <Step 3: Implementation>
[ ] <Step 4: Validation/Testing>
[ ] <Step 5: Rollout/Commit>

## Open Questions

- <Question 1 (max 3)>

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `concise-planning/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Concise Planning ## Goal Turn a user request into a **single, actionable plan** with atomic steps. ## Workflow ### 1. Scan Context - Read `README.md`, docs, and relevant code files. - Identify constraints (language, frameworks, tests). ### 2. Minimal Interaction - Ask **at most 1–2 questions** and only if truly blocking. - Make reasonable assumptions for non-blocking unknowns. ### 3. Generate Plan Use the following structure: - **Approach**: 1-3 sentences on what and why. - **Scope**: Bullet points for "In" and "Out". - **Action Items**: A list of 6-10 atomic, ordered tasks (Verb-first). - **Validation**: At least one item for testing. ## Plan Template ```markdown # Plan <High-level approach> ## Scope - In: - Out: ## Action Items [ ] <Step 1: Discovery> [ ] <Step 2: Implementation> [ ] <

{{input}}
