# AI integration — integration map

| Combined skill | Why | `ai-integration-pro` owns | Other skill owns |
|----------------|-----|----------------------------|------------------|
| **`security-pro`** | Abuse, data exfiltration | Prompt boundaries, tool validation, logging hygiene | Threat model, infra hardening |
| **`testing-pro`** | Quality gates | Eval datasets, mock LLM, contract tests on structured output | Broader CI strategy |
| **`caching-pro`** | Cost/latency | Prompt/embedding cache policies | Invalidation, Redis |
| **`api-design-pro`** | External API | AI feature endpoints, SSE/WebSocket | REST semantics, versioning |
| **`postgresql-pro`** | pgvector | Schema for vectors, ANN indexes | SQL tuning |
| **`deployment-pro`** | Rollout | Feature flags for model swaps | Traffic management |
| **`ci-cd-pro`** | Pipelines | Secret scanning, no keys in logs | Workflow YAML |

**Handoff:** After integration patterns are set, **`security-pro`** should review data flows for PII and injection before production enablement.
