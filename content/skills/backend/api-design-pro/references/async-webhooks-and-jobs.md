# Async APIs, webhooks, and background jobs

Event-driven and long-running patterns beyond synchronous CRUD.

## Async job pattern

1. **`POST`** creates work → **`202 Accepted`**
2. Response includes **`Location: /operations/{opId}`** (or job id in body)
3. **`GET /operations/{opId}`** returns `running | succeeded | failed` + progress + **result links**

Document **timeout**, **cancellation** (`DELETE /operations/{id}` optional), and **final failure** shape.

## Webhooks (outbound)

- **Signing** — HMAC with shared secret or asymmetric; include timestamp; **replay window**.
- **Retries** — exponential backoff; **deduplication** by `event_id`.
- **Ordering** — document if **not guaranteed**; consumers must tolerate reorder.
- **Delivery failures** — dead-letter policy; manual replay.

## Inbound callbacks

- If client hosts callback URL — validate TLS, allowlist, abuse controls — **`security-pro`**.

## Polling vs push

- When webhook unreliable, offer **polling** status resource.

## Event-driven integration

- **Outbox pattern** for reliable emit from DB transactions — implementation with **`deployment-pro`** / stack skills.

## Review checklist

- [ ] Webhook payload includes **idempotency** key per delivery.
- [ ] Consumers know **at-least-once** vs **exactly-once** expectations.
