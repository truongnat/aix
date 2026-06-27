---
name: mcp-server-pro
description: >
  Build, secure, and deploy Model Context Protocol (MCP) servers — the standard
  way to expose tools, resources, and prompts to AI agents.


  Use this skill when designing or implementing an MCP server, choosing
  transport (stdio / SSE / streamable HTTP), defining tool/resource/prompt
  primitives, adding authentication, or troubleshooting MCP integration
  failures.


  Do not use for general API design (use api-design-pro) or for consuming MCP as
  a client (use figma-mcp-pro or the client framework's docs).


  Triggers: "MCP server", "Model Context Protocol", "build MCP", "MCP tool",
  "MCP resource", "MCP prompt", "MCP transport", "MCP auth", "expose API to
  agents", "agent tooling", "MCP inspector", "MCP SDK", "server-sent events
  MCP", "stdio MCP".
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# MCP server development (professional)

Skill text is **English**; match the user's response language from Cursor User Rules / project rules when applicable.

Use the official [MCP specification](https://spec.modelcontextprotocol.io) and SDK docs (TypeScript, Python, Java, Kotlin) as authority. This skill encodes **server architecture patterns**, **transport selection**, **primitive design** (tools, resources, prompts), **security hardening**, and **testing discipline** for MCP servers. Confirm **transport**, **language SDK**, **auth requirements**, and **deployment target** before proposing a solution.

## Boundary

**`mcp-server-pro`** owns MCP **server architecture**, **primitive design** (tools, resources, prompts), **transport configuration** (stdio, SSE, streamable HTTP), **authentication/authorization**, **security sandboxing**, and **testing** (MCP Inspector, client simulation). It does **not** own general REST API design, client-side MCP consumption patterns, or non-MCP agent integrations.

| Skill | When to combine with **`mcp-server-pro`** |
|-------|-------------------------------------------|
| **`api-design-pro`** | When the MCP server wraps a broader HTTP API with versioning, pagination, idempotency |
| **`security-pro`** | Threat modeling, OAuth 2.1 hardening, audit logging, secret rotation |
| **`auth-pro`** | Identity federation, token lifecycle, mTLS for server-to-server MCP |
| **`docker-pro`** / **`ci-cd-pro`** | Packaging and deploying the MCP server |
| **`testing-pro`** | Regression tests for tool outputs, property-based testing of resource schemas |

## When to use

- Building a new MCP server to expose internal APIs, databases, or services to agents.
- Choosing between stdio, SSE, and streamable HTTP transport.
- Designing tools (functions agents can call), resources (data agents can read), or prompts (reusable templates).
- Adding OAuth 2.1, API-key, or mTLS authentication to an MCP server.
- Hardening MCP server sandboxing (permission scopes, input validation, rate limiting).
- Testing an MCP server with the MCP Inspector or programmatic client tests.
- Debugging MCP connection failures, transport mismatches, or tool execution errors.
- Trigger keywords: `MCP server`, `Model Context Protocol`, `build MCP`, `MCP tool`, `MCP resource`, `MCP transport`, `MCP auth`, `agent tooling`

## When not to use

- **General API design** without MCP context — use **`api-design-pro`**.
- **Client-side MCP consumption** (calling existing MCP servers from an app) — use the client SDK docs or **`figma-mcp-pro`** for design-to-code workflows.
- **Non-MCP agent integrations** (Function Calling, custom tool protocols) — use **`ai-integration-pro`**.
- **Database schema design** for the data behind an MCP resource — use **`postgresql-pro`** or **`sql-data-access-pro`**.

## Required inputs

- **Language / SDK** — TypeScript, Python, Java, or Kotlin MCP SDK.
- **Transport** — stdio (local), SSE (remote), or streamable HTTP (production).
- **Auth requirements** — none, API key, OAuth 2.1, or mTLS.
- **Deployment target** — local CLI, Docker container, Kubernetes, or serverless.

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** language/SDK, transport, auth requirements, and deployment target → verify: [stack documented].
2. **State assumptions** about client capabilities, network topology, and threat model (**Think Before Coding**).
3. **Apply** minimum primitive set first (tools only, no resources/prompts) unless justified (**Simplicity First**).
4. **Make surgical changes** — only define MCP primitives the request actually needs (**Surgical Changes**).
5. **Define success criteria**; loop until verified with MCP Inspector or client test (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm whether MCP is the right protocol. Don't force MCP where a simple REST API or function call suffices.
2. **Simplicity First** — Start with stdio + tools only. Add SSE, resources, and prompts only when the use case demands them.
3. **Surgical Changes** — Add only the primitives (tool/resource/prompt) and auth layer the request needs. Don't scaffold a full OAuth system for a local stdio server.
4. **Goal-Driven Execution** — Done = the server passes MCP Inspector validation, a client can list and call tools, and auth gates are verified.
5. **Transport dictates architecture** — stdio is local-only and simple; SSE enables remote but needs connection management; streamable HTTP is production-grade but requires HTTP infrastructure.
6. **Never trust the client** — Validate all tool inputs server-side. Rate-limit. Log. The MCP server is a trust boundary.
7. **Prefer declarative schemas** — Use JSON Schema for tool inputs and resource URIs. Avoid dynamic typing at the MCP boundary.

## Default recommendations by scenario

| Scenario | Default |
|----------|---------|
| Local CLI tool | **stdio** transport, no auth, tools only |
| Remote service for single tenant | **SSE** with API-key auth |
| Multi-tenant SaaS | **streamable HTTP** with OAuth 2.1 |
| Exposing a database | Tools for queries, **resources** for schema introspection |
| Reusable prompt templates | **Prompts** primitive with parameter substitution |
| Testing before deploy | **MCP Inspector** → programmatic client tests → CI |

## Decision trees

Summary: transport → auth → primitives → testing.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: over-engineering transport, dynamic typing at the boundary, missing input validation, leaking secrets in tool outputs, no auth on remote servers.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Architecture and transport (summary)

- stdio: parent-child process, stdin/stdout JSON-RPC. Simple, local-only.
- SSE: HTTP-based server-sent events for remote. Connection-per-client.
- Streamable HTTP: production-grade, supports headers, auth, load balancing.

Details: [references/architecture-and-transport.md](references/architecture-and-transport.md)

### Primitives — tools, resources, prompts (summary)

- **Tools**: Functions agents call with arguments; return structured results.
- **Resources**: Data URIs agents can read; good for schemas, configs, context.
- **Prompts**: Reusable templates with parameters; good for standardizing agent instructions.

Details: [references/tool-resource-prompt-patterns.md](references/tool-resource-prompt-patterns.md)

### Security and authentication (summary)

- OAuth 2.1 (MCP roadmap) for multi-tenant SaaS.
- API keys for single-tenant or internal.
- mTLS for service-to-service.
- Input validation, rate limiting, audit logging are mandatory.

Details: [references/security-and-auth.md](references/security-and-auth.md)

### Testing and MCP Inspector (summary)

- MCP Inspector for interactive validation.
- Programmatic client tests for CI.
- Schema validation for tool inputs and outputs.

Details: [references/testing-and-inspector.md](references/testing-and-inspector.md)

## Cross-skill handoffs

- **`api-design-pro`** — when the MCP server wraps a broader HTTP API; coordinate on versioning, pagination, idempotency.
- **`security-pro`** — for threat modeling, abuse scenarios, defense-in-depth controls beyond the MCP boundary.
- **`auth-pro`** — for identity federation, token lifecycle, SSO integration with MCP OAuth 2.1.
- **`docker-pro`** / **`ci-cd-pro`** — for packaging, deploying, and health-checking the MCP server.
- **`testing-pro`** — for regression test strategy, flaky test diagnosis, and CI integration.

Details: [references/integration-map.md](references/integration-map.md)

## Suggested response format (implement / review)

1. **Issue or goal** — What the user is building and why MCP is the right choice.
2. **Recommendation** — Transport, auth, primitive set, and SDK choice with rationale.
3. **Code** — Server skeleton, tool/resource/prompt definitions, auth middleware, and client test.
4. **Residual risks** — Security gaps, scaling limits, transport constraints, or auth incomplete.

## Resources in this skill

| Topic | File |
|-------|------|
| Architecture and transport comparison | [references/architecture-and-transport.md](references/architecture-and-transport.md) |
| Tools, resources, and prompts patterns | [references/tool-resource-prompt-patterns.md](references/tool-resource-prompt-patterns.md) |
| Security and authentication | [references/security-and-auth.md](references/security-and-auth.md) |
| Testing and MCP Inspector | [references/testing-and-inspector.md](references/testing-and-inspector.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

**Input:** "Build an MCP server that lets an agent query our Postgres database."
- Transport: **stdio** (local dev) or **SSE** (if remote access needed).
- Primitives: **tools** for `execute_query` and `list_tables`; **resource** for schema introspection.
- Auth: API key or connection-string env var; validate SQL before execution (read-only default).
- Testing: MCP Inspector to list tools → programmatic test with a known query → verify result shape.
- **Verify:** Server lists 2+ tools and 1+ resource; query tool returns structured JSON.

**Input (tricky):** "Our MCP server over SSE keeps dropping connections under load."
- Check transport choice: SSE is connection-per-client; consider **streamable HTTP** for load-balancer compatibility.
- Check auth: OAuth token expiry may force reconnects; verify refresh semantics.
- Check server-side: implement connection keep-alive, heartbeat, and graceful shutdown.
- **Verify:** Connection stability measured under concurrent load test.

**Input (cross-skill):** "Deploy our MCP server to production with OAuth and CI testing."
- Route auth architecture to **`auth-pro`** (OAuth 2.1 flow, token lifecycle).
- Route Docker/K8s packaging to **`docker-pro`** / **`deployment-pro`**.
- Route CI testing to **`testing-pro`** and **`ci-cd-pro`**.
- Keep **`mcp-server-pro`** ownership of the MCP primitive design and transport configuration.
- **Verify:** Each skill owns a clear slice; no duplicated auth advice.

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum solution (stdio + tools only) unless justified (Simplicity First)
- [ ] Only touched code directly related to the MCP server request (Surgical Changes)
- [ ] Success criteria defined and verified: server passes MCP Inspector or client test (Goal-Driven Execution)
- [ ] Transport chosen with explicit rationale (stdio vs SSE vs streamable HTTP)
- [ ] Primitives (tool/resource/prompt) justified — no speculative extras
- [ ] Input validation and rate limiting present for all tools
- [ ] Auth model matches deployment target (none / API key / OAuth 2.1 / mTLS)
- [ ] Secrets are never hardcoded; sourced from env or secret manager
- [ ] Testing steps documented: Inspector → programmatic → CI
- [ ] Residual risks called out rather than hidden
