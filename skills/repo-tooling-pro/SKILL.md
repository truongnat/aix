---
name: repo-tooling-pro
description: |
  Repository automation for this skills template: Node/TypeScript commands (`dist/tools.js`) for knowledge-base batch queries, skill inventory, validation, KB build/verify, and skill-index generation — when to use them vs reading Markdown only.

  Use this skill when the user runs or wires CI for build-kb, query-kb, query-kb-batch, verify-kb, list-skills, validate-skills, analyze-skills, build-skill-index, index-project, generate-wiki; asks how to speed up multiple KB queries; or needs a JSON list of bundled skills — or a report on which skills should link helpers under `scripts/` (self-support automation). This skill (`repo-tooling-pro`) owns **CLI usage and performance**; other **`*-pro`** skills own domain content.

  Triggers: "scripts", "dist/tools.js", "query-kb-batch", "batch query", "list_skills", "validate_skills", "analyze_skills", "skill analysis report", "build_kb", "verify_kb", "index-project", "generate-wiki", "project index", "wiki html", "CI skills", "RAG performance", "embeddings", "repo automation", "npm run validate-skills", "build-skill-index", "OOM query-kb", "wrong cwd", "list-skills --json", "query_kb_batch".

metadata:
  short-description: Repo tooling — KB batch query, list/validate/analyze skills, Node CLI, scripts README
---

# Repo tooling (professional)

Official command list: **[`scripts/README.md`](../../scripts/README.md)** at repo root. This skill encodes **when** to use **batch** vs **single** query, **CI validation** of skills, and **avoiding redundant** model loads. Confirm **repo root** as cwd and **`config.md`** / **`config.example.md`** for KB paths.

## Related skills (this repo)

| Skill | When to combine with `repo-tooling-pro` |
|-------|----------------------------------------|
| **`skills-self-review-pro`** | Full **bundle audit** — combine **`analyze-skills --markdown`** with **`SKILL_AUTHORING_RULES.md`** checklist |

## When to use

- **Multiple** KB questions in one session — **`node dist/tools.js query-kb-batch`** (or `npm run query-kb-batch`).
- **Project index + wiki** — **`index-project`** builds embeddings for an arbitrary tree; **`query-kb --index <dir>`** queries it; **`generate-wiki`** turns `<index_base>/docs/**/*.md` into static HTML (tables, sidebar search, **`--watch`** / **`--open`**; see **`/index-project`**).
- **CI** — **`validate-skills`** after skill changes; **`verify-kb`** after KB build.
- **Agent inventory** — **`list-skills --json`**.
- **Authoring / audit** — **`analyze-skills`** (`--markdown` for paste-ready report; see **`skills-self-review-pro`**).
- Explaining **performance** difference vs N× separate **`query-kb`** invocations.
- Trigger keywords: `query-kb-batch`, `validate-skills`, `analyze-skills`, `list-skills`, `build-kb`, `index-project`, `generate-wiki`, `dist/tools.js`, …

## Workflow

1. Confirm **working directory** is repo root, **`npm install`** has been run, and **`dist/tools.js`** exists (run **`npm run build`** if the repo ships TypeScript sources without prebuilt `dist/`).
2. Apply the principles and topic summaries below; open [`scripts/README.md`](../../scripts/README.md) for exact flags.
3. Respond using **Suggested response format**; note **missing KB index** and **RAM** limits for huge batches.

### Operating principles

1. **Batch for many queries** — One model load; prefer **`query-kb-batch`** over shell loops of **`query-kb`**.
2. **Validate skills on change** — **`validate-skills`** catches `name` / folder drift.
3. **Rebuild KB when documents change** — Queries are **stale** otherwise.
4. **CLI is not domain skills** — Commands support RAG and hygiene; **`react-pro`** etc. remain separate.

### KB and repo commands (summary)

- **`query-kb-batch`**, **`list-skills`**, **`validate-skills`**, **`analyze-skills`**, pipeline **`build-kb` → `verify-kb`**.

Details: [references/kb-and-repo-scripts.md](references/kb-and-repo-scripts.md)

### Tips and tricks (summary)

- Golden queries file or repeated **`-q`**; CI hooks; **`--json`** output.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

- OOM, cwd, missing index, missing `dist/`, template skill flags.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

- Batch vs single query; rebuild after doc edits; shell-loop anti-pattern.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

- **`skills-self-review-pro`**, **`web-research-pro`**, KB persistence rules.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

- `dist/` build, Node, embedding model changes.

Details: [references/versions.md](references/versions.md)

### Command matrix (summary)

- One-page map: validate, build-kb, query batch, analyze-skills.

Details: [references/command-matrix.md](references/command-matrix.md)

### Suggested response format (implement / review)

1. **Issue or goal** — Slow queries, CI, or inventory need.
2. **Recommendation** — Exact command(s) and flags; batch vs single.
3. **Code** — Example command lines — still labeled **Code**.
4. **Residual risks** — Stale embeddings, machine limits, config path mistakes.

## Resources in this skill

- `references/` — KB batch, tips, edge cases, Tier A maps; canonical commands in **`scripts/README.md`**.

| Topic | File |
|-------|------|
| KB & repo commands | [references/kb-and-repo-scripts.md](references/kb-and-repo-scripts.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |
| Command matrix | [references/command-matrix.md](references/command-matrix.md) |
| **Canonical command list** | [`scripts/README.md`](../../scripts/README.md) |

## Quick examples

**Input (simple):** Run 20 KB queries — each `query-kb` call is slow.  
**Expected output:** Use **`node dist/tools.js query-kb-batch`** with multiple **`-q`** or a queries file per **`scripts/README.md`**; one model load; avoid N separate `query-kb` processes.

**Input (tricky):** “CI fails: `dist/tools.js` not found.”  
**Expected output:** Run **`npm install`** + **`npm run build`** on agents; cache `dist/` or build step; document **artifact** path; not a skill content bug.

**Input (cross-skill):** Which bundled skills should link helpers — full audit?  
**Expected output:** **`node dist/tools.js analyze-skills --with-references --only-actionable --markdown`**; **`skills-self-review-pro`** for narrative + authoring checklist; **this skill** for **exact** CLI only.

## Checklist before calling the skill done

- [ ] Correct command chosen (**batch** vs **single**).
- [ ] User knows to run from **repo root** with **`npm install`** (and **`npm run build`** if `dist/` is missing).
- [ ] **`validate-skills`** mentioned when adding/changing skill folders.
- [ ] If a skill describes **repeatable CLI/automation**, **`scripts/README.md`** or the relevant **`npm run`** script is referenced.
- [ ] KB **rebuild** mentioned if `knowledge-base/documents/` changed since last **`build-kb`**.
- [ ] **`build-skill-index`** mentioned when **`skills/**`** content changed for agent routing.
- [ ] **OOM** / **RAM** limits flagged for huge **batch** jobs when relevant.
