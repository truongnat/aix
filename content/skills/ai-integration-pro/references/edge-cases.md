# AI integration — edge cases

Pair with **`security-pro`**, **`testing-pro`**, **`conversation-state-and-memory.md`**, **`observability-and-debugging.md`**.

## Prompt / conversation

- **Partial tool call in stream:** buffer until arguments complete before parse or execution.
- **System prompt drift** between versions — pin **`prompt_version`** in logs; regression eval.
- **Summary loses constraints** — long chats; re-anchor critical rules after summarization.
- **Role leakage** — user content mimicking system; delimiter discipline (**`prompt-engineering.md`**).
- **Trim removes critical instruction** — trim policy must keep system + recent tool chains.
- **Reconnect duplicates turns** — idempotent message IDs on restore.
- **Tool output too long** — summarize before feeding next turn; drops below context limit.

## Structured output

- **JSON valid but semantically wrong** — add business validation beyond schema.
- **Schema satisfied but missing meaning** — required fields empty or placeholder.
- **Enum casing** mismatch with downstream (camelCase vs SNAKE).
- **Number/string coercion** breaks consumers — explicit types in schema + validation.
- **Over-nested or huge objects** — cap depth/size in schema or post-process.
- **Fenced markdown + prose + JSON** in one message — defensive extractors.

## Tool use

- **Wrong tool order** — dependency docs in descriptions; multi-step prompts.
- **Redundant tool calls** — dedupe by intent; max rounds limit.
- **Infinite tool loop** — max iterations; circuit breaker.
- **Tool timeout** — model still waiting — return structured timeout `tool_result`.
- **Side effects on retry** — idempotency keys for mutating tools.
- **Parallel tool merge** — order results by `tool_use_id` matching.
- **Authz at chat only** — tool executor must re-check permissions.

## Streaming

- **Stream cut mid-flight** — client shows partial; server may still charge; UX recovery.
- **Reconnect before `[DONE]`** — resume or restart policy; dedupe deltas.
- **Duplicate delta append** — event ids or sequence numbers on client.
- **Partial UTF-8 / chunk boundaries** — decode robustly.
- **Text deltas vs tool blocks** — buffer tool JSON until complete.
- **User cancel** — abort server; cancel in-flight tools if safe (**side effects**).

## RAG

- **Top-K semantically right but ACL wrong** — filter by metadata pre-answer.
- **Citation points to stale chunk** — ingestion freshness (**`rag-ingestion-and-freshness.md`**).
- **Embed index vs query model mismatch** — migration story.
- **Chunks too small** — fragmented retrieval; tune size/overlap.
- **Doc updated, vectors stale** — incremental index.
- **Duplicate chunks skew** — dedupe at ingest.
- **Retriever vs re-ranker disagree** — eval which stage fails.

## Provider / operations

- **429 / rate limits** — backoff + jitter; respect `retry-after`.
- **Silent degradation** — provider returns lower quality without error — monitor task success rate.
- **Org-level quota** — user-level throttling insufficient.
- **Fallback model different schema** — explicit adapter or forbid fallback for structured tasks.
- **Wrong region endpoint** — compliance violation.
- **Canary rollout inconsistent UX** — monitor eval metrics by cohort.
- **Log retention** holds prompts too long — policy + **`security-pro`**.

## Earlier baseline (still common)

- **Model refuses safe requests** (over-refusal); **multilingual drift**; **duplicate assistant messages**; **hallucinated citations**; **concurrent edits** to same conversation; **compliance regions**.
