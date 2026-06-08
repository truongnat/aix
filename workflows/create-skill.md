# Create Skill Workflow

## Purpose

Create a session-scoped or durable skill when repeated capability is worth packaging.

## Decision Tree

- Is the procedure repeatable enough to deserve a skill?
- If no: keep the logic in the current plan or notes.
- If yes: does an existing core or local skill already cover it?
- If yes: reuse or extend that skill instead of duplicating it.
- If no: define inputs, outputs, blocking rules, and first-use evidence before creation.

## When To Create A Skill

Create a skill when:

- the task has a repeatable procedure
- domain rules need progressive disclosure
- multiple prompts/checks/tools should run as one capability
- the same logic will be reused in the session or later sessions

Do **not** create a skill when:

- the change is one-off
- wording-only edits are enough
- an existing core skill already covers the need
- no clear procedure exists yet

## Required Structure

```txt
.harness/sessions/<session>/skills/<skill-id>/
  SKILL.md
  prompt.md
  references/
```

Or for durable promotion:

```txt
.harness/memory/skills/<skill-id>/
```

Use templates:

- `templates/SESSION_SKILL.md`
- `templates/SKILL.md`

## Procedure

1. Name the skill with a stable id.
2. Write frontmatter: status, scope, inputs, outputs, tools.
3. Define trigger, procedure, output contract, and blocking conditions.
4. Add references for long-form guidance.
5. Record first use with `hooks/core/record-skill-run.js`.
6. Archive with `hooks/core/archive-session-skill.js` when done.

## Validation

- skill must not duplicate an existing core skill without reason
- blocking skills must declare `can_block: true`
- write-enabled skills must declare `can_write: true`

## Disposal / Promotion

Lifecycle:

```txt
draft → active → used → archived/disposed → promoted
```

Dispose means archive/deactivate, not delete.

Promote only when the skill is reusable beyond the current session and the reason is explicit.

## Stop Conditions

Stop if:

- the procedure is still unclear
- the skill duplicates existing capability
- required inputs/outputs are undefined

## Artifact Checklist

- Skill id and scope are explicit.
- `SKILL.md` defines trigger, workflow, outputs, and blocking conditions.
- References exist only for guidance too long for the main skill body.
- First use is recorded and promotion reason is explicit if the skill becomes durable.

## Related

- [skill-lifecycle.md](../docs/skill-lifecycle.md)
- [compose-skills.md](compose-skills.md)
