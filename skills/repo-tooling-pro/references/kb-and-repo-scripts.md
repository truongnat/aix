# KB tooling and repo commands (TypeScript / Node)

Runtime commands are implemented in **TypeScript** and compiled to **`dist/tools.js`**. The canonical flag list is **[`scripts/README.md`](/scripts/README.md)** at repo root.

## Why batch query matters

Each `query-kb` invocation loads the embedding model. For **many** questions, use **`query-kb-batch`** — **one** model load, then rank per query. Typical speedup vs N separate `query-kb` calls: avoid **N×** cold starts.

## Inventory and CI

| Command | Role |
|---------|------|
| **`node dist/tools.js list-skills`** | Bundled `skills/*/SKILL.md` inventory; `--json` for agents. |
| **`node dist/tools.js validate-skills`** | Ensures `name:` in frontmatter matches folder; use in **CI** before merge. |
| **`node dist/tools.js analyze-skills`** | Heuristic report (tiers: strong / consider / low). **`--self-review`** = full Markdown for this repo. **`--with-references`**, **`--only-actionable`**, **`--markdown`**. Pair with **`skills-self-review-pro`**. Not a linter. |

## KB pipeline

1. Edit `knowledge-base/documents/**/*.md`
2. `node dist/tools.js build-kb`
3. `node dist/tools.js verify-kb`
4. Single probe: `node dist/tools.js query-kb "..."` — or batch: `node dist/tools.js query-kb-batch -q "..." -q "..."`

## Dependencies

Install repo **`npm`** dependencies (`npm install`) so `node dist/tools.js` runs; embedding stack matches `package.json` / lockfile. See **`scripts/README.md`** for build (`npm run build` if needed before first run).
