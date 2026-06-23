# Decision Framework

Reference for the `Options Considered` / `Recommendation` steps in the brainstorming `Workflow`.

## Comparison criteria

When comparing realistic approaches, weigh them on:

- **Feasibility** — can it be built with what already exists in this repo, or does it need new infrastructure.
- **Reversibility** — how cheap is it to undo or change later if it turns out wrong.
- **Time-to-value** — how soon does it produce a verifiable result.
- **Maintenance burden** — ongoing cost after it ships, not just the cost to build it.

## Tie-breaking rule

If two options score similarly, prefer the smaller, more reversible one. This follows the `Operating Principles` in `SKILL.md`: prefer the smallest viable approach over the most complete-looking one.

## Anti-patterns

- Comparing more than three options — it signals the problem wasn't scoped tightly enough.
- Recommending an option because it is "best practice" without tying it to this repo's actual constraints.
- Treating an unconfirmed assumption as a constraint when scoring options.
