# A2A Integration Map

## mcp-server-pro

- **When**: Each agent needs MCP tool access.
- **Ownership split**:
  - `a2a-protocol-pro`: Agent coordination, task delegation.
  - `mcp-server-pro`: Tool design, transport, auth for each agent's tools.

## ai-integration-pro

- **When**: Designing the LLM and reasoning inside each agent.
- **Ownership split**:
  - `a2a-protocol-pro`: Inter-agent communication.
  - `ai-integration-pro`: Intra-agent reasoning, prompts, RAG.

## api-design-pro

- **When**: A2A interacts with broader HTTP APIs.
- **Ownership split**:
  - `a2a-protocol-pro`: A2A protocol implementation.
  - `api-design-pro`: REST/GraphQL API design for non-agent endpoints.

## security-pro

- **When**: Threat modeling multi-agent attack surface.
- **Ownership split**:
  - `a2a-protocol-pro`: A2A auth, capability scoping.
  - `security-pro`: Infrastructure hardening, pentesting, abuse scenarios.
