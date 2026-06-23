# Compose Skills Workflow

## Purpose

Compose multiple skills into an ordered workflow with explicit stop rules.

## Decision Tree

- Does one command need multiple capabilities in sequence?
- If no: use a single skill instead of composing.
- If yes: does each step have a concrete output artifact?
- If no: define the artifact chain before running the workflow.
- If yes: run in order and stop immediately when any step blocks.

## When To Compose

Compose skills when:

- one command needs multiple capabilities in sequence
- outputs from one skill feed the next
- stop conditions must be enforced between steps

## Procedure

1. Choose skills in order.
2. Define expected artifact for each step.
3. Record each skill run with `hooks/core/record-skill-run.js`.
4. Stop if any skill returns `blocked`, `failed`, or `requires_user_decision`.
5. Record the workflow in `templates/WORKFLOW_RUN.md`.
6. Archive session-only skills after completion.

## Output Chain

Each step should produce a concrete artifact:

- tool-discovery → `TOOL_CONTEXT.md`
- code-review → `REVIEW.md`
- verification → `VERIFY.md` + tool-run artifacts
- gatekeeper → ship decision or `BLOCKED.md`

## Dispose Rules

After workflow completion:

- archive session-only skills with `hooks/core/archive-session-skill.js`
- promote reusable skills only with explicit reason
- never delete disposed skill files

## Stop Conditions

Stop immediately if any step is blocked or evidence is missing.

## Artifact Checklist

- The ordered skill list is explicit.
- Each step has an expected artifact.
- Stop rules between steps are written down.
- Workflow output is recorded in `WORKFLOW_RUN.md`.

## Related

- [review-and-verify.md](review-and-verify.md)
- [create-skill.md](create-skill.md)
