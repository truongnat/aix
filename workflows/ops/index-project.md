# Workflow: index-project

Build a **queryable index** of an arbitrary project: directory overview, tech stack, module summaries as Markdown, and a **local vector index** for retrieval. Use when onboarding to a codebase, preparing architecture review, or enabling agents to answer “where does X live?” without re-reading the whole tree.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `index-project.md`.

**Invoke:** `/index-project`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `index-project` |
| **version** | 1.1 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `project_root` | Yes | Absolute or workspace-relative root of the project to index |
| `scope` | No | `quick` \| `standard` \| `deep` — depth of file inclusion (see Decision paths) |
| `focus_modules` | No | Comma list of top-level dirs or packages to prioritize in Step 4 |

## Outputs

| Variable | Description |
|----------|-------------|
| `tree_notes` | Annotated directory map (from Step 1) |
| `stack_summary` | Languages, frameworks, build tool, major dependencies |
| `overview_path` | Path to `project-overview.md` under the index docs folder |
| `index_path` | Path to the vector index directory (contains `embeddings.json`, `manifest.json`) |
| `wiki_path` | Navigable HTML wiki directory (built-in `generate-wiki`) and/or GitNexus `.gitnexus/wiki/` when used |
| `project_index_report` | Final report aligned with [`templates/report/project-index-report.md`](../../templates/report/project-index-report.md) |

## Decision paths

- **Scope — quick:** README(s), `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml`, root configs only; skip bulk source. Target time &lt; 15 min.
- **Scope — standard (default):** All `*.md` + common source/config globs as in CLI defaults; exclude `node_modules`, `.git`, build outputs. Typical 30–90 min agent time depending on size.
- **Scope — deep:** Full standard globs + explicitly include any extra patterns the user names; may be slow on huge monorepos — offer to split by `focus_modules`.
- **This repo is the devkit bundle:** Use `project_root` = repo root; index output under `.agents/devkit/project-index/` if following bundle layout; else any writable `.agents/<name>/project-index/` or `knowledge-base/documents/project-index/`.
- **GitNexus available:** After Step 5, optional note in report: run **GitNexus** index / graph for call-level navigation on top of this text index (see `bug-discovery-pro` / `gitnexus-cli` skill). **Step 7** can run **`npx gitnexus wiki`** when the repo is already GitNexus-indexed.

## Error handling

- **Unreadable tree / permissions:** Document blocked paths; continue with what is readable.
- **CLI `index-project` fails:** Capture stderr; suggest smaller `--include` set, `scope: quick`, or excluding large generated dirs.
- **No write access to output dir:** Propose alternate `out` under user home or project `tmp/`.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)** for the final report.  
Use **[`templates/report/project-index-report.md`](../../templates/report/project-index-report.md)** for `project_index_report`.  
Step outputs on disk: Markdown under **`<index_base>/docs/`** (see Steps).

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Small service, README + manifests | &lt; 30 min |
| **Standard** | Typical app repo | 1–3 h |
| **Deep** | Large monorepo | Half day+ (split recommended) |

## Escalation

- **Human:** Legal/compliance on indexing proprietary code; storage quotas.
- **Autonomous:** Tree generation, stack detection, chunk stats, sample queries.

## Parallelization

Use **sub-agents** when the host IDE exposes a Task / sub-agent API (e.g. Cursor **Task** tool with `subagent_type` such as `generalPurpose` or `explore`). If unsupported, run steps **sequentially** in numeric order.

| Marker | Meaning |
|--------|---------|
| **`parallel-with: <step-id>`** | This step may run **concurrently** with the listed step after shared prerequisites complete. |
| **`parallel-each: <unit>`** | Fan-out: spawn one sub-agent **per** `<unit>` (e.g. per module slug); join before the next sync point. |

**Fork (after Step 2):**

- **Step 3** (`generate-overview`) — **`parallel-with: Step 4`** — needs only **Steps 1–2**.
- **Step 4** (`module-summaries`) — **`parallel-with: Step 3`** — needs only **Steps 1–2** (not Step 3). If you prefer a single narrative pass, run Step 3 first, then Step 4 (sequential).
- **Step 4** — **`parallel-each: module`** — for each entry in `focus_modules` (or each major package discovered in Step 1), one sub-agent writes **one** `docs/modules/<slug>.md`; merge file list when all complete.

**Join:** Before **Step 5**, ensure **Step 3** outputs exist (overview on disk) and **Step 4** module files are written (or explicitly skipped). Then run **Step 5** once.

**Step 6** sample queries may use **`query-kb-batch`** instead of three separate shells (batching, not sub-agents).

## Steps

### Step 1 — `scan-structure`

- **Type:** skill
- **Skill:** `repo-tooling-pro` + `planning-pro`
- **Input:** `project_root`, `scope`
- **Actions:** Walk top-level and key subtrees; list entrypoints (e.g. `main`, `index`, `app` routes); note CI/config files. Write **`tree.md`** (annotated tree + bullets) under **`<index_base>/docs/`** where `<index_base>` defaults to **`<project_root>/.agents/devkit/project-index`** (create dirs as needed).
- **Output:** `tree_notes` + path to `tree.md`.

### Step 2 — `identify-stack`

- **Type:** skill
- **Skill:** `clean-code-architecture-pro`
- **Input:** Step 1, manifests (`package.json`, lockfiles, Docker, etc.)
- **Output:** `stack_summary` — languages, frameworks, package manager, deployment hints, external services (from config/env samples only; no secret values).

### Step 3 — `generate-overview`

- **Type:** skill
- **Skill:** `planning-pro`
- **Parallel-with:** Step 4 (optional — see [Parallelization](#parallelization))
- **Input:** Steps 1–2
- **Actions:** Write **`project-overview.md`** under **`<index_base>/docs/`** with: purpose, stack, directory purposes, key entry points, dependencies overview, open questions, suggested next workflows.
- **Output:** `overview_path`.

### Step 4 — `module-summaries`

- **Type:** skill
- **Skill:** Pick **domain `*-pro` skills** matching Step 2 (e.g. `nextjs-pro`, `nestjs-pro`, `postgresql-pro`) when applicable; otherwise `planning-pro` only.
- **Parallel-with:** Step 3 (optional)
- **Parallel-each:** module (optional — one sub-agent per `docs/modules/<slug>.md`)
- **Input:** `focus_modules`, **Steps 1–2** (parallel path). If Step 3 ran first sequentially, you may also use `project-overview.md` for tone alignment.
- **Actions:** For each major module/package, write **`<index_base>/docs/modules/<slug>.md`** (1–2 short paragraphs: responsibility, key files, boundaries).
- **Output:** List of module doc paths.

### Step 5 — `build-index`

- **Type:** skill
- **Skill:** `repo-tooling-pro`
- **Input:** `project_root`, `scope` (maps to `--include` / depth if you narrow patterns)
- **Actions:** Run from **`project_root`** (or document cwd):

  ```bash
  node <path-to-devkit>/dist/tools.js index-project --dir . --out .agents/devkit/project-index
  ```

  If the devkit lives at repo root in this template repo, use **`node dist/tools.js index-project --dir <project_root> --out <project_root>/.agents/devkit/project-index`**. Adjust `--out` if using a different layout.

  Optional **future:** after success, if GitNexus is in use, note running graph index for deeper navigation.
- **Output:** `index_path`; chunk/file counts from CLI stdout.

### Step 6 — `verify-and-query`

- **Type:** skill
- **Skill:** `repo-tooling-pro`
- **Input:** `index_path`, Step 2 stack terms
- **Actions:** Run three diverse **`query-kb`** probes against the project index, e.g.:

  ```bash
  node dist/tools.js query-kb "where is authentication handled?" -k 3 --index <index_path>
  ```

  Use queries tailored to the project (routing, database, API, UI). Compile **`project_index_report`** using **[`templates/report/project-index-report.md`](../../templates/report/project-index-report.md)** including sample results and recommended follow-ups (`/arch-review`, `/dep-audit`, `/onboarding`).
- **Output:** `project_index_report`.

### Step 7 — `generate-wiki`

- **Type:** skill + CLI
- **Skill:** `repo-tooling-pro` (+ **`gitnexus-cli`** when GitNexus is installed)
- **Input:** `<index_base>/docs/` from prior steps, `project_root`
- **Decision path:**
  - **GitNexus track:** If `npx gitnexus status` succeeds (indexed repo under `project_root`), run **`npx gitnexus wiki`** (optional `--force`). Document output path (typically **`.gitnexus/wiki/`** per GitNexus). Requires API key / network per GitNexus docs.
  - **Built-in track (default fallback):** Run **`node <path-to-devkit>/dist/tools.js generate-wiki --docs <index_base>/docs --out <index_base>/wiki`**. Optional **`--watch`** (poll `docs/` and rebuild) and **`--open`** (open `index.html` in the system browser). Output includes sidebar, pipe-style **Markdown tables**, sidebar **search** (keyword filter), and relative **`*.md` links rewritten to `*.html`** (no extra npm deps in the devkit).
- **Actions:** Prefer GitNexus when the user already uses GitNexus graph index; otherwise always run **`generate-wiki`** for a portable wiki folder.
- **Output:** `wiki_path` (list both paths in the report if both ran).

## Notes

- **Retrieval model:** Same bag-of-tokens embedding as **`build-kb`** — good for keyword-ish recall, not semantic parity with hosted embedding APIs.
- **Privacy:** Do not paste secrets into overview or module files; redact env examples.
- **Re-run:** Re-execute Step 5 after large refactors; optionally narrow `--include` for speed.
- **Wiki:** Re-run Step 7 or **`generate-wiki`** after changing files under `docs/`; GitNexus wiki follows its own refresh semantics.
