# Workflow: api-design

Structured **API design review** (REST, GraphQL, or RPC-style) before implementation: contracts, versioning, errors, authz, and operability.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `api-design.md`.

**Invoke:** `/api-design`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `api-design` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `api_intent` | Yes | Problem the API solves; consumers (web, mobile, partners) |
| `draft_contract` | No | OpenAPI, GraphQL schema, or informal endpoint list |
| `domain_stack` | No | Framework (NestJS, Express, …) for wiring realism |

## Outputs

| Variable | Description |
|----------|-------------|
| `contract_feedback` | Resources, naming, pagination, errors, idempotency |
| `security_notes` | AuthN/AuthZ boundaries, data minimization |
| `open_questions` | Items needing product or infra input |

## Decision paths

- **Public internet vs internal only:** External — stricter versioning, rate limits, abuse cases; document in Step 4.
- **No draft yet:** Step 1 produces **minimal contract sketch** before critique.
- **Breaking change on existing API:** Require versioning strategy (path, header, or sunset) before approval narrative.

## Error handling

- **Ambiguous resources:** Stop with **resource model questions**; avoid naming endpoints until nouns are stable.
- **Auth model unclear:** Flag as blocker for external scope; list options (token type, scopes).

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)**.  
Major design decisions: **[`templates/report/architecture-decision-record.md`](../../templates/report/architecture-decision-record.md)**.  
Pair with **`prompts/review/api-revierequest.md`** for a single prompt pass.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single resource CRUD | < 1 h |
| **Standard** | New surface area + pagination + errors | 2–4 h |
| **Deep** | Public partner API, multi-version | > 1 day |

## Escalation

- **Human:** SLA, legal terms for external APIs, pricing/quotas.
- **Autonomous:** Contract structure, consistency with `api-design-pro` patterns.

## Steps

### Step 1 — `clarify-use-cases`

- **Type:** skill
- **Skill:** `planning-pro` + `business-analysis-pro` (if product ambiguity)
- **Input:** `api_intent`, `draft_contract`
- **Output:** Actors, read vs write ratios, consistency needs.

### Step 2 — `shape-contract`

- **Type:** skill
- **Skill:** `api-design-pro`
- **Input:** Use cases from Step 1
- **Output:** Resource model; error model; pagination/filtering; idempotency for writes.

### Step 3 — `implementation-reality`

- **Type:** skill
- **Skill:** `nestjs-pro` or domain server skill if applicable + `clean-code-architecture-pro`
- **Input:** Proposed contract
- **Output:** Module boundaries; DTO validation story; migration path for existing handlers.

### Step 4 — `security-and-privacy`

- **Type:** skill
- **Skill:** `security-pro` + `auth-pro` if auth in scope
- **Input:** Trust boundaries, sensitive fields
- **Output:** Authz matrix; PII fields; audit/logging stance.

### Step 5 — `synthesize`

- **Type:** skill
- **Skill:** `feedback-pro`
- **Input:** Steps 1–4
- **Output:** `contract_feedback`, `security_notes`, `open_questions`.

## Notes

- For GraphQL-specific depth, combine with **`skills/graphql-pro`** when present in the project.
