---
id: report-writer
name: Report Writer
status: active
scope: core
version: 1
can_block: true
can_write: true
inputs:
  - PLAN.md
  - TASKS.md
  - VERIFY.md
  - git diff
  - git status
outputs:
  - REPORT.md
  - PR_MESSAGE.md
  - CHANGE_SUMMARY.md
tools:
  - git
---

# Report Writer Skill

## Purpose

Create PR-ready and daily-development reports from actual changes and verification evidence.

## When To Use

Use this skill at the end of daily development work, after implementation and verification, before opening a pull request or reporting progress.

## When Not To Use

Do not use this skill when:

- there are no code or doc changes
- verification is missing
- git diff cannot be inspected
- the user only asks for brainstorming or planning

## Inputs

- Approved plan
- Task list
- Verification artifact
- Git status
- Git diff summary
- Changed files

## Procedure

1. Read the active session state.
2. Read PLAN, TASKS, and VERIFY.
3. Run `node scripts/generate-report-context.js --json --templates` (or `discover-report-templates.js --write`) to load git context and project PR templates.
4. Prefer project templates from `.github/`, `.gitlab/`, or provider dirs; fall back to `.ai-harness/templates/` or harness `templates/`.
5. Group changes by purpose.
6. Produce `REPORT.md` using the discovered report template structure when available.
7. Produce `PR_MESSAGE.md` following the discovered PR/MR template sections.
8. Produce `CHANGE_SUMMARY.md`.
8. Do not overclaim verification.

## Reasoning Procedure

1. Restate the change and the evidence available.
2. Check the diff and verification artifacts.
3. Derive the smallest accurate report from the evidence.
4. Stop and report blocked if verification or diff context is missing.

## Action Loop

- Thought: identify the report artifact and the facts it must include.
- Action: inspect the plan, tasks, verify output, and git diff.
- Observation: record the real change summary and evidence.
- Repeat until the report is ready.

## Examples

### Example 1

Input: The prompt-standard work is complete and verified.

Output:
- Summary: prompt format standard added and enforced.
- What changed: new standard doc, skill content pass, validator enforcement, eval conformance check.
- Verification: node bin/validate.js and npm test passed.
- PR title/body: ready for handoff.

### Example 2

Input: Verification is missing or the diff cannot be inspected.

Output:
- Blocked: missing verification or missing diff context.
- Needed next step: gather the evidence before writing the report.
## Output Contract

Must produce:

- Summary
- What changed
- Why changed
- Files changed
- Verification
- Risks
- Follow-ups
- PR title and body

## Blocking Conditions

Block if:

- verification is missing or blocked
- diff cannot be inspected
- changed files are unknown
- no meaningful change exists

## Common Failure Modes

- Listing files without explaining why.
- Claiming tests passed without evidence.
- Writing a PR message too vague for reviewers.
- Omitting risks or follow-ups.

## References

- `references/daily-report-template.md`
- `references/pr-message-template.md`
- `references/change-summary-template.md`
- `prompt.md`
