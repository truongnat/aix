# MCP Server Anti-patterns

## 1. God tool

**Symptom**: One `execute` tool that takes a raw string and does anything.
**Fix**: Split into focused tools with strict JSON Schema inputs.

## 2. Dynamic typing at the boundary

**Symptom**: Tool inputs declared as `type: 'object'` with no properties.
**Fix**: Every tool input must have a complete JSON Schema with `required`, `types`, and `descriptions`.

## 3. No auth on remote transport

**Symptom**: SSE or HTTP server with `auth: false`.
**Fix**: Remote transports require auth. Use API keys minimum; OAuth 2.1 for SaaS.

## 4. Leaking secrets in tool outputs

**Symptom**: Tool result includes connection strings, tokens, or env vars.
**Fix**: Redact secrets in tool outputs. Log separately with audit controls.

## 5. Missing input validation

**Symptom**: Tool accepts raw SQL or shell commands without sanitization.
**Fix**: Validate all inputs against JSON Schema. Use parameterized queries. Never trust the client.

## 6. Over-engineering transport

**Symptom**: Using streamable HTTP for a local CLI tool.
**Fix**: Match transport to use case. stdio for local, SSE for remote internal, streamable HTTP for production SaaS.

## 7. Tight coupling to a single client

**Symptom**: Server assumes Cursor or Claude Desktop specific behavior.
**Fix**: Follow the MCP spec strictly. Test with multiple clients (Inspector, Claude Desktop, custom).
