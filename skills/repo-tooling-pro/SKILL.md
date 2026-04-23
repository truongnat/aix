---
name: repo-tooling-pro
description: |
  Production-grade repository tooling for this devkit: Node/TypeScript CLI (`dist/tools.js`) for KB batch queries, skill inventory, validation, KB build/verify, skill-index generation, project indexing, and wiki generation — plus system model (repo-root workspace, skills vs KB artifact lifecycles, batch query execution), failure modes (wrong cwd, missing dist, stale embeddings/index, OOM batch, interrupted builds), decision trade-offs (batch vs single query, when to rebuild KB, analyze depth, CI vs local), and quality guardrails (canonical scripts/README, no invented flags, reproducible Node/commit).

  Use this skill when the user runs or wires CI for build-kb, query-kb, query-kb-batch, verify-kb, list-skills, validate-skills, analyze-skills, build-skill-index, index-project, generate-wiki; asks how to speed up multiple KB queries; needs a JSON list of bundled skills; or wants automation reports for skills vs `scripts/` helpers.

  Combine with **`skills-self-review-pro`** for bundle audits, **`ci-cd-pro`** for pipeline YAML, **`deployment-pro`** for runner capacity and secrets, **`security-pro`** for API keys and log hygiene, and **`web-research-pro`** for external verification.

  Triggers: "scripts", "dist/tools.js", "query-kb-batch", "batch query", "list_skills", "validate_skills", "analyze_skills", "skill analysis report", "build_kb", "verify_kb", "index-project", "generate-wiki", "project index", "wiki html", "CI skills", "RAG performance", "embeddings", "repo automation", "npm run validate-skills", "build-skill-index", "OOM query-kb", "wrong cwd", "list-skills --json", "query_kb_batch".

metadata:
  short-description: Repo tooling — KB lifecycle, batch query, validate skills, CLI guardrails
  content-language: en
  domain: developer-tooling
  level: professional
---

# Repo tooling (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Official command list: **[`scripts/README.md`](../../scripts/README.md)** at repo root. This skill encodes **artifact lifecycles** (skills vs KB), **batch vs single query economics**, and **safe automation defaults** — not domain skill content (**`*-pro`** skills stay separate). Confirm **repo root cwd**, **`npm install`**, **`npm run build`** when `dist/` is absent, and **`config.md`** / **`config.example.md`** for KB paths.

## Boundary

**`repo-tooling-pro`** owns **this repository’s CLI** (`dist/tools.js`), **when to run** validate/build/query commands, and **performance/staleness** of embeddings and skill index. **`ci-cd-pro`** owns **pipeline YAML and org runner policy**. **`skills-self-review-pro`** owns **authoring narrative and checklist depth** beyond raw `analyze-skills` output.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`skills-self-review-pro`** | Bundle audit + authoring checklist with **`analyze-skills --markdown`** |
| **`ci-cd-pro`** | CI steps, caches, matrix Node |
| **`deployment-pro`** | Runner sizing, secrets, artifact promotion |
| **`security-pro`** | API keys, redaction, supply chain for tooling deps |
| **`web-research-pro`** | External verification not in KB |

## When to use

- Many KB questions in one session — **`query-kb-batch`** vs N× **`query-kb`**.
- **`validate-skills`** / **`build-skill-index`** after skill changes.
- **`build-kb`** → **`verify-kb`** after document corpus changes.
- **`index-project`**, **`generate-wiki`**, **`list-skills --json`**, performance of RAG batch jobs.
- Explaining OOM, cwd, missing `dist/`, or stale index behavior.

## When not to use

- **Writing domain skill content** (React, Postgres, etc.) — use the relevant **`*-pro`** skill; use **`repo-tooling-pro`** only for **tooling steps** that support authoring.
- **General Git tutorial** without this CLI — **`git-operations-pro`**.
- **Product KB content authoring** — writing docs is not the same as choosing **`build-kb`** flags.

## Required inputs

- Whether cwd is **repo root** (or path to use).
- Whether **`dist/`** exists or CI must **`npm run build`** first.
- Approximate **batch size** / RAM for large **`query-kb-batch`** jobs.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

1. Confirm cwd, Node install, `dist/tools.js` presence; read **`scripts/README.md`** for exact flags.
2. Apply summaries; open `references/`; use **`repo-tooling-and-kb-lifecycle-system-model.md`** when explaining stale answers vs rebuild.
3. Respond with **Suggested response format**; include **failure modes** for CI and large batches.

### Operating principles

1. **Batch for many queries** — One model load; avoid shell loops — **`anti-patterns.md`**.
2. **Validate skills on change** — **`validate-skills`** catches layout/YAML drift — **`decision-tree.md`**.
3. **Rebuild KB when docs change** — Otherwise RAG is stale — **`repo-tooling-and-kb-lifecycle-system-model.md`**.
4. **CLI ≠ domain** — Commands support hygiene; domain skills stay separate — **`integration-map.md`**.

### KB and repo commands (summary)

`query-kb-batch`, `list-skills`, `validate-skills`, `analyze-skills`, `build-kb` → `verify-kb` — **`kb-and-repo-scripts.md`**.

Details: [references/kb-and-repo-scripts.md](references/kb-and-repo-scripts.md)

### System model — lifecycles (summary)

Repo root, skills pipeline, KB pipeline, batch query model — **`repo-tooling-and-kb-lifecycle-system-model.md`**.

Details: [references/repo-tooling-and-kb-lifecycle-system-model.md](references/repo-tooling-and-kb-lifecycle-system-model.md)

### Tips and tricks (summary)

Golden query files, `--json`, CI hooks — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

OOM, cwd, missing index/dist, Windows UTF-8, interrupted builds — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Batch vs single, rebuild policy, analyze depth, CI ownership — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Shell-loop `query-kb`, skipping verify, skipping index rebuild — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`skills-self-review-pro`**, **`ci-cd-pro`**, **`web-research-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Node, `dist/` build, embedding model churn — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

### Command matrix (summary)

One-page map — **`command-matrix.md`**.

Details: [references/command-matrix.md](references/command-matrix.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Repo root?, Node/dist present?, CI vs local?, batch size.
2. **Problem / goal** — Slow queries, stale RAG, validate failure, inventory, wiki.
3. **System design** — Which artifact pipeline: skills index vs KB embeddings — **`repo-tooling-and-kb-lifecycle-system-model.md`**.
4. **Decision reasoning** — Batch vs single; rebuild vs query only; default KB vs `index-project` — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Exact commands from **`scripts/README.md`** / `package.json` — **`quality-validation-and-guardrails.md`** (no invented flags).
6. **Trade-offs** — RAM vs throughput; full rebuild cost vs correctness.
7. **Failure modes** — cwd, missing dist, stale index, OOM, interrupted build — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — Runner limits; hand off to **`ci-cd-pro`** / **`security-pro`** / **`skills-self-review-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **System model & lifecycles** | [references/repo-tooling-and-kb-lifecycle-system-model.md](references/repo-tooling-and-kb-lifecycle-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
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

### 1 — Simple (common)

**Input:** Twenty KB queries; each `query-kb` is slow.  
**Expected output:** Full **Suggested response format** — `query-kb-batch`, one model load, pointer to **`scripts/README.md`**; warn RAM — **`failure-modes-detection-mitigation.md`**.

### 2 — Tricky (edge case)

**Input:** CI fails: `dist/tools.js` not found.  
**Expected output:** `npm install` + `npm run build`; cache strategy; not a skill-content bug — **`edge-cases.md`**, **`quality-validation-and-guardrails.md`**.

### 3 — Cross-skill

**Input:** Full skills bundle audit for PR.  
**Expected output:** **`analyze-skills --with-references --only-actionable --markdown`** — **`skills-self-review-pro`** for checklist narrative — exact CLI from this skill.

## Checklist before calling the skill done

### Commands

- [ ] **Batch vs single** chosen correctly — **`decision-tree.md`**.
- [ ] cwd = **repo root**; `dist/` build documented — **`quality-validation-and-guardrails.md`**.

### Artifacts

- [ ] **`validate-skills`** when `skills/**` changes — **`decision-tree.md`**.
- [ ] **`build-skill-index`** when skills change for routing — **`repo-tooling-and-kb-lifecycle-system-model.md`**.
- [ ] **`build-kb`** + **`verify-kb`** when KB docs changed — **`decision-tree.md`**.

### Safety

- [ ] **OOM** / RAM flagged for huge batches — **`edge-cases.md`**.
- [ ] No **invented** CLI flags — **`quality-validation-and-guardrails.md`**.
- [ ] **`integration-map.md`** used when CI wiring or security dominates.
