# Contributor Workflow — Harvesting Knowledge

This guide explains how to turn a successful problem-solving session in an external repo into a permanent improvement for the `skills` repository.

## The Trigger
You should initiate a **Contributor PR** when:
1. You fix a bug that wasn't covered by existing `SKILL.md` or `references/`.
2. You discover a new edge case or a tricky interaction between two technologies.
3. You optimize a prompt or a workflow that significantly reduces token usage (Idea 2).
4. You find a "gotcha" that cost more than 2 turns to debug.

## Step-by-Step Process

### 1. Identify the Target
Determine which skill or reference file should host this new knowledge.
- Is it a general principle? -> `SKILL.md`
- Is it a specific edge case? -> `references/edge-cases.md`
- Is it a new pattern? -> `references/tips-and-tricks.md`

### 2. Prepare the Content
Format the discovery using the repository's standard:
- **Case**: What was the problem?
- **Solution**: How was it fixed?
- **Prevention**: How can we avoid it next time?

### 3. Execute the PR (The Loop)
Use `git-operations-pro` to:
1. `git checkout -b contrib/update-{{skill-name}}-{{date}}`
2. Apply the change to the skill file.
3. Commit with a message: `feat(skill): add edge case for {{context}} discovered in {{project}}`
4. Provide the user with the branch name to push and PR.

## Token-Driven Optimization
If a workflow summary shows excessive token usage (>50k tokens or >10 interactions):
1. Analyze the conversation history for redundancy.
2. Propose a more "surgical" prompt or a better specialized skill.
3. Create a Contributor PR to update the `prompts/` or `skills/` with the optimized version.

## Worked example (cross-skill harvest)

Use this when a bug fix yields **reusable** routing/history knowledge: put the **technical** write-up in the domain skill, and keep **this** file as the “how + pointer”.

| What | Where |
|------|--------|
| Case / solution / prevention (browser Back vs in-app after **edit** routes) | **`nextjs-pro`** → [Edge cases — Browser history and edit flows](/skills/nextjs-pro/references/edge-cases.md#browser-history-and-edit-flows) |
| Contributor steps (branch, commit, PR) | This document — [Step-by-Step Process](#step-by-step-process) |

**Case:** After **list → detail → edit**, two **browser** Back operations should return to **list**. If the second Back from detail incorrectly returns to **edit**, the history stack and “leave edit” handlers are out of sync (see `nextjs-pro` section above).

**Solution:** Document the pattern in **`nextjs-pro/references/edge-cases.md`**; link from here so self-improve readers know where the harvested edge case lives.

**Prevention:** Before closing the contributor PR, confirm the new text is **framework-level**, not a dump of one app’s file names — and add a regression note (e.g. two consecutive browser Backs on edit).

## Anti-patterns
- **Polluting**: Adding very specific project logic that isn't reusable.
- **Bloating**: Adding large blocks of code without explanation.
- **Duplicate**: Adding a rule that already exists in a different skill.
