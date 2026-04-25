---
name: router-pro
description: |
  System skill for automatic request analysis, prompt optimization, and intelligent routing to skills, workflows, or templates. Instead of calling skills individually, this skill analyzes user input, researches and improves the prompt for clarity and accuracy, identifies relevant skills, workflows, or templates, and coordinates execution.

  Use this skill when the user provides a general request that needs automatic decomposition, when the prompt needs optimization for better AI understanding, when appropriate skills or workflows need to be identified and executed, or when a template is needed for reports, issues, or other structured outputs.

  This is a **system skill** - it does not perform domain-specific work but routes to and coordinates **working skills** (auth-pro, react-pro, docker-pro, etc.), **workflows** (/ticket, /debug, /release, etc.), and **templates** (reports, issues, prompts, etc.).

  Triggers: "route", "analyze", "plan", "break down", "how should I", "what skills", "optimize prompt", "orchestrate", "help me with", "template", "report format", "issue template".

metadata:
  short-description: Router — auto analysis, prompt optimization, skill/workflow/template discovery, execution
  content-language: en
  domain: system
  level: foundation
---

# Router (system skill)

Skill text is **English**; answer in the user’s preferred language when Cursor User Rules, project rules, or the conversation specify it.

This skill automatically analyzes user requests, researches and improves prompts for clarity and accuracy, identifies relevant skills, workflows, or templates, and coordinates execution. It serves as an intelligent middle layer between user input and domain-specific execution.

## Boundary

**`router-pro`** owns automatic request analysis, prompt research and optimization, skill/workflow/template discovery, and execution coordination. It does **not** own domain-specific implementation - those are delegated to:

- **Working skills** - Discovered dynamically from `skills/` directory or `skill_index.json` based on triggers and descriptions
- **Workflows** - Structured procedures in `workflows/` directory
- **Templates** - Static resources in `templates/` directory (reports, issues, prompts, scaffolds)

### Dynamic skill discovery

Skills are discovered automatically by:
1. Reading `skills/` directory or `knowledge-base/embeddings/skill_index.json`
2. Matching user input to skill triggers and descriptions
3. Ranking skills by relevance (trigger matches, description keywords, domain alignment)

No hardcoding required - the system automatically discovers all available skills.

## When to use

- User provides a general request that needs automatic analysis and routing
- Prompt needs research and optimization for clarity and accuracy
- Appropriate skills, workflows, or templates need to be identified automatically
- User asks "how should I approach X" or "help me with Y"
- Request needs decomposition into actionable steps
- Multiple skills, workflows, or templates might be needed for a complex task
- User needs a report format, issue template, or other structured output
- User asks for "template", "report format", "issue template"

## When not to use

- User request is clearly domain-specific and can directly use a working skill
- User explicitly names a specific skill (e.g., "use auth-pro")
- Simple, single-skill tasks that don't need orchestration
- When the working skill can handle the request directly

## Required inputs

- **User query**: The original user request or description
- **Context**: Project context (tech stack, constraints, goals)
- **Current state**: What's already been done or implemented

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** **Analyze** the user input to understand intent, scope, and complexity → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.