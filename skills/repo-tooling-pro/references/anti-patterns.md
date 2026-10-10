# Repo tooling — anti-patterns

## Shell loop of N `query-kb`

- N× model load; slow and expensive.
- **Fix:** `query-kb-batch` or queries file.

## Wrong cwd

- Silent wrong config or missing `dist/`.
- **Fix:** Repo root; `npm install` / `npm run build` as needed.

## Query without rebuild

- Stale answers after doc edits.
- **Fix:** `build-kb` when corpus changed.

## Skip `validate-skills` on skill PR

- Broken bundle merges.
- **Fix:** CI or local gate before merge.
