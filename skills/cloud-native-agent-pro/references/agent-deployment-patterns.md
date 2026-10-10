# Agent Deployment Patterns

## Deployment

Standard K8s Deployment for stateless agents.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: support-agent
spec:
  replicas: 2
  selector:
    matchLabels:
      app: support-agent
  template:
    metadata:
      labels:
        app: support-agent
    spec:
      containers:
      - name: agent
        image: support-agent:1.0.0
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## StatefulSet

For agents requiring stable network identity or persistent local storage.

## Job / CronJob

For batch agent workloads (e.g., nightly report generation).

## DaemonSet

For node-level agents (e.g., observability collectors, eBPF sidecars).

## MCP server as Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: crm-mcp-server
spec:
  selector:
    app: crm-mcp-server
  ports:
  - port: 3000
    targetPort: 3000
```

Agents connect via `http://crm-mcp-server:3000`.
