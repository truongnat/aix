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

Official command list: **[`scripts/README.md`](/scripts/README.md)** at repo root. This skill encodes **artifact lifecycles** (skills vs KB), **batch vs single query economics**, and **safe automation defaults** — not domain skill content (**`*-pro`** skills stay separate). Confirm **repo root cwd**, **`npm install`**, **`npm run build`** when `dist/` is absent, and **`config.md`** / **`config.example.md`** for KB paths.

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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** cwd, Node install, `dist/tools.js` presence; read **`scripts/README.md`** for exact flags. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.