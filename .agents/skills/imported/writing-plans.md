# Skill: writing-plans
Schema: antigrav.skill@v1

```json
{
  "description": "Use when you have a spec or requirements for a multi-step task, before touching code",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154409,
  "model": "qwen3:8b",
  "name": "writing-plans",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "writing-plans/SKILL.md",
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
Use when you have a spec or requirements for a multi-step task, before touching code

## When to Use
- Use when the task matches this skill domain.

## Examples
- # [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
- ### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**
- **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `writing-plans/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Writing Plans ## Overview Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits. Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well. **Announce at start:** "I'm using the writing-plans skill to create the implementation plan." **Context:** This should be run in a dedicated worktree (created by brainstorming skill). **Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md` ## Bite-Sized Task Granularity **Each s

{{input}}
