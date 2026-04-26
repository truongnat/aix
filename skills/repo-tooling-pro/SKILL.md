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

### Operating principles

1. **Think Before Coding** — Confirm repo root, built artifacts, and the actual command goal before suggesting tooling steps. Ask when the user may be outside the repo or using stale artifacts.
2. **Simplicity First** — Use the smallest command sequence that proves the state. Do not rebuild KB, graphs, or indexes unless the relevant source changed.
3. **Surgical Changes** — Touch only the tooling command, script, or artifact lifecycle relevant to the request. Do not broaden into unrelated repo cleanup.
4. **Goal-Driven Execution** — Done = the command path is reproducible, the expected artifact state is explicit, and verification confirms the tool outcome.
5. **Repo root matters** — Many failures are simply wrong cwd or missing build output; check those before deeper debugging.
6. **Artifact lifecycles are separate** — Skills index, KB embeddings, project index, and dist build are different pipelines with different rebuild triggers.
7. **Do not invent flags** — All command examples must map to real CLI behavior documented in repo scripts.
8. **Performance advice needs context** — Batch size, RAM, and cold-start economics matter before claiming one query mode is “better.”

## Default recommendations by scenario

- **Skill content changed** — `validate-skills` then `build-skill-index`; skip `build-kb` unless docs changed.
- **KB docs changed** — `build-kb` then `verify-kb`, and query only after artifacts refresh.
- **Many local questions** — Prefer `query-kb-batch` over repeated single queries.
- **Missing `dist/`** — Build first before assuming command bugs.

## Decision trees

Summary: choose the right command path based on which source-of-truth changed and whether the issue is artifact state, cwd, or scale/performance.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: rebuilding everything by reflex, running commands from the wrong cwd, inventing unsupported flags, and diagnosing stale artifacts as code bugs.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Repo tooling and KB lifecycle system model (summary)

How source files, built CLI, skill index, and KB artifacts relate so rebuild decisions stay precise.

Details: [references/repo-tooling-and-kb-lifecycle-system-model.md](references/repo-tooling-and-kb-lifecycle-system-model.md)

### KB and repo scripts (summary)

What each command actually does and when it should or should not be run.

Details: [references/kb-and-repo-scripts.md](references/kb-and-repo-scripts.md)

### Failure modes and mitigation (summary)

Wrong cwd, missing `dist/`, stale indexes, OOM batches, and broken assumptions about artifact freshness.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect Node compatibility, CLI behavior, and supported command expectations.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — cwd, artifact state, Node/build status, and the command goal.
2. **Tooling model** — Which lifecycle or artifact is involved and why.
3. **Recommendation** — Minimum command sequence or fix path.
4. **Verification** — Exact command/output checks that prove the tool state is correct.
5. **Residual risks** — Remaining stale-artifact, environment, or performance caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Repo tooling and KB lifecycle system model | [references/repo-tooling-and-kb-lifecycle-system-model.md](references/repo-tooling-and-kb-lifecycle-system-model.md) |
| KB and repo scripts | [references/kb-and-repo-scripts.md](references/kb-and-repo-scripts.md) |
| Command matrix | [references/command-matrix.md](references/command-matrix.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "I changed a skill and want the repo state updated correctly."
- Run the smallest relevant pipeline: validate skill metadata, then rebuild skill index.
- Do not rebuild KB unless docs or KB corpus changed.
- **Verify:** Validation passes and the updated skill appears in the index artifact.

**Input (tricky):** "`query-kb` is slow when I ask ten questions in a row."
- Prefer `query-kb-batch` to avoid repeated model loads.
- Check memory constraints before assuming parallel single queries are cheaper.
- **Verify:** The batch command returns all results with fewer repeated cold starts.

**Input (cross-skill):** "Our CI job for skill validation keeps failing after a docs-only change."
- Pair **`ci-cd-pro`** for workflow wiring, and use **`repo-tooling-pro`** to separate which artifacts really need rebuilding.
- Remove unnecessary steps before debugging imaginary command bugs.
- **Verify:** CI only runs the commands justified by the changed files and passes reproducibly.

## Checklist before calling the skill done

- [ ] Repo root, build state, and actual command goal confirmed first (Think Before Coding)
- [ ] Minimum command sequence chosen; no unnecessary rebuilds added (Simplicity First)
- [ ] Only the relevant tooling/artifact lifecycle was touched (Surgical Changes)
- [ ] Success criteria and command verification are explicit and validated (Goal-Driven Execution)
- [ ] Command examples map to real CLI behavior
- [ ] Artifact rebuild triggers are correctly distinguished
- [ ] Performance guidance is tied to batch size or environment context where relevant
- [ ] Remaining environment or stale-artifact caveats are documented
