---
name: ai-integration-pro
description: |
  Professional AI/LLM integration: Claude API, OpenAI API, prompt engineering, streaming, tool use/function calling, multi-turn conversations, RAG, embeddings, conversation state, evaluation, routing, observability, and production reliability patterns.

  Use this skill when the user integrates LLMs (Claude, GPT, Gemini, Llama), uses Anthropic or OpenAI SDKs, designs prompts, implements streaming, tool use, RAG, memory/trim policies, eval gates, or builds production AI features.

  Use **with** **`security-pro`** for threat modeling and data classification, **`caching-pro`** for prompt/embedding caches, **`testing-pro`** for eval and mocks, **`postgresql-pro`** for pgvector, **`api-design-pro`** for AI HTTP APIs.

  Triggers: "Claude", "Anthropic", "OpenAI", "GPT", "LLM", "prompt", "system prompt", "prompt injection", "jailbreak", "streaming", "SSE", "tool use", "function calling", "embeddings", "RAG", "retrieval", "vector", "semantic search", "tokens", "context window", "temperature", "top_p", "rate limit", "429", "completion", "chat completion", "anthropic SDK", "openai SDK", "messages API", "Gemini", "multi-turn", "conversation history", "memory", "truncation", "golden set", "eval", "Langfuse", "observability", "AI agent", "agentic".

metadata:
  short-description: AI/LLM — prompts, tools, streaming, RAG, state, eval, routing, observability
  content-language: en
  domain: ai-integration
  level: professional
---

# AI Integration (professional)

Skill text is **English**; answer in the user’s preferred language when Cursor User Rules or the conversation specify it (code and API names stay as in docs).

Use official [Anthropic docs](https://docs.anthropic.com/) and [OpenAI docs](https://platform.openai.com/docs/) for API truth; align production expectations with **conversation state**, **evaluation**, **safety layers**, and **observability** — not only prompts. This skill encodes **prompt engineering discipline**, **tool orchestration**, **RAG architecture**, and **operational reliability**. Confirm **provider/model**, **SDK version**, **context limits**, and **streaming vs batch** when known.

## Boundary

**`ai-integration-pro`** owns **LLM integration architecture**: prompts, tools, streaming, RAG query+ingest design, **memory/trim policy**, **routing/fallback**, **eval hooks**, **observability contracts**, and **minimum safety integration**. It does **not** replace **`security-pro`** for full abuse programs, **`deployment-pro`** for infra, or vendor-specific compliance sign-off.

| Skill | When to combine |
|-------|-----------------|
| **`security-pro`** | API keys, injection, output policy, data classification, moderation programs |
| **`caching-pro`** | Prompt caching, embedding caches, memoization |
| **`api-design-pro`** | AI-powered HTTP/WebSocket API design |
| **`testing-pro`** | Mock LLMs, golden sets, CI eval |
| **`postgresql-pro`** | pgvector, RLS on embedding rows |

## When to use

- Integrating Claude, GPT, or other LLMs via official SDKs.
- Designing **system prompts**, tools, streaming, **multi-turn** history, **summarization** strategy.
- Building **RAG** (retrieval + **ingestion/freshness** + ACL metadata).
- **Routing** models, **fallbacks**, **cost/latency** budgets, **pinning** model ids.
- **Eval**, regression, and **production debugging** (tracing, metrics).
- Trigger keywords: `LLM`, `streaming`, `tool use`, `RAG`, `embeddings`, `prompt`, `eval`, `golden`, `truncation`

## When not to use

- **Pure ML research** or training custom foundation models — out of scope.
- **Legal-only** AI compliance sign-off — involve specialists.
- **Replacing** **`security-pro`** for penetration testing or data governance programs.
- **Vendor console-only** configuration with no integration architecture question.

## Required inputs

- **Provider + model id(s)**; **SDK** language/version.
- **Latency and cost** expectations; **structured output** requirements.
- **Data sensitivity** and residency; **user-visible failure** modes acceptable.
- **RAG**: corpus ownership, **ACL** model, freshness requirements.

## Expected output

Follow **Suggested response format** — context, architecture, flows, prompt/tool strategy, reliability, safety/validation, metrics and risks.

## Workflow

1. Confirm provider/model, SDK, context window, streaming vs batch, and **eval/budget** constraints.
2. Apply principles and summaries below; open `references/` for depth; tie **conversation**, **tools**, **RAG**, and **safety** together explicitly.
3. Respond using **Suggested response format**; flag injection, cost, latency, hallucination, and **parse/tool** failure risks.

### Operating principles

1. **System prompt is the contract** — behavior, scope, format, refusals; version it like code.
2. **Validate LLM output** — schema + **business rules**; never trust raw output in critical paths.
3. **Stream for UX** — buffer for tools and structured output.
4. **Token budgets** — input+output; cache static context; **trim/summarize** with policy (**`conversation-state-and-memory.md`**).
5. **Prompt injection is real** — delimiters; never let user content override system instructions.
6. **Fallback and retry** — backoff; **routing matrix** when primary model/provider fails (**`model-selection-and-routing.md`**).
7. **Measure changes** — golden sets or metrics before prompt/model upgrades (**`evaluation-and-quality.md`**).

### Prompt engineering (summary)

Details: [references/prompt-engineering.md](references/prompt-engineering.md)

### Tool use / function calling (summary)

Details: [references/tool-use.md](references/tool-use.md)

### Streaming responses (summary)

Details: [references/streaming.md](references/streaming.md)

### RAG and embeddings (summary)

Details: [references/rag-embeddings.md](references/rag-embeddings.md)

### Conversation state and memory (summary)

History storage, trimming, summarization risk, isolation, tool-output length — see reference.

Details: [references/conversation-state-and-memory.md](references/conversation-state-and-memory.md)

### Evaluation and quality gates (summary)

Golden sets, regression, offline/online metrics, tool success rates — see reference.

Details: [references/evaluation-and-quality.md](references/evaluation-and-quality.md)

### Model selection and routing (summary)

Task routing, fallback matrix, outages, region routing, cost/latency governance — see reference.

Details: [references/model-selection-and-routing.md](references/model-selection-and-routing.md)

### Safety and policy enforcement (summary)

Moderation, tool authz, output filtering, high-risk approvals — integration minimum; pair **`security-pro`**.

Details: [references/safety-and-policy-enforcement.md](references/safety-and-policy-enforcement.md)

### Observability and debugging (summary)

Trace ids, prompt_version, chunk ids, parse failures, provider error taxonomy — see reference.

Details: [references/observability-and-debugging.md](references/observability-and-debugging.md)

### RAG ingestion and freshness (summary)

Ingest pipeline, incremental index, ACL on metadata, staleness, hybrid retrieval — see reference.

Details: [references/rag-ingestion-and-freshness.md](references/rag-ingestion-and-freshness.md)

### Decision trees (summary)

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Tips and tricks (summary)

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Expanded catalog: conversation, structured output, tools, streaming, RAG, operations.

Details: [references/edge-cases.md](references/edge-cases.md)

### Integration map (summary)

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

Details: [references/versions.md](references/versions.md)

## Suggested response format (implement / review)

1. **Context and constraints** — Provider/model, SDK, SLOs, sensitivity, structured-output needs.
2. **Proposed architecture** — Components: API layer, LLM, tools, RAG, memory store.
3. **Request/response flow** — Single-turn vs multi-turn; stream path; where validation runs.
4. **Prompt and tool strategy** — System prompt highlights; tool schemas; RAG injection pattern.
5. **Reliability** — Retries, fallbacks, timeouts, idempotency for tools, trimming policy reference.
6. **Safety and validation** — Injection boundaries, output checks, tool-side authorization, moderation hooks.
7. **Metrics, eval, and residual risks** — What to measure; golden tests; cost/latency; known failure modes.

## Resources in this skill

| Topic | File |
|-------|------|
| Prompt engineering | [references/prompt-engineering.md](references/prompt-engineering.md) |
| Tool use | [references/tool-use.md](references/tool-use.md) |
| Streaming | [references/streaming.md](references/streaming.md) |
| RAG and embeddings | [references/rag-embeddings.md](references/rag-embeddings.md) |
| RAG ingestion and freshness | [references/rag-ingestion-and-freshness.md](references/rag-ingestion-and-freshness.md) |
| Conversation state and memory | [references/conversation-state-and-memory.md](references/conversation-state-and-memory.md) |
| Evaluation and quality | [references/evaluation-and-quality.md](references/evaluation-and-quality.md) |
| Model selection and routing | [references/model-selection-and-routing.md](references/model-selection-and-routing.md) |
| Safety and policy enforcement | [references/safety-and-policy-enforcement.md](references/safety-and-policy-enforcement.md) |
| Observability and debugging | [references/observability-and-debugging.md](references/observability-and-debugging.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Simple (common)

**Input:** Build a streaming Claude chat endpoint with a weather tool.  
**Expected output:** Architecture, stream + tool loop, validation, injection notes, metrics — follow **Suggested response format**.

### 2 — Tricky (edge case)

**Input:** JSON mode returns markdown fences around JSON in production.  
**Expected output:** Defensive parsing, tests, metrics for parse failures — **`testing-pro`**.

### 3 — Cross-skill

**Input:** RAG over internal wiki — must not leak other teams’ docs.  
**Expected output:** ACL metadata + retrieval filter (**`ai-integration-pro`**); **`postgresql-pro`** RLS if vectors in Postgres; **`security-pro`** review.

## Checklist before calling the skill done

### Core

- [ ] API keys via env/secrets; never logged in plaintext.
- [ ] Output validated (schema + business rules) before critical side effects.
- [ ] Streaming for user-facing paths where applicable; tools/JSON buffered appropriately.
- [ ] Backoff for 429/transient errors; timeouts defined.

### Conversation and memory

- [ ] **Trim/summarize** policy documented; tool chains not broken blindly.
- [ ] **Session/tenant** isolation explicit for transcripts.

### Tools and safety

- [ ] Tool inputs validated; **mutations** idempotent or guarded against duplicate execution.
- [ ] **Tool execution** enforces **authorization**, not only the chat layer.
- [ ] **High-risk** actions have approval or dry-run where needed — **`safety-and-policy-enforcement.md`**.

### RAG

- [ ] Retrieved chunks **ACL-filtered**; **ingestion/update/delete** path prevents stale ghosts — **`rag-ingestion-and-freshness.md`**.

### Operations

- [ ] **Routing/fallback** behavior tested; schema compatibility on fallback.
- [ ] **Observability**: request/trace ids, model id, prompt version, token usage — **`observability-and-debugging.md`**.
- [ ] **Eval/golden** path for critical prompts/models — **`evaluation-and-quality.md`**.

### Anti-regression

- [ ] Prompt injection defenses for user-injected content.
- [ ] Model/SDK versions noted; upgrade requires eval or acceptance — **`versions.md`**.
