## Three-Option Scoring (Deliberative Decisions)

When `harness-discuss` (or Session Start routing) needs a **deliberative** choice — feature direction, approach, tradeoff, or solution pick — use exactly **3 options** with a scored comparison before asking the user to choose.

### When to apply

- feature or scope choice
- architecture or implementation approach
- review merge / direction decisions with real alternatives
- any question that is not a simple yes/no gate

### Scoring dimensions (each 1–5)

| Dimension | 5 means | 1 means |
|-----------|---------|---------|
| **Value** | High impact toward the stated goal | Low or unclear impact |
| **Effort fit** | Low effort / fast to ship | High effort / large unknowns |
| **Risk** | Low regression or operational risk | High blast radius or fragility |
| **Fit** | Matches repo constraints and conventions | Poor fit with stack, harness, or policy |

**Total** = sum of the four scores (max 20).

### Required output shape

1. Restate the decision in one sentence.
2. Present **exactly 3** distinct options (add a hybrid or defer option if only two are obvious).
3. Show a scoring table with all four dimensions per option.
4. State **Recommendation** = highest total; explain ties or close calls.
5. Read `.ai-harness/provider-interaction.md` and **call** the provider's structured choice tool with 3 labels (option name + total score). Markdown-only menus are fallback.
6. After the tool returns the user's pick, record the choice and scores in `DISCUSSION.md`.

### Example table

| Option | Summary | Value | Effort fit | Risk | Fit | **Total** |
|--------|---------|------:|-----------:|-----:|----:|----------:|
| A | … | 4 | 3 | 4 | 5 | **16** |
| B | … | 5 | 2 | 3 | 4 | **14** |
| C | … | 3 | 5 | 5 | 3 | **16** |

Do not ask the user to choose without scores unless they explicitly request an unscored brainstorm.
