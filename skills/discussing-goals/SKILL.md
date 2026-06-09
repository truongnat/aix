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
3. Identify constraints, risks, and success criteria.
4. Compare exactly three realistic options with scored dimensions (Value, Effort fit, Risk, Fit).
5. Recommend the highest total; let the user pick via structured question tool when available.
6. Capture the decision basis, scores, and selection in a discussion artifact.

## Operating Principles

- Reduce ambiguity before implementation.
- Prefer smaller scope when value is similar.
- Make tradeoffs explicit.
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
