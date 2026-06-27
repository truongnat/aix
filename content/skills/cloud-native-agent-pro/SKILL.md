---
name: cloud-native-agent-pro
description: >
  Deploy, scale, and operate AI agents on Kubernetes and cloud-native
  infrastructure: agent CRDs, MCP server deployment, eBPF observability, Wasm
  edge inference, and agent scaling patterns.


  Use this skill when deploying agents to Kubernetes, designing agent
  infrastructure as code, scaling agent workloads, or integrating agents with
  cloud-native platforms (Kagent, AgentCube, Volcano).


  Do not use for local agent development (use ai-integration-pro) or for general
  Kubernetes ops (use docker-pro or infrastructure-as-code-pro).


  Triggers: "deploy agent", "kubernetes agent", "agent infrastructure", "agent
  at scale", "K8s agent", "agent CRD", "agent scaling", "Wasm agent", "edge
  inference", "eBPF agent", "cloud native AI", "agent orchestration K8s",
  "AgentCube", "kagent".
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

# Cloud-native agent infrastructure (professional)

Skill text is **English**; match the user's response language from Cursor User Rules / project rules when applicable.

Use [Kagent](https://kagent.dev), [AgentCube](https://www.oreateai.com/blog/agentcube), [Kubernetes](https://kubernetes.io), and [eBPF](https://ebpf.io) documentation as authority. This skill encodes **agent deployment on Kubernetes**, **CRD design**, **scaling patterns**, **Wasm edge inference**, and **eBPF observability** for agent workloads. Confirm **cluster version**, **agent framework**, **traffic patterns**, and **compliance requirements** before proposing infrastructure.

## Boundary

**`cloud-native-agent-pro`** owns **agent deployment on Kubernetes**, **agent CRDs**, **scaling/scheduling**, **MCP server deployment as K8s services**, **Wasm edge inference**, and **eBPF observability**. It does **not** own local agent development, general Kubernetes operations without agent context, or non-K8s deployment — combine with **`ai-integration-pro`**, **`docker-pro`**, **`infrastructure-as-code-pro`**, and **`mcp-server-pro`** as needed.

| Skill | When to combine with **`cloud-native-agent-pro`** |
|-------|-----------------------------------------------------|
| **`ai-integration-pro`** | When designing the agent logic that runs on K8s |
| **`docker-pro`** | When building container images for agents |
| **`mcp-server-pro`** | When deploying MCP servers as K8s services |
| **`infrastructure-as-code-pro`** | When managing K8s manifests with IaC tools |
| **`network-infra-pro`** | When designing service mesh or ingress for agents |

## When to use

- Deploying AI agents to Kubernetes (Kagent, AgentCube, or custom).
- Designing agent Custom Resources (CRDs) for K8s.
- Scaling agent workloads horizontally or vertically.
- Deploying MCP servers as K8s services with service discovery.
- Running Wasm-based agents for edge inference.
- Adding eBPF-based observability for agent performance and security.
- Designing agent infrastructure for multi-tenant SaaS.
- Trigger keywords: `deploy agent`, `kubernetes agent`, `agent infrastructure`, `agent at scale`, `K8s agent`, `agent CRD`, `Wasm agent`

## When not to use

- **Local agent development** (prompts, tools, debugging) — use **`ai-integration-pro`**.
- **General Kubernetes operations** (pods, services, ingress without agent context) — use **`docker-pro`** or **`infrastructure-as-code-pro`**.
- **Non-K8s deployment** (VMs, serverless without K8s) — use **`deployment-pro`**.

## Required inputs

- **Cluster version** — Kubernetes version, managed or self-hosted.
- **Agent framework** — Kagent, custom, LangGraph, CrewAI, etc.
- **Traffic patterns** — request rate, burstiness, concurrency.
- **Compliance** — SOC2, GDPR, HIPAA (affects observability and data handling).

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** cluster version, agent framework, traffic patterns, and compliance → verify: [constraints documented].
2. **State assumptions** about scaling needs, fault tolerance, and data residency (**Think Before Coding**).
3. **Apply** minimum K8s deployment first (Deployment + Service); add CRDs or operators only when justified (**Simplicity First**).
4. **Make surgical changes** — only add infrastructure the request needs (**Surgical Changes**).
5. **Define success criteria**; loop until verified with load test or health check (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm that Kubernetes is the right platform. A serverless function or VM may be simpler for low-traffic agents.
2. **Simplicity First** — Start with a standard K8s Deployment + Service. Add operators, CRDs, or service mesh only when scaling demands it.
3. **Surgical Changes** — Add only the infrastructure components the request requires. Don't deploy a full service mesh for a single-agent PoC.
4. **Goal-Driven Execution** — Done = agent deploys successfully, scales under load, and is observable.
5. **Agents are workloads, not pets** — Design for horizontal scaling, rolling updates, and graceful shutdown. Agents should be stateless or use external state stores.
6. **MCP servers are services** — Deploy MCP servers as K8s Services with stable DNS names. Agents discover them via K8s service discovery.
7. **Observability is not optional** — eBPF for kernel-level tracing, Prometheus for metrics, Jaeger for distributed tracing.

## Default recommendations by scenario

| Scenario | Default |
|----------|---------|
| Single agent PoC | K8s Deployment + Service, no operator |
| Multi-agent production | Kagent or AgentCube operator, HorizontalPodAutoscaler |
| MCP server fleet | Each MCP server as a separate K8s Service; agents connect via DNS |
| Edge / low-latency | Wasm runtime (Wasmtime/WasmEdge) on edge nodes |
| Multi-tenant SaaS | Namespace-per-tenant, NetworkPolicy, resource quotas |

## Decision trees

Summary: scale → pattern → deployment → observability.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: stateful agents without external state, no resource limits, missing health checks, deploying without observability, tight coupling to a single node.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Agent deployment patterns (summary)

- **Deployment**: standard K8s Deployment for stateless agents.
- **StatefulSet**: for agents with stable network identity or local storage.
- **Job / CronJob**: for batch agent workloads.
- **DaemonSet**: for node-level agent agents (e.g., observability collectors).

Details: [references/agent-deployment-patterns.md](references/agent-deployment-patterns.md)

### Scaling and scheduling (summary)

- HPA based on CPU, memory, or custom metrics (request queue depth).
- Cluster autoscaler for node-level scaling.
- Volcano / AgentCube for batch and HPC-style agent scheduling.

Details: [references/scaling-and-scheduling.md](references/scaling-and-scheduling.md)

### Wasm edge inference (summary)

- Wasm modules for lightweight, portable agent inference.
- WasmEdge or Wasmtime as runtime.
- Good for edge nodes, IoT, or low-latency requirements.

Details: [references/wasm-edge-inference.md](references/wasm-edge-inference.md)

## Cross-skill handoffs

- **`ai-integration-pro`** — when designing the agent logic that runs on K8s.
- **`docker-pro`** — when building container images for agents.
- **`mcp-server-pro`** — when deploying MCP servers as K8s services.
- **`infrastructure-as-code-pro`** — when managing K8s manifests with Terraform, Pulumi, or Helm.
- **`network-infra-pro`** — when designing service mesh or ingress for agents.

Details: [references/integration-map.md](references/integration-map.md)

## Suggested response format (implement / review)

1. **Issue or goal** — What agent infrastructure needs to be built.
2. **Recommendation** — K8s pattern, deployment manifest, scaling config, and observability stack.
3. **Code** — K8s YAML, Dockerfile, HPA config, and monitoring setup.
4. **Residual risks** — Scaling limits, data residency, vendor lock-in, cold start latency.

## Resources in this skill

| Topic | File |
|-------|------|
| Agent deployment patterns | [references/agent-deployment-patterns.md](references/agent-deployment-patterns.md) |
| Scaling and scheduling | [references/scaling-and-scheduling.md](references/scaling-and-scheduling.md) |
| Wasm edge inference | [references/wasm-edge-inference.md](references/wasm-edge-inference.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

**Input:** "Deploy our customer support agent to Kubernetes with auto-scaling."
- K8s Deployment with 2 replicas minimum.
- HPA based on custom metric: request queue depth > 10 → scale up.
- MCP servers for CRM and ticket system deployed as separate Services.
- Prometheus + Grafana for metrics; Jaeger for distributed tracing.
- **Verify:** Load test shows scaling from 2 to 6 replicas; MCP services discoverable.

**Input (tricky):** "Our Wasm agent crashes on edge nodes with limited memory."
- Profile Wasm module memory usage; reduce buffer sizes.
- Use Wasmtime's resource limiter to enforce max memory per module.
- Consider splitting agent into smaller Wasm modules (micro-agent pattern).
- **Verify:** Agent runs within 128MB limit on edge node.

**Input (cross-skill):** "Build a complete K8s platform for our multi-agent system."
- **`cloud-native-agent-pro`**: K8s infrastructure, scaling, MCP service discovery.
- **`a2a-protocol-pro`**: Multi-agent orchestration and task lifecycle.
- **`mcp-server-pro`**: MCP servers for tools and resources.
- **`docker-pro`** / **`infrastructure-as-code-pro`**: Container builds and IaC.
- **Verify:** Each skill owns a clear slice; infrastructure supports agent patterns.

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum K8s deployment; added complexity only when justified (Simplicity First)
- [ ] Only added infrastructure directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified with load test or health check (Goal-Driven Execution)
- [ ] Agent is stateless or uses external state store (Redis, Postgres, S3)
- [ ] Resource limits and requests are defined
- [ ] Health checks (liveness, readiness) are configured
- [ ] Observability stack is defined (metrics, logs, traces)
- [ ] MCP servers are discoverable via K8s DNS
- [ ] Scaling config is tested under load
- [ ] Residual risks called out: scaling limits, cold starts, data residency
