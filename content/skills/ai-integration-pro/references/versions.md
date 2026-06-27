# AI integration — version notes

Pin **SDK** and **model identifier** in config; both change behavior more often than typical semver libraries.

| Layer | What to track |
|-------|----------------|
| **Provider SDK** | `openai`, `@anthropic-ai/sdk`, etc. — read changelog for breaking request/response shapes |
| **Model id** | `gpt-4o`, `claude-3-5-sonnet-20241022`, … — capabilities (JSON mode, vision, context) differ by id |
| **API surface** | Chat Completions vs Responses API vs Messages — do not mix without an adapter |

| Check before upgrade | Risk |
|---------------------|------|
| **Structured output / tool schema** | New validation rules or stricter JSON |
| **Token limits** | Input/output caps per model |
| **Deprecation windows** | Legacy models sunset — monitor provider dashboards |
| **Regional endpoints** | Compliance and latency |

**When NOT to auto-upgrade models:** production without A/B eval — snapshot prompts and run golden tests.
