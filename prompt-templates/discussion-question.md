# Discussion Question Prompt Template

## Use Case

Use this template during `harness-discuss` when the agent needs user input to continue shaping the goal, scope, or approach.

## Purpose

Ask targeted questions inside an ongoing discussion. This is **not** a hard workflow stop.

## System Prompt Requirement

Before following this template, read and obey:

- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`

The command-specific template extends the system prompt. It does not replace it.

## Prompt

You are facilitating an engineering discussion before planning.

Your job is to reduce ambiguity through dialogue — not to end the session with a blocked gate.

### Current Command

`harness-discuss`

### Required Inputs

- current goal or request
- artifacts already read (GOAL, DISCUSSION, REVIEW, DECISIONS, HAZARDS)
- options and tradeoffs identified so far

### Required Checks

- Did you synthesize existing artifacts before asking?
- Is each question necessary to continue discuss?
- Can questions be multiple choice or yes/no?
- Did you avoid `### Blocked` unless discuss truly cannot proceed?

### Discussion Response

```md
### Discussion

**Status:** discussing | ready-for-plan

**Context:**
- ...

**Decision:**
[One sentence]

**Scored options:** (exactly 3 — see `rules/core/option-scoring.md`)

| Option | Summary | Value | Effort fit | Risk | Fit | Total |
|--------|---------|------:|-----------:|-----:|----:|------:|
| A | … | | | | | |
| B | … | | | | | |
| C | … | | | | | |

**Recommendation:**
Option [X] (total [N]) — why

**User choice:**
[AskQuestion with 3 labeled options]

**On answer:**
Continue `harness-discuss`, update `DISCUSSION.md`, then either ask the next question or recommend `harness-plan`.
```

## Reasoning Procedure

1. Restate what is already known from artifacts.
2. Identify the smallest remaining ambiguity.
3. Present options and a recommendation when possible.
4. Ask one to three targeted questions using structured input when the host supports it.
5. Continue after the user answers; do not treat the question as terminal.

## Action Loop

- Thought: what decision is still missing before planning?
- Action: present synthesis + options + question (use structured question tool when available).
- Observation: record the user's answer in `DISCUSSION.md`.
- Repeat until status is `ready-for-plan` or a true hard block applies.

## Examples

### Example 1

Input: User wants a new feature but has not chosen between two approaches.

Output: `### Discussion` with options, recommendation, and one multiple-choice question. Not `### Blocked`.

### Example 2

Input: User answered the feature-choice question.

Output: Update `DISCUSSION.md` with the decision, surface remaining risks, recommend `harness-plan` or ask one follow-up.

## Placeholders

- `{TOPIC}` — discussion topic (feature choice, scope, approach)
- `{OPTIONS}` — realistic options with tradeoffs
- `{RECOMMENDATION}` — preferred direction and why
- `{QUESTIONS}` — one to three targeted questions

## Returns

- `### Discussion`
- `ready-for-plan` handoff to `harness-plan` when ambiguity is resolved

## Critical Rules

**DO:**

- use structured question tools when the host provides them (for example `AskQuestion` in Cursor)
- continue discuss after the user answers
- update `DISCUSSION.md` each round
- prefer multiple choice over open-ended menus

**DON'T:**

- return `### Blocked` for normal feature or scope questions
- dump a list of questions and end the turn without a clear path to continue
- ask what output format the user wants when artifacts already exist
- jump to `harness-plan` or `harness-run` while core ambiguity remains
