# MCP Server Integration Map

## When to combine with other skills

### api-design-pro

- **When**: The MCP server wraps a broader HTTP API.
- **Ownership split**:
  - `mcp-server-pro`: MCP primitives, transport, auth at the MCP boundary.
  - `api-design-pro`: REST endpoint design, pagination, versioning, idempotency, rate limiting at the HTTP layer.

### security-pro

- **When**: Threat modeling, penetration testing, defense-in-depth.
- **Ownership split**:
  - `mcp-server-pro`: Input validation, auth middleware, audit logging at the MCP boundary.
  - `security-pro`: Broader threat model, abuse scenarios, infrastructure hardening.

### auth-pro

- **When**: OAuth 2.1, identity federation, SSO, token lifecycle.
- **Ownership split**:
  - `mcp-server-pro`: OAuth 2.1 integration into the MCP server (endpoints, scopes).
  - `auth-pro`: Identity architecture, token rotation, federation protocols, break-glass.

### docker-pro / deployment-pro

- **When**: Packaging and deploying the MCP server.
- **Ownership split**:
  - `mcp-server-pro`: Server code, health checks, graceful shutdown.
  - `docker-pro`: Dockerfile, multi-stage build, image scanning.
  - `deployment-pro`: Rollout strategy, canary, rollback.

### testing-pro / ci-cd-pro

- **When**: Regression testing, CI integration.
- **Ownership split**:
  - `mcp-server-pro`: MCP Inspector validation, client integration tests.
  - `testing-pro`: Test pyramid, flaky test diagnosis, property-based testing.
  - `ci-cd-pro`: Pipeline config, test gates, artifact publishing.
