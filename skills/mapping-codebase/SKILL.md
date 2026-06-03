# mapping-codebase

## Purpose

Understand the repository structure, active artifacts, boundaries, and likely impact area before discussion or planning.

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

## Operating Principles

- Start broad, then narrow to the affected area.
- Prefer observed structure over guessed architecture.
- Separate facts, inferences, and unknowns.
- Focus on what the next command needs.

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
