# Project index report

Use this template after **`w-index-project`** / **`/index-project`**. Replace placeholders. Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)**.

## Executive summary

- **Project:** `{{project_name}}`
- **Root:** `{{project_root}}`
- **Indexed at:** `{{iso_timestamp}}`
- **Scope:** `{{quick|standard|deep}}`
- **Index directory:** `{{index_path}}` (contains `embeddings.json`, `manifest.json`)

## Tech stack summary

{{languages_frameworks_build_tools}}

## Directory map

{{annotated_tree_or_link_to_tree_md}}

## Key entry points

| Kind | Path | Note |
|------|------|------|
| {{kind}} | `{{path}}` | {{note}} |

## Module inventory

| Module | Purpose | Key files / paths |
|--------|---------|-------------------|
| {{module}} | {{purpose}} | {{paths}} |

## Index statistics

| Metric | Value |
|--------|-------|
| Files scanned | {{file_count}} |
| Chunks | {{chunk_count}} |
| Vectors | {{vector_count}} |

## Sample query verification

Run with: `node dist/tools.js query-kb "<query>" -k 3 --index {{index_path}}`

### Query 1: {{query_1}}

{{top_results_summary}}

### Query 2: {{query_2}}

{{top_results_summary}}

### Query 3: {{query_3}}

{{top_results_summary}}

## Gaps and open questions

- {{gap_or_question}}

## Recommended next workflows

| Workflow | Why |
|----------|-----|
| `/arch-review` | {{reason}} |
| `/dep-audit` | {{reason}} |
| `/onboarding` | {{reason}} |

## Related artifacts

- Overview: `{{path_to_project_overview_md}}`
- Tree notes: `{{path_to_tree_md}}`
- Module docs: `{{path_to_modules_dir}}`
- Wiki (HTML): `{{wiki_path}}` — built-in: `node dist/tools.js generate-wiki --docs <index_base>/docs --out <index_base>/wiki`; optional GitNexus: `.gitnexus/wiki/`
