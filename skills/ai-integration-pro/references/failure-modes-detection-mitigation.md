# Failure modes — detection and mitigation (AI integration)

## Contents

1. [Prompt injection and policy bypass](#prompt-injection-and-policy-bypass)
2. [Structured output and tool parse failures](#structured-output-and-tool-parse-failures)
3. [RAG wrong or leaked context](#rag-wrong-or-leaked-context)
4. [Cost, latency, and provider outages](#cost-latency-and-provider-outages)

---

## Prompt injection and policy bypass

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Instruction override** | User content changes role | Delimiters; system prompt versioning; output policy — **`safety-and-policy-enforcement.md`** |

---

## Structured output and tool parse failures

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Markdown fences / partial JSON** | Parser errors spike | Defensive parse + tests — **`testing-pro`** |
| **Duplicate tool side effects** | Retries double-charge | Idempotent tools + dedup keys — **`api-design-pro`** |

---

## RAG wrong or leaked context

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **ACL leak** | Wrong-tenant chunks | Metadata filter at retrieve — **`rag-ingestion-and-freshness.md`** |
| **Stale index** | Confident wrong facts | Freshness signals + re-ingest — **`rag-ingestion-and-freshness.md`** |

---

## Cost, latency, and provider outages

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **429 / region outage** | Elevated errors | Backoff + **routing matrix** — **`model-selection-and-routing.md`** |
| **Runaway tokens** | Bill shock | Caps, summarization, cache static context — **`conversation-state-and-memory.md`** |
