# Safety and policy enforcement (AI integration layer)

Minimum **application contract** for LLM features — deep threat programs live in **`security-pro`**.

## Layers in the stack

1. **Input** — classify user content; block or sandbox high risk before model.
2. **System prompt** — refusal rules, scope boundaries (**`prompt-engineering.md`**).
3. **Tool layer** — **authorize** tool calls per user/role; never trust model intent alone.
4. **Output** — validate structure; **filter** PII or policy violations before showing users.

## Content and abuse

- **Moderation** — provider APIs or self-hosted classifiers for public-facing apps.
- **Jailbreak** — detect intent to override system rules; rate-limit and log (**no raw secrets**).

## Data classification

- Tag prompts/responses with **sensitivity**; restrict logging and retention (**`observability-and-debugging.md`**).

## High-risk actions

- **Human approval** for irreversible operations (payments, bulk delete) even if model proposes tool.
- **Two-phase** tool pattern — model proposes id; server confirms with user session.

## PII

- **Redact** before logging; avoid sending unnecessary PII in prompts.

## Review checklist

- [ ] **Tool execution** checks **authorization** at execution time, not only chat layer.
- [ ] **Output validation** includes business rules, not only JSON schema.
- [ ] **High-risk** paths have explicit **approval** or **dry-run** mode.
