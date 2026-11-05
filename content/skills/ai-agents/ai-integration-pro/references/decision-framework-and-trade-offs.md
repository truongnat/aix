# Decision framework and trade-offs (AI integration)

## Contents

1. [Single model vs routing](#single-model-vs-routing)
2. [Long context vs RAG trim](#long-context-vs-rag-trim)
3. [Sync batch vs streaming UX](#sync-batch-vs-streaming-ux)
4. [Client-side vs server-side inference](#client-side-vs-server-side-inference)

See **`decision-tree.md`** for provider/feature choice.

---

## Single model vs routing

| One pinned model | Router + fallbacks |
|------------------|-------------------|
| Simpler ops | Higher resilience; schema drift risk on fallback |

**Trade-off:** operational complexity vs outage tolerance — **`model-selection-and-routing.md`**.

---

## Long context vs RAG trim

Stuffing full history vs **retrieve + cite** — cost and hallucination profile differ — **`rag-embeddings.md`**, **`conversation-state-and-memory.md`**.

---

## Sync batch vs streaming UX

Streaming improves perceived latency; complicates **tool** and **JSON** assembly — **`streaming.md`**, **`tool-use.md`**.

---

## Client-side vs server-side inference

Client inference exposes **weights** and complicates telemetry; server keeps **keys** and policy centralized — pair **`security-pro`** when sensitive.
