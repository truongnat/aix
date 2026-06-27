# Token Optimization and Caching

## Token estimation

- 1 token ≈ 0.75 words for English.
- Use the tokenizer for your model (Tiktoken for OpenAI, Anthropic tokenizer for Claude).
- Count system prompt + user prompt + few-shot + expected output.

## Compression techniques

1. **Summarize context**: Replace long documents with summaries.
2. **Remove redundancy**: Cut boilerplate, duplicate instructions, and filler.
3. **Structured over verbose**: Tables, lists, and schemas use fewer tokens than paragraphs.
4. **Dynamic context**: Only include relevant context (RAG retrieval, not full knowledge base).

## Prompt caching

### Anthropic prompt caching

- Cache static system prompts and few-shot examples.
- Mark cacheable blocks with `cache_control: { type: "ephemeral" }`.
- Reduces cost and latency for repeated prefixes.

### OpenAI context caching

- Use `prompt_cache` where supported (preview/limited availability).
- Longer contexts benefit more from caching.

### DIY caching

- Hash the system prompt + few-shot; store responses for identical inputs.
- Only effective for deterministic, low-temperature use cases.

## Context window management

- **Sliding window**: Keep only the most recent N messages.
- **RAG**: Retrieve relevant documents instead of stuffing context.
- **Hierarchical summarization**: Summarize older turns; keep recent turns verbatim.

## Cost monitoring

- Track input tokens, output tokens, and cost per query.
- Alert on p95 cost per query.
- A/B test prompt compression: does it reduce cost without hurting quality?
