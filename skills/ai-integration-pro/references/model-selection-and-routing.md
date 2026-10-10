# Model selection and routing

Strategy for **which model** handles **which task** and what happens when things fail.

## Task routing (examples)

| Task type | Typical tier |
|-----------|----------------|
| Classification / extraction | Smaller / faster model |
| Complex reasoning / code | Stronger model |
| Structured JSON (strict) | Models known for JSON adherence + validation layer |
| Multilingual | Models evaluated on target locales |

## Fallback matrix

- **Same model retry** — transient errors, rate limits — exponential backoff.
- **Cheaper → stronger** — escalation when parse fails or confidence low (policy-defined).
- **Stronger → cheaper** — only if quality checks pass on downgrade experiment.

## Provider outage

- **Secondary provider** — only if **output contract** compatible (message shapes differ — abstract adapter).
- **Graceful degradation** — cached answer, async job, honest “try later” — product decision.

## Region and compliance

- Route to **endpoints in allowed regions**; fail closed if violation.

## Pinning

- **Pin model id** in config per environment; upgrades via **`evaluation-and-quality.md`**.

## Cost and latency governance

- **Per-request token ceiling** — hard cap or truncate context before call.
- **Per-user / org budgets** — daily spend or request quotas; degrade gracefully.
- **Latency SLO** — route short tasks to fast models; async queue for long jobs.
- **Caching** — prompt or retrieval cache (**`caching-pro`**) where safe.

## Review checklist

- [ ] **Fallback** path does not silently change **schema** or **safety** behavior without tests.
- [ ] **Routing rules** are explicit in config, not ad hoc per request.
- [ ] **Budgets** and **timeouts** align with product tier.
