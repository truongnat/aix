# AI integration — decision trees

## RAG vs fine-tuning vs prompt-only

```
Knowledge changes weekly / source docs exist?
├── RAG — retrieval + prompt; cite sources
└── Fixed behavior needing style/tone?
    └── Fine-tuning — expensive; pair with evals
```

**Prompt-only:** sufficient for narrow structured extraction with good examples — cheapest iteration loop.

## Streaming vs batch

```
User waits in UI for tokens?
├── Streaming — SSE/WebSocket; handle partial tool calls
└── Backend job, SLA minutes?
    └── Batch — simpler retries; watch idempotency
```

## Tool use vs single completion

```
Model must call APIs / query DB?
├── Tool use — schema per tool; validate args before execution
└── Free-form text enough?
    └── Single completion — simpler; no tool loop
```

## When to cache prompts or embeddings

```
Repeated system prompt + large static context?
├── Prompt caching (provider feature) or hash-keyed cache for embeddings
└── User-unique every request?
    └── Cache only non-sensitive shared chunks
```

## Structured output strategy

```
Strict JSON for downstream code?
├── Provider JSON mode / schema where available + validator (Zod/Pydantic)
└── Prose acceptable?
    └── Looser prompt; still validate if feeding SQL/code paths
```

See [prompt-engineering.md](prompt-engineering.md) and [tool-use.md](tool-use.md).
