# Repo tooling tips

- Put **golden queries** in a file or repeat **`-q`** flags for **`query-kb-batch`** — see [`scripts/README.md`](/scripts/README.md).

```bash
node dist/tools.js query-kb-batch -q "first question" -q "second question"
```

- Run **`node dist/tools.js validate-skills`** in **pre-commit** or **CI** after changing skills (aligns with **`SKILL_AUTHORING_RULES.md`** §8).

- Use **`node dist/tools.js list-skills --json`** to feed agents without parsing Markdown tables.

- After large `knowledge-base/documents/` changes, run **`build-kb`** then **`verify-kb`** before trusting retrieval.

- **`npm run`** shortcuts in **`package.json`** mirror common commands (`validate-skills`, `build-kb`, etc.) — optional ergonomics.
