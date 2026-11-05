# MCP Security and Authentication

## Threat model

The MCP server is a **trust boundary**. Any connected agent can invoke tools, read resources, and use prompts. Treat the MCP server like any production API.

## Authentication options

### 1. None (stdio only)

- Acceptable for local desktop tools where the OS process boundary is the trust boundary.
- **Never** use no auth for remote SSE or HTTP transports.

### 2. API Key

- Simple header-based auth (`Authorization: Bearer <key>`).
- Suitable for single-tenant or internal services.
- Rotate keys regularly; store in secret manager, never in code.

### 3. OAuth 2.1 (MCP roadmap priority)

- Standard for multi-tenant SaaS.
- MCP spec is adding built-in OAuth 2.1 support.
- Implement: authorization endpoint, token endpoint, refresh, revoke.
- Scope MCP primitives per OAuth scope (e.g., `tools:read`, `resources:write`).

### 4. mTLS

- Mutual TLS for service-to-service MCP.
- Common in Kubernetes or mesh environments.
- Certificates managed via cert-manager or SPIFFE/SPIRE.

## Input validation

- **JSON Schema validation** on all tool inputs before execution.
- **SQL injection prevention** — use parameterized queries; never concatenate user input.
- **Command injection prevention** — sanitize shell arguments; prefer library APIs.
- **Rate limiting** — per-client, per-tool, with exponential backoff.

## Sandboxing

- Run MCP servers in isolated processes or containers.
- File system access: read-only mounts, chroot, or ephemeral volumes.
- Network access: egress allow-list, no inbound except the MCP transport port.
- Resource limits: CPU, memory, file descriptors.

## Audit logging

- Log every tool invocation: client identity, tool name, arguments (redact PII), result status, latency.
- Retain logs per compliance requirements (SOC2, GDPR, HIPAA).
- Export to SIEM for anomaly detection.
