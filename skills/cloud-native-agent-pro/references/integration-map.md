# Cloud-Native Agent Integration Map

## ai-integration-pro

- **When**: Designing the agent logic that runs on K8s.
- **Ownership split**:
  - `cloud-native-agent-pro`: Infrastructure, deployment, scaling.
  - `ai-integration-pro`: Agent logic, prompts, tools, RAG.

## docker-pro

- **When**: Building container images for agents.
- **Ownership split**:
  - `cloud-native-agent-pro`: K8s deployment and orchestration.
  - `docker-pro`: Dockerfile, multi-stage build, image optimization.

## mcp-server-pro

- **When**: Deploying MCP servers as K8s services.
- **Ownership split**:
  - `cloud-native-agent-pro`: K8s Service discovery and networking.
  - `mcp-server-pro`: MCP server design, transport, auth.

## infrastructure-as-code-pro

- **When**: Managing K8s manifests with IaC tools.
- **Ownership split**:
  - `cloud-native-agent-pro`: What to deploy and why.
  - `infrastructure-as-code-pro`: Terraform / Pulumi / Helm implementation.

## network-infra-pro

- **When**: Designing service mesh or ingress for agents.
- **Ownership split**:
  - `cloud-native-agent-pro`: Agent-specific networking needs.
  - `network-infra-pro`: Service mesh, ingress, TLS termination.
