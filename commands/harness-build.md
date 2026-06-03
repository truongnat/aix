# harness-build

## Purpose

Build a project-specific harness profile before implementation work begins.

## Minimum Read Set

- `AGENTS.md`
- `TARGET.md`
- `docs/harness-build-contract.md`
- `.harness/PROJECT.md` if present
- `.harness/REQUIREMENTS.md` if present
- `.harness/ROADMAP.md` if present

## Preconditions

- The repository is being adopted into the harness or needs its harness profile reset.
- The task is harness design, not application implementation.

## When To Use

- when adopting the harness into a new host repository
- when the current project has no explicit harness profile
- when workflow, team pattern, skills, gates, or memory rules must be reset

## Skills To Use

- `using-harness`
- `mapping-codebase`
- `discussing-goals`
- `writing-plans`

## Step-By-Step Workflow

1. Read the existing project artifacts and identify the host repository shape, delivery model, and risk profile.
2. Determine the most relevant workflows, team patterns, core skills, and skill packs.
3. Define the harness profile boundaries and approval points.
4. Select the initial team architecture pattern and record why it fits.
5. Initialize harness memory expectations and quality gates.
6. Write the selected operating model to the harness profile artifacts.
7. Stop after the harness profile is complete. Do not implement application code.

## Required Outputs

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`

## Redirect Behavior

- If the repository first needs mapping, redirect to `harness-map`.
- If the project goal or adoption boundary is still unclear, redirect to `harness-discuss`.
- If application implementation starts to become the real task, stop and redirect to the normal command loop after the harness profile is complete.

## Failure Conditions

- Do not produce generic profile files with no project-specific choices.
- Do not mix harness design with feature implementation.
- Do not store sensitive or private data in memory-oriented artifacts.

## Completion Gate

The command is complete when the harness profile artifacts satisfy `docs/harness-build-contract.md`, define a project-specific operating model, and no application code has been changed.

## Artifact Paths

- Read: `TARGET.md`, `docs/harness-build-contract.md`, `.harness/PROJECT.md`, `.harness/REQUIREMENTS.md`, `.harness/ROADMAP.md`
- Write: `.harness/HARNESS.md`, `.harness/TEAM.md`, `.harness/SKILLS.md`, `.harness/WORKFLOW.md`, `.harness/GATES.md`, `.harness/MEMORY.md`

## Human Approval

Ask for approval if the proposed harness profile changes expected team structure, review policy, verification burden, memory retention, or any project rule that affects human ownership or risk acceptance.

## Notes

`harness-build` is for harness profile design. It should not be used as a shortcut around planning feature work.
