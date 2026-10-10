# Observability and debugging

Structured visibility for **production LLM** systems — complements **`security-pro`** redaction rules.

## Correlation and tracing

- **`request_id`** / trace id across gateway → LLM → tools → DB.
- **Turn id** and **tool_call_id** from provider responses — link logs.

## Log dimensions (non-PII)

- **Model id**, **prompt_version**, **latency_ms**, **input/output token counts**, **finish_reason** / stop reason.
- **Tool names** invoked, **success/fail**, **retry_count**.
- **Retrieval**: **chunk ids** or content hashes for RAG debugging.

## Parse and validation

- Count **JSON parse failures**, **schema validation failures**, **repair attempts** separately from model errors.

## Provider errors

- Taxonomy: **429**, **5xx**, **context_length**, **content_policy**, **timeout** — map to user-visible messages without leaking internals.

## Sampled prompt logging

- If enabled: **redact** PII; **truncate**; **opt-in** per tenant; retention policy.

## Debug playbook (quick)

| Symptom | Check |
|---------|--------|
| Hallucinated facts | RAG chunk ids, temperature, prompt constraints |
| Wrong tool | Tool descriptions, parallel tool merge, argument schema |
| Truncation | Context window, trimming policy |
| Malformed JSON | Strip fences, repair prompt, schema examples |

## Review checklist

- [ ] Can reconstruct a **single user journey** across services with ids.
- [ ] **Parse/validation** failures are metrics, not only logs.
