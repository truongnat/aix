# Observability integration

Turn **signals** into **scoped** investigation — complements **`runtime-debugging.md`**.

## Correlation

- **`requestId`** / **`traceparent`** — Same id across logs and traces; broken chain → missing middleware.

## Distributed tracing

- **Span attributes** — `service`, `version`, `deployment.id`, `feature_flag.*`.
- **Sampling** — Rare bug may **never** appear in sampled traces — adjust temporarily for repro window.

## Logs vs traces vs metrics

| Signal | Best for |
|--------|----------|
| **Logs** | Exact error text, payload snippets (redacted), branch taken |
| **Traces** | Latency breakdown, dependency fan-out |
| **Metrics** | Trends, SLIs, deploy correlation, saturation |

## Observability gaps as bugs

- **Missing context** — Cannot slice by tenant → classification blind.
- **Broken trace** — Wrong parent span → misleading blame.
- **Misaligned metrics** — Dashboard says healthy while logs show errors — definition drift.

## Skills

**`network-infra-pro`**, **`deployment-pro`** for platform-specific exporters and dashboards — not duplicated here.
