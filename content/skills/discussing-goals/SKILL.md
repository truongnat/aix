---
name: discussing-goals
description: 'Skill: discussing-goals'
x-kind: process
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---
# discussing-goals

## Purpose

Turn a vague request into a clear engineering objective with explicit scope, constraints, and success criteria.

## When To Use

- when requirements are ambiguous
- when tradeoffs or scope boundaries need to be surfaced
- before writing a plan for non-trivial work

## When Not To Use

- when goal, scope, and constraints are already documented clearly
- when only executing an approved plan with no open requirement questions
- when a review or verify artifact already dictates the next action

## Inputs

- current request
- active goal, discussion, and state artifacts
- relevant constraints or prior decisions

## Workflow

1. Restate the ask in concrete engineering terms.
2. Separate confirmed requirements from assumptions.
3. Prior Art & KB Lookup: Search the codebase history and knowledge base (using query/grep tools) to check if the problem or a similar solved pattern/library helper already exists.
4. Identify constraints, risks, utility (is it a critical pain point or vanity request?), security/data integrity considerations, legal/license/copyright compliance, and success criteria.
5. Compare exactly three realistic options with scored dimensions (Value, Effort fit, Risk, Fit) and explicit trade-offs. Each option must evaluate its boundary limits (what it solves vs. what it leaves out) and ensure it doesn't lock the system's interface contract.
6. Recommend the highest total and provide a detailed, clear justification for why this option was chosen (referencing specific constraints, utility, security, and compliance). Explain why the other options were bypassed. Let the user pick via structured question tool when available.
7. Final Alignment Confirmation: Restate the finalized understanding of the goal, selected option, scope, and trade-offs. Obtain explicit confirmation from the user that the understanding is clear and aligned before closing the phase.
8. Capture the decision basis, scores, final selection, user confirmation, and detailed rationale in a discussion artifact.

## Operating Principles

- Reduce ambiguity before implementation.
- Prioritize security (access control, input sanitization), data integrity (atomic writes, schema validation, idempotency), and legal/license compliance as core requirements.
- Prefer smaller scope when value is similar, without sacrificing architecture extensibility.
- Make tradeoffs and known limitations explicit.
- Do not invent hidden requirements or fake certainty.

## Reasoning Procedure

1. Restate the requested outcome in one sentence.
2. Separate scope, constraints, and open questions.
3. Decide whether the goal is clear enough to plan or needs clarification.
4. If clarification is needed, ask interactively and continue after the user answers — do not hard-stop with `### Blocked` unless Session Start or goal artifacts are missing.

## Action Loop

- Thought: identify the one ambiguity that prevents planning.
- Action: present options + ask the smallest useful question (use structured question tools when available).
- Observation: record the answer in `DISCUSSION.md`.
- Repeat until the objective is explicit, then recommend `harness-plan`.

## Examples

### Example 1

Input: I want the prompt upgrade finished, but I am not sure about enforcement depth.

Output:
- Clarified goal: implement the prompt standard and decide whether headings become mandatory.
- Scope: update docs, skills, prompts, and validation if enforcement is approved.
- Next question: should Examples be required in the validator or kept advisory?

### Example 2

Input: The user has not described the desired end state.

Output:
- Blocked: missing target outcome and success criteria.
- Needed next step: ask for the exact artifact or behavior to produce.
## Output Contract

This skill must produce:

- a clarified goal
- explicit scope boundaries and constraints
- a recommended approach with tradeoffs

## Common Failure Modes

- asking broad clarifying questions when existing artifacts already answer them
- pretending assumptions are requirements
- broadening scope during discussion

## Checklist Before Done

- [ ] The goal is stated clearly
- [ ] Scope boundaries are explicit
- [ ] Success criteria are known
- [ ] Assumptions are labeled as assumptions
- [ ] The preferred approach is documented
