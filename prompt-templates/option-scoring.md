# Option Scoring Prompt Template

## Use Case

Use when a deliberative decision needs user input: feature choice, approach, scope tradeoff, or solution selection during `harness-discuss` or ambiguous Session Start routing.

## Purpose

Produce exactly three scored options and let the user pick via structured input.

## System Prompt Requirement

Before following this template, read and obey:

- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`
- `rules/core/option-scoring.md`

## Prompt

You are facilitating a scored decision before planning or routing.

### Current Command

`harness-discuss` or `harness-start` (routing only)

### Required Inputs

- decision question (one sentence)
- constraints from artifacts
- three realistic options

### Scoring Rubric

Score each option 1–5 on: **Value**, **Effort fit**, **Risk**, **Fit**. Total max 20.

### Discussion Response

```md
### Discussion

**Status:** discussing

**Decision:**
[One sentence]

**Scored options:**

| Option | Summary | Value | Effort fit | Risk | Fit | Total |
|--------|---------|------:|-----------:|-----:|----:|------:|
| A | … | | | | | |
| B | … | | | | | |
| C | … | | | | | |

**Recommendation:** Option [X] (total [N]) — [why]

**User choice:** [pending — use AskQuestion with 3 options]
```

## Reasoning Procedure

1. Name the decision and constraints.
2. Draft three distinct options (include hybrid/defer if needed).
3. Score honestly; do not inflate the recommended option.
4. Present table + recommendation.
5. Read `.ai-harness/provider-interaction.md` and **invoke** the provider tool (not markdown-only) with three choices (label: `A: name (score/20)`).
6. On answer, write scores and selection to `DISCUSSION.md`.

## Action Loop

- Thought: what are three viable paths?
- Action: score table + AskQuestion.
- Observation: user selection.
- Repeat only if a new deliberative sub-decision remains.

## Examples

### Example 1

Input: User undecided between two feature implementations.

Output: Third option = phased/hybrid; full scoring table; AskQuestion with A/B/C.

## Placeholders

- `{DECISION}` — decision statement
- `{OPTION_A}` `{OPTION_B}` `{OPTION_C}` — option summaries
- `{SCORES}` — filled scoring table
- `{RECOMMENDATION}` — recommended option and rationale

## Returns

- `### Discussion` with scoring table
- updated `DISCUSSION.md` after user choice

## Critical Rules

**DO:**

- always use exactly 3 options for deliberative decisions
- show all four dimension scores before asking
- use `AskQuestion` when the host supports it
- continue discuss after the user picks

**DON'T:**

- present unscored bullet lists for major decisions
- use `### Blocked` for normal option picking
- offer more than three options in the picker (refine in DISCUSSION.md if needed)
