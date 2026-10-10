# AI integration — tips and tricks

- **System prompt as spec:** role, tools policy, refusal boundaries, output schema — version it like code.

- **Few-shot quality > quantity:** 2 excellent examples beat 10 mediocre ones; include negative examples sparingly.

- **Token accounting:** estimate input + max output; reject oversized user payloads early.

- **Idempotency keys:** for paid APIs, pass idempotency on retried requests to avoid double charges downstream.

- **Structured logs:** `request_id`, `model`, latency, token usage — not raw completions in prod.

- **Graceful degradation:** if LLM unavailable, return cached summary or human handoff path.

- **Anthropic vs OpenAI message shapes:** map roles and tool blocks carefully when abstracting providers.

- **Embeddings normalization:** cosine on L2-normalized vectors; same model for index and query.

- **Chunk overlap:** 10–20% overlap between text chunks improves retrieval continuity.

- **RAG metadata:** store `source_uri`, `updated_at` for citations and stale-data warnings.

Cross-reference [prompt-engineering.md](prompt-engineering.md), [rag-embeddings.md](rag-embeddings.md), [streaming.md](streaming.md).
