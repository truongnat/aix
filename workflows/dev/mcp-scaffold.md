# Workflow: mcp-scaffold

## Metadata

| Field | Value |
|-------|-------|
| **id** | `mcp-scaffold` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `server_name` | Yes | Name of the MCP server |
| `transport` | Yes | stdio, sse, or streamable-http |
| `language` | Yes | TypeScript, Python, Java, or Kotlin |
| `primitives` | Yes | tools, resources, prompts (comma-separated) |
| `auth` | No | none, api-key, oauth2, or mtls |

## Steps

### Step 1 — define primitives

- **Type:** skill
- **Skill:** `mcp-server-pro`
- **Input:** `primitives`, use case description
- **Output:** Tool/resource/prompt definitions with JSON Schemas

### Step 2 — generate skeleton

- **Type:** skill
- **Skill:** `mcp-server-pro`
- **Input:** `server_name`, `transport`, `language`, primitives
- **Output:** Server scaffold (SDK boilerplate + handler stubs)

### Step 3 — implement handlers

- **Type:** skill
- **Skill:** `mcp-server-pro`
- **Input:** Skeleton + business logic requirements
- **Output:** Implemented tool/resource/prompt handlers

### Step 4 — add auth

- **Type:** skill
- **Skill:** `mcp-server-pro` + `auth-pro`
- **Input:** `auth` requirement
- **Output:** Auth middleware integrated into server

### Step 5 — test with Inspector

- **Type:** skill
- **Skill:** `mcp-server-pro`
- **Input:** Server implementation
- **Output:** Inspector validation report (connection, list, call, read)

### Step 6 — write programmatic tests

- **Type:** skill
- **Skill:** `mcp-server-pro` + `testing-pro`
- **Input:** All primitives, edge cases
- **Output:** Test suite with >80% primitive coverage

### Step 7 — deploy

- **Type:** skill
- **Skill:** `docker-pro` or `cloud-native-agent-pro`
- **Input:** Server code, deployment target
- **Output**: Deployed MCP server with health checks

## Outputs

| Artifact | Description |
|----------|-------------|
| MCP server scaffold | Boilerplate + handlers for all declared primitives |
| Test suite | Unit and integration tests with >80% primitive coverage |
| Deployment config | Docker/cloud config with health-check endpoint |
| Inspector validation report | Connection, list, call, and read results from MCP Inspector |
