# mapping-codebase

## Purpose

Understand the repository structure, active artifacts, boundaries, and likely impact area before discussion or planning.

Treat this as the Explore phase of the harness workflow. When a delegated explorer worker is available, use it for broad reads and keep the returned map bounded and decision-oriented.

## When To Use

- in unfamiliar codebases
- before planning a change
- when impact scope or ownership is unclear

## When Not To Use

- when the affected area is already mapped and unchanged
- when the task is limited to a known artifact with no impact questions
- when the active command is already `harness-run` with a stable approved plan and no mapping gap

## Inputs

- current goal and state artifacts
- repository file structure
- relevant memory or context artifacts if they affect impact analysis

## Workflow

1. Read the active goal, state, and context artifacts.
2. Identify likely entry points, boundary files, and affected directories.
3. Separate facts from inferences.
4. Record impact zones, dependencies, and unknowns.
5. Summarize only what later planning or execution needs.
6. Prefer condensed maps and explicit file paths over pasted file dumps.

## Operating Principles

- Start broad, then narrow to the affected area.
- Prefer observed structure over guessed architecture.
- Separate facts, inferences, and unknowns.
- Focus on what the next command needs.

## Reasoning Procedure

1. Restate the area or question that needs mapping.
2. Find the smallest set of files or artifacts that can answer it.
3. Trace dependencies or ownership from the evidence.
4. Stop and report blocked if the needed path or artifact is missing.

## Action Loop

- Thought: identify the next file, folder, or relationship to inspect.
- Action: search, open, or trace the relevant artifact.
- Observation: record the concrete repository fact that was found.
- Repeat until the map answers the question.

## Examples

### Example 1

Input: Which files enforce the new prompt format?

Output:
- Affected-area map: skills/PROMPT_FORMAT_STANDARD.md, lib/validate/constants.ts, lib/validate/hooks-skills.ts.
- Dependencies: validator headings flow into both core skill files and capability prompt.md files.
- Unknowns: whether an eval exists that checks example quality.

### Example 2

Input: The repository surface needed to answer the question does not exist.

Output:
- Blocked: missing artifact or path.
- Next step: ask for the target file set or restore the missing surface.
## Output Contract

This skill must produce:

- an affected-area map
- key dependencies or boundaries
- explicit unknowns and risks for the next command

## Common Failure Modes

- mapping the whole repo when only one boundary matters
- presenting inference as fact
- loading extra docs that do not help the next command

## Checklist Before Done

- [ ] Relevant artifacts were loaded
- [ ] The affected area is identified
- [ ] Key boundaries or dependencies are noted
- [ ] Facts and inferences are separated
- [ ] Unknowns are explicit instead of hidden
