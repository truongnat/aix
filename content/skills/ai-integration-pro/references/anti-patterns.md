# AI integration — anti-patterns

1. **Trusting LLM output for SQL, shell, or payments** — Validate, parameterize, and use allow-lists; never concatenate user text into queries.

2. **User content placed above system instructions** — Easier prompt injection; keep system boundaries; separate untrusted data (XML tags, delimiters).

3. **No rate limits or budgets** — API cost and abuse; throttle per user/IP; cap `max_tokens`.

4. **Logging full prompts with PII** — GDPR/privacy violations; redact and sample.

5. **Ignoring context window growth** — Long chats exceed limits silently (truncation); trim history with a policy.

6. **Tool execution without authz** — Tools are code paths; check permissions before side effects.

7. **Blocking event loop on synchronous SDK in Node** — Use async clients; stream.

8. **Single temperature for all tasks** — Creative vs extraction need different settings.

9. **No eval set for prompt changes** — Regression on quality; maintain golden inputs.

10. **Assuming one model fits all locales** — Safety and language behavior differ; test target languages.

When NOT to use an LLM: deterministic business rules with testable logic — use code with **`testing-pro`**.
