# Repo tooling — decision tree

## Queries

- **Many questions, one session** → `query-kb-batch` (one model load).
- **One-off** → `query-kb`.

## After doc edits

- **`knowledge-base/documents/`** changed → `build-kb` then `verify-kb`.

## Skill changes

- New/changed `skills/**` → `validate-skills` + `build-skill-index`.

## Audit vs daily dev

- **Bundle quality** → `analyze-skills` + **`skills-self-review-pro`**.

## Default KB vs custom project index

```
Querying this repo's bundled KB vs arbitrary tree?
├── Bundled docs under knowledge-base → default index path from config — **`kb-and-repo-scripts.md`**
└── External tree → `index-project` then `query-kb --index <dir>` — **`repo-tooling-and-kb-lifecycle-system-model.md`**
```
