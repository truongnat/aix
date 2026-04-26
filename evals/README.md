# Skill evals

Deterministic checks for bundled skills. Used in CI (`.github/workflows/ci.yml`) after `npm run build`.

## Routing — `evals/routing/skill-routing-cases.json`

Matches each `prompt` against trigger lines extracted from each skill’s `SKILL.md` frontmatter / description (same logic as `build-skill-index` routing metadata).

| Field | Role |
|--------|------|
| `prompt` | User-style string |
| `expected_skill` | Single acceptable top skill (legacy default) |
| `expected_any_of` | Optional list — pass if the **top-scoring** skill is any of these (overlap cases) |
| `hard_negative_skills` | Optional list — **fail** if the top skill is one of these (known-wrong neighbors) |

```bash
npm run eval-skill-routing
node dist/tools.js eval-skill-routing --strict
node dist/tools.js eval-skill-routing --file evals/routing/skill-routing-cases.json --markdown
```

## Output format — `evals/output/`

- **`skill-output-format-specs.json`** — per skill: `required_sections` (labels), optional `require_code_fence`.
- **`skill-output-format-cases.json`** — golden `response` texts checked against the spec for that `skill`.

```bash
npm run eval-skill-output-format
node dist/tools.js eval-skill-output-format --strict
```

### Heuristic vs AI judge

| Mode | Behavior |
|------|-----------|
| `heuristic` (default) | Regex for section headings / order + optional fenced code block. No network. |
| `ai-judge` | Same spec sent to an OpenAI-compatible **chat completions** API; model returns JSON `pass`, `missing_sections`, `section_order_ok`, `code_fence_ok`, `brief_rationale`. |

```bash
node dist/tools.js eval-skill-output-format --mode ai-judge --markdown
```

**Environment (AI judge only)**

| Variable | Purpose |
|----------|---------|
| `SKILL_EVAL_JUDGE_API_KEY` or `OPENAI_API_KEY` | Bearer token |
| `SKILL_EVAL_JUDGE_BASE_URL` | Default `https://api.openai.com/v1` |
| `SKILL_EVAL_JUDGE_MODEL` | Default `gpt-4o-mini` |

PR CI runs **heuristic** only so merges do not depend on API keys. Run `ai-judge` locally or in a scheduled workflow when you want semantic grading on golden responses.
