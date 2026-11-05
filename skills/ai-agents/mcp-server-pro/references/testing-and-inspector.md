# Testing MCP Servers

## MCP Inspector

The official [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is the fastest way to validate a server interactively.

### Usage

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

### What to test

1. **Connection** — server starts, Inspector connects, protocol version matches.
2. **List tools** — all expected tools are listed with correct schemas.
3. **Call tool** — invoke each tool with valid and invalid inputs; verify outputs.
4. **List resources** — URI templates resolve correctly.
5. **Read resource** — content matches expected MIME type and structure.
6. **List prompts** — prompt templates are listed with parameters.
7. **Get prompt** — substitution works, output is well-formed.

## Programmatic tests

Use the client SDK to write automated tests.

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

async function testTool() {
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  // ... connect server to serverTransport
  await client.connect(clientTransport);
  const tools = await client.listTools();
  // assert tools.length > 0, schemas valid, etc.
}
```

## CI pipeline

1. **Lint** — TypeScript / Python type checking.
2. **Unit tests** — business logic independent of MCP transport.
3. **Integration tests** — start server, connect client, exercise all primitives.
4. **Schema validation** — verify all JSON Schemas are valid.
5. **Security scan** — dependency audit, secret detection.
