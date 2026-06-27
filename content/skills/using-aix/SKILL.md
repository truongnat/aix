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

## The default methodology

Unless the user asks for something quick, follow this spine:

1. **Brainstorm** (`brainstorming`) — don't jump to code. Tease out the real goal,
   explore alternatives, surface the spec in digestible chunks, get agreement.
2. **Plan** — break work into small, verifiable tasks with concrete file paths.
3. **TDD** — write the test first, watch it fail, implement, watch it pass.
4. **Subagent-driven execution** — dispatch focused subagents (the host's Task
   tool) per task; review each for spec compliance, then code quality.
5. **Review** — security + quality pass before declaring done.
6. **Ship / Remember** — verify evidence, then record what was learned.

You are the runtime. aix is the playbook and the library — not a separate engine
to invoke. Execute the methodology yourself, using the host's native subagents.
