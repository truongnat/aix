# Scripts (repo tooling)

All runtime tooling is now implemented in TypeScript and compiled to `dist/tools.js`.

## Primary entrypoints

- Install/uninstall bundle CLI: `node dist/own-skills.js` (npm bin: **`devkit`** or **`own-skills`**) or `npx github:truongnat/skills`. Full install syncs to **`.agents/devkit/`**.
- Tool command runner: `node dist/tools.js <command> ...`.
- Unified script wrapper: `node scripts/tools.js <command> ...` (simpler alternative to bash wrappers)

## Command map

| Command | Purpose |
|---|---|
| `node dist/tools.js list-skills [--json]` | Inventory bundled skills |
| `node dist/tools.js validate-skills` | Validate SKILL frontmatter `name` vs folder |
| `node dist/tools.js analyze-skills [--markdown --only-actionable]` | Skill gap heuristics report |
| `node dist/tools.js build-skill-index [--with-embeddings]` | Build `skill_index.json` (+ optional embeddings) |
| `node dist/tools.js install-skill <path> [--project-dir ...] [--all-ides]` | Install one skill into target project |
| `node dist/tools.js verify-bundle-install [--project-dir ...]` | Verify full bundle installation |
| `node dist/tools.js build-kb` | Build KB embeddings + manifest |
| `node dist/tools.js index-project [--dir .] [--out .agents/devkit/project-index] [--include globs] [--dry-run]` | Build **project** index (`embeddings.json` + `manifest.json`) for arbitrary trees |
| `node dist/tools.js generate-wiki [--docs …/docs] [--out …/wiki] [--watch] [--open]` | Static **HTML wiki**: sidebar, pipe **tables**, **Search** (client-side), relative **`.md`→`.html`** links; **`--watch`** polls docs and rebuilds; **`--open`** opens `index.html` in the default browser |
| `node dist/tools.js query-kb "..." -k 5` | Query KB (single query) |
| `node dist/tools.js query-kb "..." -k 5 --index .agents/devkit/project-index` | Query a **project** index built by `index-project` |
| `node dist/tools.js query-kb-batch -q "..." -q "..."` | Query KB for multiple prompts |
| `node dist/tools.js query-kb-batch -q "a" -q "b" --index <dir>` | Batch query against a project index |
| `node dist/tools.js verify-kb` | Verify KB artifacts |
| `node dist/tools.js build-graph [--dir .] [--out .agents/devkit/project-graph]` | Build code graph (functions, classes, calls) |
| `node dist/tools.js query-graph <symbol> [--mode search\|callers\|callees]` | Query graph for symbol or relationships |
| `node dist/tools.js impact-analysis <file-path>` | Blast radius analysis for changes |

## npm aliases

`package.json` exposes shortcuts:

- `npm run list-skills`
- `npm run validate-skills`
- `npm run analyze-skills`
- `npm run build-skill-index`
- `npm run install-skill`
- `npm run verify-bundle-install`
- `npm run build-kb`
- `npm run generate-wiki`
- `npm run query-kb`
- `npm run query-kb-batch`
- `npm run verify-kb`

## Additional scripts

- `node scripts/tools.js <command>` - Unified wrapper for all dist/tools.js commands
- `node scripts/sync-custom-to-repo.cjs` - Sync custom skills/workflows/templates to upstream repo via PR

## Build

```bash
npm install
npm run build
```

For agent-oriented guidance on usage strategy, see bundled skills `repo-tooling-pro` and `skills-self-review-pro`.
