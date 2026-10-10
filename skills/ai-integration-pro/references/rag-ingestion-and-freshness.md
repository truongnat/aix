# RAG ingestion, freshness, and ACL

Extends **`rag-embeddings.md`** (query path) with **document lifecycle** and **staleness**.

## Ingestion pipeline

1. **Source** — wiki, tickets, uploads; normalize format.
2. **Extract text** — strip boilerplate; preserve headings for chunk boundaries.
3. **Chunk + embed** — version chunking params in config.
4. **Store** — vector + **metadata**: `doc_id`, `source_uri`, `updated_at`, **`acl_principal`** or tenant id.

## Incremental updates

- On document change: **re-embed affected chunks** or whole doc if small.
- **Tombstone** deleted docs — remove vectors or mark **inactive** to avoid ghost answers.

## Staleness

- Surface **last_updated** in UI or answer metadata when freshness matters.
- **Scheduled re-index** for slowly changing corpora.

## Deduplication

- Hash normalized paragraphs to skip unchanged re-embeds.

## ACL in retrieval

- Filter **after** similarity or **during** hybrid query — **never** rely on model to hide unauthorized chunks.
- Metadata must mirror **authorization** model (**`postgresql-pro`** for row-level if stored in DB).

## Hybrid and re-ranking

- **BM25 + vector** for keyword-heavy queries.
- **Re-ranker** — second stage; ensure scores are comparable across requests in eval.

## Chunk versioning

- Bump **index version** when embedding model or chunker changes — avoid mixed-space search.

## Review checklist

- [ ] **Delete/update** path exists; vectors do not answer from removed sources.
- [ ] **ACL** enforced in retrieval query, not prompt instructions alone.
- [ ] **Embedding model** for index and query **match** (or documented migration).
