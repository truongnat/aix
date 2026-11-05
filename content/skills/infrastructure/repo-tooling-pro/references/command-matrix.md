# Repo tooling — command matrix

| Goal | Command (repo root) | Notes |
|------|---------------------|--------|
| Validate skill folders | `node dist/tools.js validate-skills` | After `SKILL.md` / structure changes |
| Rebuild skill embeddings index | `node dist/tools.js build-skill-index` | After skill content changes |
| Build KB corpus embeddings | `node dist/tools.js build-kb` | After `knowledge-base/documents/` |
| Verify KB | `node dist/tools.js verify-kb` | After `build-kb` |
| Single semantic query | `node dist/tools.js query-kb "…"` | Needs built index |
| Many queries | `node dist/tools.js query-kb-batch` | Prefer over loops |
| Skill gap report | `node dist/tools.js analyze-skills --markdown` | Pair with **`skills-self-review-pro`** |
| List skills JSON | `node dist/tools.js list-skills --json` | Agent inventory |

Canonical flags: **[`scripts/README.md`](/scripts/README.md)**.
