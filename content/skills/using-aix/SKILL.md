---
name: using-aix
description: >-
  Entry-point skill for the aix platform. Injected at session start. Explains
  that the agent has access to a large skill library (domain + process) and an
  opinionated engineering methodology, and how to reach the rest of them via the
  Skill tool, router-pro, and tool-discovery. Read this first; it is the map.
disable-model-invocation: false
user-invocable: true
x-kind: process
x-version: 0.1.0
x-tags: [meta, entry-point, dispatch, methodology]
x-roles: [planner, coder, reviewer, architect]
x-compatible: [claude, cursor, codex, gemini]
---

# Using aix

You have aix. aix gives you two things:

1. **A skill library** — 160+ skills. Two kinds:
   - **Process skills** (the methodology spine): how to work — `brainstorming`,
     `router-pro`, `tool-discovery`, planning, TDD, review, ship.
   - **Domain skills** (the library): deep references — `react-pro`, `aws-pro`,
     `api-design-pro`, and many more.
2. **A methodology** — a default flow you follow unless told otherwise.

## How to reach the other skills

This skill is the only one injected inline. For everything else, **use the `Skill`
tool** with the skill's name. To decide *which* skill:

- For a broad or ambiguous request, invoke **`router-pro`** — it analyses the
  request, sharpens the prompt, and routes to the right skill(s)/workflow.
- To find a skill or tool by capability, invoke **`tool-discovery`**.
- If you already know the skill name, call `Skill` with it directly.

**Check for a relevant skill before starting any non-trivial task.** Skills are
the proven path, not optional decoration.

## The default methodology (the spine)

Unless the user asks for something quick, follow this spine. Each step is a real
aix process skill — invoke it via the `Skill` tool by the name in backticks:

1. **`discussing-goals`** — align on what success actually means before anything.
2. **`brainstorming`** — for fuzzy problems: explore alternatives, surface the
   spec in digestible chunks, get agreement before any code.
3. **`writing-plans`** — break the work into small, verifiable tasks with concrete
   file paths and verification steps.
4. **`using-git-worktrees`** — isolate the work on a branch with a clean baseline.
5. **`test-driven-development`** — write the test first, watch it fail, implement,
   watch it pass.
6. **`executing-plans`** — dispatch focused subagents (the host's Task tool) per
   task; review each for spec compliance, then code quality.
7. **`requesting-code-review`** / **`code-review`** — security + quality pass.
8. **`verification-before-completion`** — prove it works before declaring done.
9. **`remembering`** — record what was learned.

Supporting skills: `mapping-codebase` (orient in unfamiliar code),
`debugging-investigation` (systematic root-cause), `writing-skills` (author new
skills). See **`using-harness`** for the full operating contract.

You are the runtime. aix is the playbook and the library — not a separate engine
to invoke. Execute the spine yourself, using the host's native subagents.
