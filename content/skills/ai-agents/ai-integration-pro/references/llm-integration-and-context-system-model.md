# AI integration — request, context, and tool loop (system model)

## Contents

1. [Request path](#request-path)
2. [Context budget](#context-budget)
3. [Tool and RAG injection](#tool-and-rag-injection)
4. [Observability hooks](#observability-hooks)

Pair with **[prompt-engineering.md](prompt-engineering.md)**, **[conversation-state-and-memory.md](conversation-state-and-memory.md)**, **[rag-embeddings.md](rag-embeddings.md)**.

---

## Request path

```
Client → API boundary (auth, rate limit) → prompt assembly → LLM → parse/validate → side effects / stream
```

Validation sits **after** model output for structured paths — **`evaluation-and-quality.md`**.

---

## Context budget

Static system prompt + rolling history + RAG chunks + tool outputs compete for **one window** — explicit **trim/summarize** policy — **`conversation-state-and-memory.md`**.

---

## Tool and RAG injection

Tools and retrieval are **capabilities**, not proof of correctness — schema validation and **authz on mutations** remain mandatory — **`tool-use.md`**, **`safety-and-policy-enforcement.md`**.

---

## Observability hooks

Trace id, `model`, `prompt_version`, retrieval chunk ids, parse-failure counters — **`observability-and-debugging.md`**.
