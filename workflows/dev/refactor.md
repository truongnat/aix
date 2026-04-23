# Workflow: refactor

**Safe refactoring** with tests-first guardrails: intent → scope → tests → small steps → verify. Reduces regression risk when restructuring code without intended behavior change.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `refactor.md`.

**Invoke:** `/refactor`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `refactor` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `refactor_goal` | Yes | Why (readability, duplication, prep for feature) |
| `target_scope` | Yes | Files, modules, or symbols |
| `domain_stack` | No | Language/framework |

## Outputs

| Variable | Description |
|----------|-------------|
| `change_plan` | Ordered steps; rollback points |
| `test_results` | What was run / added |
| `summary` | Behavior preserved statement |

## Decision paths

- **No tests in area:** Step 2 **characterization tests** before edits (approval gate).
- **Behavior change sneaks in:** Abort step; split into **feature** + **refactor** PRs.
- **Large blast radius:** Sequence: extract pure functions → move files → rename (separate commits).

## Error handling

- **Test fails mid-way:** `git revert` or reset to last green; **do not** stack unrelated fixes.
- **Merge conflicts:** Prefer rebase on small steps; avoid long-lived refactor branch.

## Output format

Use **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)** for progress tables.  
Optional ADR for major structure: **[`templates/report/architecture-decision-record.md`](../../templates/report/architecture-decision-record.md)**.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single function / rename | < 1 h |
| **Standard** | Module extraction | 2–8 h |
| **Deep** | Layer or package move | > 1 day |

## Escalation

- **Human:** Public API breakage, cross-team contracts.
- **Autonomous:** Internal refactor with tests green.

## Steps

### Step 1 — `clarify-scope`

- **Type:** skill
- **Skill:** `planning-pro`
- **Input:** `refactor_goal`, `target_scope`
- **Output:** In/out of scope; **non-goals**; risk list.

### Step 2 — `establish-safety-net`

- **Type:** skill
- **Skill:** `testing-pro` + `git-operations-pro`
- **Input:** Target code
- **Output:** Existing tests identified; **new** characterization tests if gaps; baseline green.

### Step 3 — `small-step-edits`

- **Type:** skill
- **Skill:** `clean-code-architecture-pro` + domain `*-pro`
- **Input:** Plan from Step 1
- **Actions:** Mechanical moves before semantic changes; commit after each green step.
- **Output:** Series of minimal diffs.

### Step 4 — `verify-and-document`

- **Type:** skill
- **Skill:** `testing-pro` + `feedback-pro`
- **Input:** Final state
- **Output:** `change_plan`, `test_results`, `summary` (behavior preserved).

## Notes

- Pair with **`prompts/generation/refactoring-task.md`** for a single prompt-driven refactor.
