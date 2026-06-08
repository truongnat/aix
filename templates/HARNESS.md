# Harness Profile

> Security: never write credentials, tokens, customer data, or private business data into this file or any `.harness/` file.

## Project

| Field | Value |
|---|---|
| Repository name | (this repository) |
| Type | web app / CLI / service / library |
| Primary language | TypeScript / Python / Go / other |
| Status | draft — update after first harness session |

## Operating Model

This repository uses the `core-loop` workflow:
`harness-start -> discuss -> plan -> run -> verify -> ship -> remember`

Skills: see `.harness/SKILLS.md`  
Quality gates: see `.harness/GATES.md`  
Durable memory: `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`

## Scope

What this harness owns in this repository:
- `.harness/` profile and session artifacts
- `.harness/goals/` active work tracking
- Quality gate enforcement via `.harness/GATES.md`

What it does not own:
- Production code decisions (document in DECISIONS.md, implement in source)
- CI/CD configuration (manage separately)

## Assumptions

Record assumptions that affect planning or verification.
(Start with the most important assumption about this repo's architecture or constraints.)

## Unknowns

Record open questions that need human input or future investigation.

## Human Review

Record anything that should be reviewed by a human before shipping.
(Add after first harness session runs.)
