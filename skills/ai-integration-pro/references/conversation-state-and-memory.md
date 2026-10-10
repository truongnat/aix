# Conversation state and memory

Architecture for **multi-turn** apps: how history is stored, trimmed, and summarized — distinct from **prompt engineering** wording alone.

## Storage models

| Model | Use when |
|-------|----------|
| **Ephemeral server session** | Stateless API; session id maps to message list in Redis/DB |
| **Client-held history** | Thin server; risk of tampering — validate role boundaries |
| **Durable transcript** | Audit, billing, resume — tie to **tenant/user id** |

## Isolation

- **Session id** per browser tab vs per user — define collision and restore semantics.
- **Tenant scoping** — never mix transcripts across tenants in one cache key.

## Trimming policy

- **Token budget first** — drop oldest turns, keep system + latest user.
- **Preserve anchors** — never drop system prompt or last **N** tool round-trips without explicit policy.
- **Summarization** — compress middle turns to a summary message; risk: **lost constraints** — re-inject hard rules after summary.

## When to summarize vs trim

- Long support chats — summarize with **structured template** (facts, open questions, constraints).
- Avoid summarizing mid-tool chain — complete tool loop first.

## Branching and edits

- **Regenerate / edit user message** — invalidate downstream assistant/tool messages or version the branch.
- **Concurrent edits** — last-write-wins vs optimistic locking; document UX.

## Memory vs session

- **Session** — short-lived chat state.
- **Durable memory** (facts about user) — separate store with **TTL**, **privacy**, and **retrieval into system context** intentionally — pair with **`security-pro`**.

## Review checklist

- [ ] **Trim/summarize** policy documented; engineers know what survives long sessions.
- [ ] **Tool results** too long are **summarized** before next turn (**`edge-cases.md`**).
- [ ] **Reconnect / restore** does not duplicate turns without idempotent message ids.
