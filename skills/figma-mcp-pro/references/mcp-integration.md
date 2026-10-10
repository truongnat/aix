# MCP Figma Server Integration

## Setup

The MCP Figma server provides programmatic access to Figma files without manual design-to-code workflows.

### Required Configuration

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropics/mcp-server-figma"],
      "env": {
        "FIGMA_API_TOKEN": "<your-token>"
      }
    }
  }
}
```

### Capabilities

- `get_file(file_id)` — Access Figma file structure
- `get_node(file_id, node_id)` — Extract specific component/frame
- `get_component_set(file_id)` — Access design system components
- `get_variables(file_id)` — Extract design tokens
- `search_design_system(file_id, query)` — Find existing components

## Authentication

1. Generate Figma personal access token from **Settings → Developer tokens**
2. Provide token to MCP server via `FIGMA_API_TOKEN` environment variable
3. Tokens expire after 90 days — rotate regularly

## Common Operations

### List all components in file
```
get_component_set(file_id="...")
```

### Extract a specific frame
```
get_node(file_id="...", node_id="456:789")
```

### Get design variables
```
get_variables(file_id="...")
```

## Error Handling

- **No access**: Verify token and file sharing permissions
- **Rate limits**: Implement exponential backoff (50 calls/sec)
- **Expired token**: Rotate token and restart MCP server
