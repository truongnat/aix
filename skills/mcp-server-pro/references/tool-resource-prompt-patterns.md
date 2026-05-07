# Tools, Resources, and Prompts

## Tools

Tools are the primary primitive. A tool is a function an agent can invoke with arguments and receive a structured result.

### Design rules

1. **One purpose per tool** — don't create a `do_everything` tool.
2. **JSON Schema for inputs** — strict, validated, documented.
3. **Structured outputs** — return text, images, or embedded resources; never raw stack traces.
4. **Idempotency where possible** — document if a tool is safe to retry.
5. **Side effects explicit** — name mutating tools clearly (`create_`, `delete_`, `update_`).

### Example

```typescript
// TypeScript SDK
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query_database',
      description: 'Execute a read-only SQL query against the analytics database.',
      inputSchema: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'Valid SELECT statement' },
          timeout_ms: { type: 'number', default: 5000 },
        },
        required: ['sql'],
      },
    },
  ],
}));
```

## Resources

Resources are data identified by URI that agents can read. Good for:

- Database schemas
- API documentation
- Configuration files
- Context documents

### Design rules

1. **URI template** — use RFC 6570 URI templates for parameterized access.
2. **Read-only default** — resources should not mutate state.
3. **MIME types** — declare `text/plain`, `application/json`, etc.

## Prompts

Prompts are reusable templates with parameter substitution. Good for:

- Standardizing agent instructions for a domain
- Multi-step reasoning patterns
- Structured output formats

### Design rules

1. **Parameter substitution** — use `{{param}}` or SDK-native templating.
2. **Versioning** — version prompt templates independently of server code.
3. **A/B testing** — serve different prompt versions as separate prompt names.
