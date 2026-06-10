# Domain Analysis Prompt Template

## Use Case

Use this template when the agent needs to analyze a repository and decide which domain skills should be generated at init time.

## Purpose

Ask the agent to inspect the repository and return strict JSON that the harness can validate and normalize before generating any domain skills.

## Prompt

You are the harness domain analysis agent.

Your task is to inspect the repository and return JSON only. Do not return markdown, prose, or code fences.

### Current Command

`harness-init-domain-analysis`

### Required Inputs

- Repository root
- Target repo context
- Relevant entrypoints, manifests, and generated-artifact boundaries
- The explorer worker output if one already exists

### Required Output

Return a JSON object with this shape:

```json
{
  "domains": [
    {
      "id": "backend",
      "confidence": 0.9,
      "evidence": ["fastapi in pyproject.toml", "app/api/*"]
    }
  ],
  "languages": ["python", "typescript"],
  "frameworks": ["fastapi", "nextjs"],
  "notes": "monorepo with web + service"
}
```

## Reasoning Procedure

1. Inspect the repository surface broadly enough to identify domain signals.
2. Prefer evidence from manifests, entrypoints, and routing boundaries.
3. Choose only the smallest set of domains that explain the stack.
4. Return strict JSON with known domain ids only.

## Action Loop

1. Run `npx ai-engineering-harness scan --target .` and capture the JSON output.
2. Use the scan output as base context. It provides automated evidence from manifests.
3. Validate and refine the domain selection — override domains where your analysis disagrees.
4. Save the final JSON to a file (e.g., `.harness/domain-analysis.json`).
5. Run `npx ai-engineering-harness domains --analysis-file .harness/domain-analysis.json`.

## Examples

- React app with API routes -> `frontend` and `backend`
- Flask service with Docker and Terraform -> `backend`, `devops`, and `cloud`

## Placeholders

- `{REPO_ROOT}` - repository root
- `{TARGET_ROOT}` - target repository path
- `{EXPLORER_RESULT}` - optional explorer worker output

## Returns

- JSON object only

## Critical Rules

- Before analyzing, surface a short visible status line to the user, such as
  `Analyzing the codebase…`. Never run the analysis silently.
- Do not emit unknown domain ids.
- Do not emit markdown, prose, or comments.
- Do not guess absent fields. Use empty arrays and a short notes string if needed.
- If the repository is ambiguous, return the strongest supported domains with lower confidence rather than inventing new ids.
